import { Component } from '@angular/core';
import { ConversationComponent } from './conversation/conversation';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [ConversationComponent],
  template: '<app-conversation></app-conversation>',
})
export class App {}
