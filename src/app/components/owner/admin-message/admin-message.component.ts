import { CommonModule } from '@angular/common';
import { Component, ElementRef, EventEmitter, HostListener, Input, Output, ViewChild } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { UserService } from '../../../services/user/user.service';
import { MessageService } from '../../../services/user/message.service';
import { WebsocketService } from '../../../services/websocket/websocket.service';

@Component({
  selector: 'app-admin-message',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './admin-message.component.html',
  styleUrl: './admin-message.component.css'
})
export class AdminMessageComponent {

  @ViewChild('messageContainer') private messageContainer!: ElementRef;

  adminId: number = 1;
  loggedInUserId!: number;
  messages: any[] = [];
  newMessage: string = '';
  isTyping: boolean = false;
  typingTimeout: any;
  editingMessage: any | null = null;
  isFriendTyping: boolean = false;
  activeMessage: any = null;
  menuPosition: any = {};

  constructor(
      private route: ActivatedRoute,
      private userService: UserService,
      private messageService: MessageService,
      private websocketService: WebsocketService,
      private router: Router
    ) {}

    ngOnInit(): void {

      this.getLoggedInUserInfo();
      this.setupWebSocket();
      this.loadMessages();
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
      if (!this.loggedInUserId || !this.adminId) {
        console.error("User ID(s) not initialized correctly.");
        return;
      }

      this.messageService.getChatMessages(this.loggedInUserId, this.adminId).subscribe({
        next: (messages) => {
          this.messages = messages.map((message) => {
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
            receiverId: this.adminId,
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

        getOwnerImageUrl(profile: string | null): string {
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
