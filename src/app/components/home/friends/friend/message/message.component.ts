import { Component, ElementRef, HostListener, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { MessageService } from '../../../../../services/user/message.service';
import { UserService } from '../../../../../services/user/user.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { WebsocketService } from '../../../../../services/websocket/websocket.service';
import { FriendsService } from '../../../../../services/user/friends.service';

@Component({
  selector: 'app-message',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './message.component.html',
  styleUrl: './message.component.css'
})
export class MessageComponent implements OnInit {
  @ViewChild('messageContainer') private messageContainer!: ElementRef;

  friendId!: number;
  friendDetails: any | null = null;
  loggedInUserId!: number;
  messages: any[] = [];
  newMessage: string = '';
  isTyping: boolean = false;
  typingTimeout: any;
  editingMessage: any | null = null;
  isFriendTyping: boolean = false;
  activeMessage: any = null;
  menuPosition: any = {};

  constructor(private route: ActivatedRoute,
    private router: Router,
    private messageService: MessageService,
    private userService: UserService,
    private websocketService: WebsocketService,
    private friendService: FriendsService) { }

  ngOnInit(): void {
    this.setupWebSocket();
    this.friendId = +this.route.snapshot.paramMap.get('friendId')!;
    this.getLoggedInUserInfo();
    this.getFriendInfo(this.friendId);
    this.loadMessages();
  }

  getFriendInfo(friendId : number): void{
    this.friendService.getFriendDetails(friendId).subscribe({
      next: (fri) => {
        this.friendDetails = fri;
        this.loadMessages();
      },
      error: (err) => console.error('Error fetching user info:', err),
    });
  }

  getLoggedInUserInfo(): void {
    this.userService.getUserInfo().subscribe({
      next: (user) => {
        this.loggedInUserId = user.id;
        this.loadMessages();
       },
       error: (err) => console.error('Error fetching user info:', err),
    });
  }

  loadMessages(): void {
    if (!this.loggedInUserId || !this.friendId) {
      console.error("User ID(s) not initialized correctly.");
      return;
    }

    this.messageService.getChatMessages(this.loggedInUserId, this.friendId).subscribe({
      next: (messages) => {
        this.messages = messages.map((message) => {
          // Check if the message content starts with "0|"
          const isSharedCouponMessage = message.content.startsWith('0|');
          const displayContent = isSharedCouponMessage ? message.content.split('0|')[1].trim() : message.content;

          return {
            ...message,
            content: displayContent, // Update the content to remove "0|"
            isSharedCouponMessage: isSharedCouponMessage, // Mark as shared coupon message
            reactions: message.reactions || [], // Ensure reactions are initialized
          };
        });

        // Scroll to the bottom after loading messages
        setTimeout(() => this.scrollToBottom(), 100);
      },
      error: (err) => console.error('Error fetching chat messages:', err),
    });
  }

  sendMessage(): void {
    if (!this.newMessage.trim()) return;

    if (this.editingMessage) {
      const updatedMessage = { ...this.editingMessage, content: this.newMessage };
      this.messageService.editMessage(this.editingMessage.id, this.newMessage).subscribe(() => {
        const index = this.messages.findIndex(msg => msg.id === this.editingMessage.id);
        if (index !== -1) {
          this.messages[index] = updatedMessage;
        }
        this.editingMessage = null;
        this.newMessage = '';
        this.closeMessageMenu();
      });
      return;
    }

    const message = {
      senderId: this.loggedInUserId,
      receiverId: this.friendId,
      content: this.newMessage,
    };
    this.messageService.sendMessage(message).subscribe({
      next: (response) => {
        this.messages.push(response);
        this.newMessage = '';
        setTimeout(() => this.scrollToBottom(), 100);
      },
      error: (err) => console.error('Error sending message:', err),
    });
  }

  editMessage(message: any): void {
    this.editingMessage = message;
    this.newMessage = message.content;
  }

  deleteMessage(messageId: number): void {
    console.log('Deleting message:', messageId);
    this.messageService.deleteMessage(messageId).subscribe(() => {
      this.messages = this.messages.filter(msg => msg.id !== messageId);
    });
    this.closeMessageMenu();
  }

  reactToMessage(message: any, reaction: string): void {

    // Ensure reactions is initialized
  if (!message.reactions) {
    message.reactions = [];
  }
    const existingReaction = message.reactions.find((r: any) => r.userId === this.loggedInUserId);

    if (existingReaction) {
      if (existingReaction.reaction === reaction) {
        this.messageService.removeReaction(message.id, this.loggedInUserId).subscribe(() => {
          message.reactions = message.reactions.filter((r: any) => r.userId !== this.loggedInUserId);
        });
      } else {
        this.messageService.addReaction(message.id, this.loggedInUserId, reaction).subscribe(() => {
          existingReaction.reaction = reaction;
        });
      }
    } else {
      this.messageService.addReaction(message.id, this.loggedInUserId, reaction).subscribe(() => {
        message.reactions.push({ userId: this.loggedInUserId, reaction });
      });
    }
    this.closeMessageMenu();
  }

  private setupWebSocket(): void {
    this.websocketService.connect();
    this.websocketService.onMessage().subscribe((message) => {
      this.handleWebSocketMessage(message);
    });
  }

  private handleWebSocketMessage(message: any): void {
    if (message.type !== null){
      switch (message.type) {
      case 'newMessage':

      // Parse the message content
      const content = message.content;
      const isSharedCouponMessage = content.startsWith('0|');
      const displayContent = isSharedCouponMessage ? content.split('0|')[1].trim() : content;

      this.messages.push({
        id: message.messageId,
        senderId: message.senderId,
        content: displayContent,
        sendAt: message.sendAt,
        reactions: [],
        isSharedCouponMessage: isSharedCouponMessage
      });
      setTimeout(() => this.scrollToBottom(), 100);
      break;
        case 'edit':
          const index = this.messages.findIndex(msg => msg.id === message.messageId);
          if (index !== -1) {
            this.messages[index].content = message.newContent;
          }
          break;

        case 'delete':
          this.messages = this.messages.filter(msg => msg.id !== message.messageId);
          break;
        case 'reactionAdded':
          console.log('Here is reaction added websocket');
          const reactionAddedIndex = this.messages.findIndex(msg => msg.id === message.messageId);
            if (reactionAddedIndex !== -1) {
              const existingReaction = this.messages[reactionAddedIndex].reactions.find(
                (r: any) => r.userId === message.userId
              );
              if (existingReaction) {
                existingReaction.reaction = message.reaction;
              } else {
                this.messages[reactionAddedIndex].reactions.push({
                  userId: message.userId,
                  reaction: message.reaction
                });
              }
            }
            break;

          case 'reactionRemoved':
            const reactionRemovedIndex = this.messages.findIndex(msg => msg.id === message.messageId);
            if (reactionRemovedIndex !== -1) {
              this.messages[reactionRemovedIndex].reactions = this.messages[reactionRemovedIndex].reactions.filter(
                (r: any) => r.userId !== message.userId
              );
            }
            break;
      }
    } else {
      this.loadMessages();
    }
  }

  handleMessageClick(message: any): void {
    if (message.isSharedCouponMessage) {
      // Redirect to the coupons page
      this.router.navigate(['/homepage/purchase-coupon']);
    }
  }


  onTyping(): void {
    // this.websocketService.sendTypingNotification(this.loggedInUserId, this.friendId);
  }

  scrollToBottom(): void {
    try {
      this.messageContainer.nativeElement.scrollTo({
        top: this.messageContainer.nativeElement.scrollHeight,
        behavior: 'smooth'
      });
    } catch (err) {
      console.error('Error scrolling:', err);
    }
  }

  getFriendImageUrl(profile: string | null): string {
    return profile
      ? this.userService.getImageUrl(profile)
      : '/images/default-avatar.png';
  }

  // Open the floating menu for a message
  openMessageMenu(message: any, event: MouseEvent) {
    this.activeMessage = message;

    // Calculate the position of the menu
    const messageElement = event.target as HTMLElement;
    const rect = messageElement.getBoundingClientRect();

    this.menuPosition = {
        position: 'fixed',
        top: `${rect.top - 50}px`, // Position above the message
        left: `${rect.left + rect.width / 2 - 100}px`, // Center horizontally
    };
}

// Close the floating menu
closeMessageMenu() {
    this.activeMessage = null;
}

// Detect clicks outside the floating menu
@HostListener('document:click', ['$event'])
onClick(event: MouseEvent) {
    const floatingMenu = document.querySelector('.floating-menu') as HTMLElement;
    if (floatingMenu && !floatingMenu.contains(event.target as Node)) {
        this.closeMessageMenu();
    }
}

goBack(){
  history.back();
}

}
