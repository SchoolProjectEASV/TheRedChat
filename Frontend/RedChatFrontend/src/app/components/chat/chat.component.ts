import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { NgForOf, NgIf, DatePipe } from '@angular/common';
import { FriendsService } from '../../services/friends.service';
import { ChatService } from '../../services/chat.service';
import { AuthService } from '../../services/auth.service';
import { Message } from '../../models/message.model'


@Component({
  selector: 'app-chat',
  standalone: true,
  imports: [
    FormsModule,
    NgForOf,
    NgIf,
    DatePipe
  ],
  templateUrl: './chat.component.html',
  styleUrls: ['./chat.component.css']
})
export class ChatComponent implements OnInit, OnDestroy {
  friends: any[] = [];
  newFriend = '';
  selectedFriend: any | null = null;
  messages: Message[] = [];
  newMessage = '';
  messagesPlaceholder = 'Type a message...';
  addFriendPlaceholder = 'Add a friend';
  friendsListTitle = 'Friends';

  constructor(
    private friendsService: FriendsService,
    private chatService: ChatService,
    public authService: AuthService
  ) {}

  ngOnInit() {
    const token = this.authService.getToken();
    if (token) {
      this.chatService.startConnection(token);
      this.chatService.messages$.subscribe((msgs) => {
        this.messages = msgs;
      });
    }
    this.loadFriends();
  }

  ngOnDestroy() {
    this.chatService.stopConnection();
  }

  loadFriends() {
    this.friendsService.getFriends().subscribe(
      (data) => {
        this.friends = data;
      },
      (error) => {
        alert('Failed to load friends.');
      }
    );
  }

  selectFriend(friend: any) {
    this.selectedFriend = friend;
  
    const userId = this.authService.getUserId();
    this.chatService.getMessagesWithFriend(friend.id).subscribe(
      (historicalMessages) => {
        const liveMessages = this.chatService.messages$.value.filter(
          (msg) =>
            (msg.senderId === userId && msg.receiverId === friend.id) ||
            (msg.senderId === friend.id && msg.receiverId === userId) &&
            !historicalMessages.some((hm) => hm.Id === msg.Id) // Prevent duplicates
        );
  
        this.messages = [
          ...historicalMessages,
          ...liveMessages,
        ].sort((a, b) => new Date(a.sentAt).getTime() - new Date(b.sentAt).getTime());
      },
      (error) => {
        console.error('Failed to fetch messages:', error);
        alert('Could not load messages for this friend.');
      }
    );
  }
  

  addFriend() {
    if (this.newFriend.trim()) {
      this.friendsService.addFriend(this.newFriend).subscribe(
        () => {
          alert('Friend added successfully!');
          this.loadFriends();
          this.newFriend = '';
        },
        (error) => {
          alert('Failed to add friend.');
        }
      );
    }
  }

  removeFriend(friend: any) {
    this.friendsService.removeFriend(friend.id).subscribe(
      () => {
        alert('Friend removed successfully!');
        this.loadFriends();
      },
      (error) => {
        alert('Failed to remove friend.');
      }
    );
  }

  sendMessage() {
    if (this.selectedFriend && this.newMessage.trim()) {
      this.chatService.sendMessage(this.selectedFriend.id, this.newMessage);
      this.newMessage = '';
    }
  }
  
  
  
}