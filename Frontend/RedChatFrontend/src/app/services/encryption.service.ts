import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import * as forge from 'node-forge';

@Injectable({
  providedIn: 'root'
})
export class EncryptionService {
  private privateKey: forge.pki.rsa.PrivateKey | null = null;
  private friendsPublicKeys: Map<string, forge.pki.rsa.PublicKey> = new Map();

  constructor(private http: HttpClient) {}

  generateNewKeyPair(): { privateKeyPem: string, publicKeyPem: string } {
    const keyPair = forge.pki.rsa.generateKeyPair({ bits: 2048, workers: -1 });
    
    const privateKeyPem = forge.pki.privateKeyToPem(keyPair.privateKey);
    const publicKeyPem = forge.pki.publicKeyToPem(keyPair.publicKey);

    return {
      privateKeyPem,
      publicKeyPem
    };
  }

  initializeWithPrivateKey(privateKeyPem: string): boolean {
    try {
      this.privateKey = forge.pki.privateKeyFromPem(privateKeyPem);
      return true;
    } catch (error) {
      console.error('Failed to initialize with private key:', error);
      return false;
    }
  }

  async getFriendPublicKey(friendId: string): Promise<forge.pki.rsa.PublicKey> {
    if (this.friendsPublicKeys.has(friendId)) {
      return this.friendsPublicKeys.get(friendId)!;
    }

    const response = await firstValueFrom(
      this.http.get<{ publicKey: string }>(`http://localhost:8080/api/auth/keys/${friendId}`)
    );

    const publicKey = forge.pki.publicKeyFromPem(response.publicKey);
    this.friendsPublicKeys.set(friendId, publicKey);
    return publicKey;
  }

async encryptMessage(message: string, recipientId: string, senderId: string): Promise<string> {
  const recipientPublicKey = await this.getFriendPublicKey(recipientId);
  const senderPublicKey = await this.getFriendPublicKey(senderId);

  const aesKey = forge.random.getBytesSync(32);
  const iv = forge.random.getBytesSync(16);

  const cipher = forge.cipher.createCipher('AES-CBC', aesKey);
  cipher.start({iv: iv});
  cipher.update(forge.util.createBuffer(message, 'utf8'));
  cipher.finish();
  
  const encryptedMessage = cipher.output.getBytes();

  const recipientEncryptedKey = recipientPublicKey.encrypt(aesKey);
  const senderEncryptedKey = senderPublicKey.encrypt(aesKey);

  const combined = [
      forge.util.encode64(iv),
      forge.util.encode64(recipientEncryptedKey),
      forge.util.encode64(senderEncryptedKey),
      forge.util.encode64(encryptedMessage)
  ].join('|');

  return combined;
}

async decryptMessage(encryptedData: string): Promise<string> {
  if (!this.privateKey) {
      throw new Error('Private key not provided. Please input your private key.');
  }

  try {
      const [iv64, recipientKey64, senderKey64, message64] = encryptedData.split('|');
      
      let aesKey;
      try {
          const decodedRecipientKey = forge.util.decode64(recipientKey64);
          aesKey = this.privateKey.decrypt(decodedRecipientKey);
      } catch {
          try {
              const decodedSenderKey = forge.util.decode64(senderKey64);
              aesKey = this.privateKey.decrypt(decodedSenderKey);
          } catch {
              throw new Error('Could not decrypt message with either key');
          }
      }

      const decodedIv = forge.util.decode64(iv64);
      const decodedMessage = forge.util.decode64(message64);

      const decipher = forge.cipher.createDecipher('AES-CBC', aesKey);
      decipher.start({iv: decodedIv});
      decipher.update(forge.util.createBuffer(decodedMessage));
      
      if (!decipher.finish()) {
          throw new Error('Failed to decrypt message');
      }

      return decipher.output.toString();
  } catch (error) {
      console.error('Decryption error:', error);
      throw new Error('Failed to decrypt message');
  }
}

  isInitialized(): boolean {
    return this.privateKey !== null;
  }

  validatePrivateKey(privateKeyPem: string): boolean {
    try {
      forge.pki.privateKeyFromPem(privateKeyPem);
      return true;
    } catch {
      return false;
    }
  }
}