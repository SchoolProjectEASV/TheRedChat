import { Component, OnInit, OnDestroy, HostListener } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { NgForOf, NgIf, DatePipe } from '@angular/common';
import { FriendsService } from '../../services/friends.service';
import { ChatService } from '../../services/chat.service';
import { AuthService } from '../../services/auth.service';
import { Message } from '../../models/message.model'
import { EncryptionService } from '../../services/encryption.service';
import { KeyInputDialogComponent } from '../keyinputdialog/keyinputdialog.component';

@Component({
  selector: 'app-chat',
  standalone: true,
  imports: [
    FormsModule,
    NgForOf,
    NgIf,
    DatePipe,
    KeyInputDialogComponent
  ],
  templateUrl: './chat.component.html',
  styleUrls: ['./chat.component.css']
})
export class ChatComponent implements OnInit, OnDestroy {
  showKeyDialog = false;
  friends: any[] = [];
  newFriend = '';
  selectedFriend: any | null = null;
  messages: Message[] = [];
  newMessage = '';
  messagesPlaceholder = 'Type a message...';
  addFriendPlaceholder = 'Add a friend';
  friendsListTitle = 'Friends';
  isSidebarOpen = false;  // Sidebar open state

  constructor(
    private friendsService: FriendsService,
    private chatService: ChatService,
    public authService: AuthService,
    private encryptionService: EncryptionService
  ) {}

  async ngOnInit() {
    if (!this.encryptionService.isInitialized()) {
      this.showKeyDialog = true;
      return;
    }
    await this.initializeChat();
  }

  private async initializeChat() {
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
            !historicalMessages.some((hm) => hm.Id === msg.Id)
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

  onKeySubmitted() {
    this.showKeyDialog = false;
    this.initializeChat();
  }

  addFriend() {
    if (this.newFriend.trim()) {
      this.friendsService.addFriend(this.newFriend).subscribe({
        next: (response) => {
          this.loadFriends();
          this.newFriend = '';
          alert('Friend added successfully!');
        },
        error: (error) => {
          alert(error.error || 'Failed to add friend.');
        }
      });
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
      this.newMessage = ''; // Clear the input field after sending the message
    }
  }

  toggleSidebar() {
    this.isSidebarOpen = !this.isSidebarOpen;
  }

  sendMessageOnEnter(event: Event) {
    const keyboardEvent = event as KeyboardEvent; // Cast to KeyboardEvent
    if (keyboardEvent.key === 'Enter') {
      keyboardEvent.preventDefault(); // Prevent default Enter key behavior (e.g., submitting a form)
      this.sendMessage(); // Call sendMessage method
    }
  }

  // Auto resize textarea based on content
  autoResize(event: any) {
    const textarea = event.target;
    textarea.style.height = 'auto';
    textarea.style.height = `${textarea.scrollHeight}px`;
  }

  formatMessage(content: string): string {
    const words = content.split(' ');
    if (words.length > 100) {
      return words.reduce((acc, word, index) => {
        if (index % 100 === 0 && index !== 0) {
          acc += '\n'; // Add a line break every 100 words
        }
        return acc + word + ' ';
      }, '');
    }
    return content;
  }

  // Close sidebar if clicked outside of it
  closeSidebarOnClick(event: MouseEvent) {
    const sidebar = document.querySelector('.sidebar');
    const hamburgerButton = document.querySelector('.hamburger-btn');

    // Check if the click was inside the sidebar or hamburger button
    if (this.isSidebarOpen && sidebar && !sidebar.contains(event.target as Node) && !hamburgerButton?.contains(event.target as Node)) {
      this.isSidebarOpen = false; // Close the sidebar
    }
  }
}
