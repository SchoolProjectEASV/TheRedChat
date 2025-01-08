import { Injectable } from '@angular/core';
import * as signalR from '@microsoft/signalr';
import { BehaviorSubject, Observable } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { Message } from '../models/message.model'



@Injectable({
  providedIn: 'root',
})
export class ChatService {
  private hubConnection: signalR.HubConnection | null = null;
  public messages$: BehaviorSubject<Message[]> = new BehaviorSubject<Message[]>([]);

  constructor(private http: HttpClient) {}

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
    return this.http.get<Message[]>(`http://localhost:8080/api/messages/${friendId}`);
  }

  sendMessage(receiverId: string, content: string) {
    if (!this.hubConnection) {
      console.error('Connection is not established.');
      return;
    }
    this.hubConnection
      .invoke('SendMessage', receiverId, content)
      .catch((err) => console.error('Error sending message:', err));
  }

  private registerOnServerEvents() {
    if (!this.hubConnection) return;

    this.hubConnection.on('ReceiveMessage', (senderId: string, receiverId: string, content: string, sentAt: string) => {
      const newMessage: Message = { senderId, content, sentAt: new Date(sentAt), receiverId };
      this.messages$.next([...this.messages$.value, newMessage]);
    });
  }
}
