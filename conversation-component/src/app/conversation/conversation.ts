import { Component, ElementRef, ViewChild, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';

interface Attachment {
  name: string;
  size: string;
}

interface User {
  name: string;
  role: string;
}

interface Reply {
  senderName: string;
  content: string;
}

interface Message {
  id: number;
  user: User;
  content: string[];
  documents: string;
  type: 'standard' | 'highlighted' | 'reply';
  attachments: Attachment[];
  replyTo?: Reply;
}

@Component({
  selector: 'app-conversation',
  templateUrl: './conversation.html',
  styleUrls: ['./conversation.css'],
  standalone: true,
  imports: [CommonModule]
})
export class ConversationComponent implements AfterViewInit {
  @ViewChild('chatBody') chatBody!: ElementRef;
  @ViewChild('messageInput') messageInput!: ElementRef;

  mockMessages: Message[] = [
    { id: 1, user: { name: 'autoproducts', role: 'autoproducts' }, content: ['Test', 'Description'], documents: 'October 15, 2025 9:50 AM', type: 'standard', attachments: [] },
    { id: 2, user: { name: 'Admin', role: 'Admin' }, content: ['Please review the attached specification document for V1.', 'Let me know if you have any questions.'], documents: 'October 15, 2025 9:46 AM', type: 'highlighted', attachments: [{ name: 'specification-v1.pdf', size: '1.2 MB' }] },
    { id: 3, user: { name: 'Alice Freeman', role: 'Project Manager' }, content: ['The initial specs look good. I\'ve added a few notes in the shared document. Please proceed with the component mockups.'], documents: 'October 15, 2025 9:55 AM', type: 'standard', attachments: [] },
    { id: 4, user: { name: 'You', role: 'Developer' },  content: ['Understood. I will start working on the mockups and provide an update by EOD.'], documents: 'October 15, 2025 10:05 AM', type: 'reply', replyTo: { senderName: 'Alice Freeman', content: 'The initial specs look good...' }, attachments: [] },
    { id: 5, user: { name: 'Alice Freeman', role: 'Project Manager' }, content: ['Perfect, thank you!'], documents: 'October 15, 2025 10:07 AM', type: 'standard', attachments: [] },
  ];

  selectedMessageId: number | null = null;
  attachedFiles: File[] = [];
  messagePlaceholder = 'Add a comment or attach a file...';

  private messageIdCounter = this.mockMessages.length + 1;

  ngAfterViewInit() {
    this.scrollToBottom();
  }

  getMessageClasses(message: Message): string {
    const isSent = message.user.name === 'You';
    const isSelected = message.id === this.selectedMessageId;

    let classes = isSent
      ? 'bg-blue-500 border-blue-500 rounded-t-2xl rounded-bl-2xl'
      : `${message.type === 'highlighted' ? 'bg-indigo-50 border-indigo-100' : 'bg-white border-gray-200'} rounded-t-2xl rounded-br-2xl`;

    if (isSelected) {
      classes += ' selected';
    }

    return classes;
  }

  selectMessage(messageId: number): void {
    if (this.selectedMessageId === messageId) {
      this.deselectMessage();
    } else {
      this.selectedMessageId = messageId;
      this.updateInputUI();
    }
  }

  deselectMessage(): void {
    this.selectedMessageId = null;
    this.updateInputUI();
  }

  getReplyToName(): string {
    if (!this.selectedMessageId) return '';
    const message = this.mockMessages.find(m => m.id === this.selectedMessageId);
    return message ? `Replying to ${message.user.name}` : '';
  }

  getReplyToContent(): string {
    if (!this.selectedMessageId) return '';
    const message = this.mockMessages.find(m => m.id === this.selectedMessageId);
    return message ? message.content.join(' ') : '';
  }

  updateInputUI(): void {
    this.messagePlaceholder = this.selectedMessageId ? 'Type your reply...' : 'Add a comment or attach a file...';
  }

  onEnter(event: Event): void {
    const keyboardEvent = event as KeyboardEvent;
    if (!keyboardEvent.shiftKey) {
      keyboardEvent.preventDefault();
      this.sendMessage();
    }
  }

  applyFormat(command: string): void {
    this.messageInput.nativeElement.focus();
    document.execCommand(command, false, undefined);
  }

  sendMessage(): void {
    const html = this.messageInput.nativeElement.innerHTML.trim();
    if (html === '' && this.attachedFiles.length === 0) return;

    const messageContent = html === '' ? ['Attachment(s) added'] : [html];
    let newMessage: Message;

    if (this.selectedMessageId) {
      const messageToReply = this.mockMessages.find(m => m.id === this.selectedMessageId);
      if (messageToReply) {
        newMessage = {
          id: this.messageIdCounter++,
          user: { name: 'You', role: 'Developer' },
          content: messageContent,
          documents: new Date().toLocaleString('en-US', { hour: 'numeric', minute: 'numeric', hour12: true }),
          type: 'reply',
          replyTo: { senderName: messageToReply.user.name, content: messageToReply.content.join(' ') },
          attachments: this.attachedFiles.map(f => ({ name: f.name, size: `${(f.size / 1024).toFixed(1)} KB` }))
        };
      } else {
        return; // Should not happen
      }
    } else {
      newMessage = {
        id: this.messageIdCounter++,
        user: { name: 'You', role: 'Developer' },
        content: messageContent,
        documents: new Date().toLocaleString('en-US', { hour: 'numeric', minute: 'numeric', hour12: true }),
        type: 'standard',
        attachments: this.attachedFiles.map(f => ({ name: f.name, size: `${(f.size / 1024).toFixed(1)} KB` }))
      };
    }

    this.mockMessages.push(newMessage);
    this.deselectMessage();
    this.messageInput.nativeElement.innerHTML = '';
    this.attachedFiles = [];

    setTimeout(() => this.scrollToBottom(), 0);
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files) {
      this.attachedFiles.push(...Array.from(input.files));
      input.value = '';
    }
  }

  removeAttachment(index: number): void {
    this.attachedFiles.splice(index, 1);
  }

  private scrollToBottom(): void {
    try {
      this.chatBody.nativeElement.scrollTop = this.chatBody.nativeElement.scrollHeight;
    } catch(err) { }
  }
}
