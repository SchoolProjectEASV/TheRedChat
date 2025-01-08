import { Injectable } from '@angular/core';
import * as signalR from '@microsoft/signalr';
import { BehaviorSubject, Observable, from } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { Message } from '../models/message.model';
import { EncryptionService } from './encryption.service';
import { map, switchMap } from 'rxjs/operators';

@Injectable({
  providedIn: 'root',
})
export class ChatService {
  private hubConnection: signalR.HubConnection | null = null;
  public messages$: BehaviorSubject<Message[]> = new BehaviorSubject<Message[]>([]);

  constructor(
    private http: HttpClient,
    private encryptionService: EncryptionService
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
        const decryptedMessages = await Promise.all(
          messages.map(async (msg) => ({
            ...msg,
            content: await this.encryptionService.decryptMessage(msg.content)
          }))
        );
        return decryptedMessages;
      }),
      from
    );
  }

  async sendMessage(receiverId: string, content: string) {
    if (!this.hubConnection) {
      console.error('Connection is not established.');
      return;
    }

    try {
      const encryptedContent = await this.encryptionService.encryptMessage(content, receiverId);
      
      await this.hubConnection.invoke('SendMessage', receiverId, encryptedContent);
    } catch (err) {
      console.error('Error sending encrypted message:', err);
      throw err;
    }
  }

  private registerOnServerEvents() {
    if (!this.hubConnection) return;

    this.hubConnection.on('ReceiveMessage', async (senderId: string, receiverId: string, content: string, sentAt: string) => {
      try {
        const decryptedContent = await this.encryptionService.decryptMessage(content);
        
        const newMessage: Message = {
          senderId,
          content: decryptedContent,
          sentAt: new Date(sentAt),
          receiverId
        };
        
        this.messages$.next([...this.messages$.value, newMessage]);
      } catch (err) {
        console.error('Error decrypting received message:', err);
      }
    });
  }
}