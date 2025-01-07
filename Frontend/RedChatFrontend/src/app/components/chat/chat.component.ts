import { Component } from '@angular/core';
import { FormsModule } from "@angular/forms";
import { NgForOf, NgIf } from "@angular/common";

interface Message {
  sender: string;
  text: string;
}

@Component({
  selector: 'app-chat',
  standalone: true,
  imports: [
    FormsModule,
    NgForOf,
    NgIf
  ],
  templateUrl: './chat.component.html',
  styleUrl: './chat.component.css'
})
export class ChatComponent {
  friends = [{ name: 'Alice' }, { name: 'Bob' }, { name: 'Charlie' }];
  newFriend = '';
  selectedFriend: { name: string } | null = null;
  messages: Message[] = [];
  newMessage = '';
  messagesPlaceholder = 'Type a message...';
  addFriendPlaceholder = 'Add a friend';
  friendsListTitle = 'Friends';

  selectFriend(friend: any) {
    this.selectedFriend = friend;
    this.messages = [];
  }

  addFriend() {
    if (this.newFriend.trim()) {
      this.friends.push({ name: this.newFriend });
      this.newFriend = '';
    }
  }

  sendMessage() {
    if (this.newMessage.trim()) {
      this.messages.push({ sender: 'You', text: this.newMessage });
      this.newMessage = '';
    }
  }
}
