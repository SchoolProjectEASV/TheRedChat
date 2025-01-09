import { Injectable } from '@angular/core';
import * as signalR from '@microsoft/signalr';
import { BehaviorSubject, Observable, from } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { Message } from '../models/message.model';
import { EncryptionService } from './encryption.service';
import { map, switchMap } from 'rxjs/operators';
import { AuthService } from './auth.service';


@Injectable({
  providedIn: 'root',
})
export class ChatService {
  private hubConnection: signalR.HubConnection | null = null;
  public messages$: BehaviorSubject<Message[]> = new BehaviorSubject<Message[]>([]);

  constructor(
    private http: HttpClient,
    private encryptionService: EncryptionService,
    private authService: AuthService
  ) {}

  startConnection(token: string) {
    this.hubConnection = new signalR.HubConnectionBuilder()
      .withUrl('http://localhost:8080/chathub', {
        accessTokenFactory: () => token,
        withCredentials: true,
      })
      .withAutomaticReconnect()
      .build();

    this.hubConnection
      .start()
      .then(() => console.log('Connection started'))
      .catch((err) => console.error('Error starting connection:', err));

    this.registerOnServerEvents();
  }

  stopConnection() {
    this.hubConnection?.stop().then(() => console.log('Connection stopped'));
  }

  getMessagesWithFriend(friendId: string): Observable<Message[]> {
    return this.http.get<Message[]>(`http://localhost:8080/api/messages/${friendId}`).pipe(
      switchMap(async (messages) => {
        console.log('Raw messages from server:', messages);
        
        const decryptedMessages = await Promise.all(
          messages.map(async (msg) => {
            try {
              console.log('Attempting to decrypt message:', msg);
              const decryptedContent = await this.encryptionService.decryptMessage(msg.content);
              return {
                ...msg,
                content: decryptedContent
              };
            } catch (error) {
              console.error(`Failed to decrypt message ${msg.Id}:`, error);
              return {
                ...msg,
                content: '[Failed to decrypt message]'
              };
            }
          })
        );
        
        console.log('Decrypted messages:', decryptedMessages);
        return decryptedMessages;
      }),
      from
    );
}

private registerOnServerEvents() {
  if (!this.hubConnection) return;

  this.hubConnection.on('ReceiveMessage', async (senderId: string, receiverId: string, content: string, sentAt: string) => {
    console.log('Received new message:', { senderId, receiverId, content, sentAt });
    
    try {
      const decryptedContent = await this.encryptionService.decryptMessage(content);
      console.log('Decrypted new message:', decryptedContent);
      
      const newMessage: Message = {
        senderId,
        content: decryptedContent,
        sentAt: new Date(sentAt),
        receiverId
      };
      
      const currentMessages = this.messages$.value;
      this.messages$.next([...currentMessages, newMessage]);
    } catch (err) {
      console.error('Error processing received message:', err);
      const newMessage: Message = {
        senderId,
        content: '[Failed to decrypt message]',
        sentAt: new Date(sentAt),
        receiverId
      };
      const currentMessages = this.messages$.value;
      this.messages$.next([...currentMessages, newMessage]);
    }
  });
}

async sendMessage(receiverId: string, content: string) {
  if (!this.hubConnection) {
    console.error('Connection is not established.');
    return;
  }

  try {
    const senderId = this.authService.getUserId();
    const encryptedContent = await this.encryptionService.encryptMessage(
        content, 
        receiverId,
        senderId
    );
    
    await this.hubConnection.invoke('SendMessage', receiverId, encryptedContent);
  } catch (err) {
    console.error('Error sending encrypted message:', err);
    throw err;
  }
}
}