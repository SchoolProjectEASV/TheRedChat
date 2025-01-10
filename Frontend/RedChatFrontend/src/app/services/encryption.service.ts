import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import * as forge from 'node-forge';

/**
 * The encrpyion service is responsible for handling end-to-end encryption operations in the application.
 * Implements RSA key pair generation and management, along with hybrid encryption using
 * RSA for key exchange and AES-GCM for message encryption. We followed OWASP recommended guides on bit key sizes in both RSA and AES. https://cheatsheetseries.owasp.org/cheatsheets/Cryptographic_Storage_Cheat_Sheet.html
 */

@Injectable({
  providedIn: 'root'
})
export class EncryptionService {
  private privateKey: forge.pki.rsa.PrivateKey | null = null;
  private friendsPublicKeys: Map<string, forge.pki.rsa.PublicKey> = new Map();

  constructor(private http: HttpClient) {}

    /**
   * Generates a new RSA key pair for secure communication.
   * Uses a 4096-bit key size for enhanced security, based on OWASP recoomendations.
   * 
   * @returns An object containing both private and public keys in PEM format
   */

  generateNewKeyPair(): { privateKeyPem: string, publicKeyPem: string } {
    const keyPair = forge.pki.rsa.generateKeyPair({ bits: 4096, workers: -1 });
    
    const privateKeyPem = forge.pki.privateKeyToPem(keyPair.privateKey);
    const publicKeyPem = forge.pki.publicKeyToPem(keyPair.publicKey);

    return {
      privateKeyPem,
      publicKeyPem
    };
  }

    /**
   * Initializes the service with a user's private key.
   * This method should be called before attempting any decryption operations.
   * The private key does NOT get stored anywhere, but just gets initialized with the service that uses it.
   * 
   * @param privateKeyPem - The private key in PEM format
   * @returns boolean indicating whether the initialization was successful
   */

  initializeWithPrivateKey(privateKeyPem: string): boolean {
    try {
      this.privateKey = forge.pki.privateKeyFromPem(privateKeyPem);
      return true;
    } catch (error) {
      console.error('Failed to initialize with private key:', error);
      return false;
    }
  }

    /**
   * Retrieves and caches a friend's public key from the server.
   * If the key is already cached, returns it from the cache instead.
   * 
   * @param friendId - GUID of the friend.
   * @returns Promise resolving to the friend's public key
   */

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


  /**
   * Encrypts a message using a hybrid encryption scheme (RSA + AES-GCM, as the AES-GCM model is recommneded by OWASP), where we both use assymetric encryption, and symetric encryption.
   * The message is encrypted with AES-GCM, and the AES key is encrypted with both
   * recipient's and sender's public keys for two-way access. The AES key is encrypted with a bit size of 256, as that is the most ideal per OWASP. 
   * 
   * @param message - The plaintext message to encrypt
   * @param recipientId - The ID of the message recipient
   * @param senderId - The ID of the message sender
   * @returns Promise resolving to the encrypted message string
   */

  async encryptMessage(message: string, recipientId: string, senderId: string): Promise<string> {
    const recipientPublicKey = await this.getFriendPublicKey(recipientId);
    const senderPublicKey = await this.getFriendPublicKey(senderId);

    const aesKey = forge.random.getBytesSync(32);
    const iv = forge.random.getBytesSync(16);

    const cipher = forge.cipher.createCipher('AES-GCM', aesKey);
    cipher.start({
      iv: iv,
      tagLength: 128 
    });
    cipher.update(forge.util.createBuffer(message, 'utf8'));
    cipher.finish();
    
    const encryptedMessage = cipher.output.getBytes();
    const tag = cipher.mode.tag.getBytes();

    const recipientEncryptedKey = recipientPublicKey.encrypt(aesKey);
    const senderEncryptedKey = senderPublicKey.encrypt(aesKey);

    const combined = [
      forge.util.encode64(iv),
      forge.util.encode64(recipientEncryptedKey),
      forge.util.encode64(senderEncryptedKey),
      forge.util.encode64(encryptedMessage),
      forge.util.encode64(tag)
    ].join('|');

    return combined;
  }

    /**
   * Decrypts a message that was encrypted using the hybrid encryption.
   * Attempts to decrypt the AES key using the private key, then uses the
   * decrypted AES key to decrypt the message.
   * 
   * @param encryptedData - The encrypted message string
   * @returns Promise resolving to the decrypted message
   * @throws Error if private key is not initialized or decryption fails
   */

  async decryptMessage(encryptedData: string): Promise<string> {
    if (!this.privateKey) {
      throw new Error('Private key not provided. Please input your private key.');
    }

    try {
      const [iv64, recipientKey64, senderKey64, message64, tag64] = encryptedData.split('|');
      
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
      const decodedTag = forge.util.decode64(tag64);

      const decipher = forge.cipher.createDecipher('AES-GCM', aesKey);
      decipher.start({
        iv: decodedIv,
        tagLength: 128,
        tag: forge.util.createBuffer(decodedTag)
      });
      decipher.update(forge.util.createBuffer(decodedMessage));
      
      if (!decipher.finish()) {
        throw new Error('Failed to decrypt message: Authentication failed');
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

   /**
   * Validates a private key by attempting to parse it.
   * 
   * @param privateKeyPem - The private key in PEM format to validate
   * @returns boolean indicating whether the private key is valid
   */

  validatePrivateKey(privateKeyPem: string): boolean {
    try {
      forge.pki.privateKeyFromPem(privateKeyPem);
      return true;
    } catch {
      return false;
    }
  }
}