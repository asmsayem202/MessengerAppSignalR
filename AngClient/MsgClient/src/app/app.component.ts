import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet } from '@angular/router';
import { HubConnection, HubConnectionBuilder, HubConnectionState } from '@microsoft/signalr';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterOutlet, FormsModule],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent implements OnInit {
  title = 'MsgClient';

  private connection!: HubConnection;
  public user!: string | null;
  public message: string = "";
  public Messages: ChatMessage[] = [];

  constructor() {
    this.connection = new HubConnectionBuilder()
      .withUrl('https://localhost:7003/chat')
      .withAutomaticReconnect()
      .build();
  }

  ngOnInit(): void {
    while (!this.user)
      this.user = prompt('Enter your name');

    this.connection.on('ReceiveText', (user, message) => {

      this.Messages.push(new ChatMessage(user, message));
    });

    this.connection.on('ReceiveImg', (user, img) => {

      this.Messages.push(new ChatMessage(user, img, false));
    });
    
    this.connection.start();
    
  }

  get disconnected(): boolean {
    return this.connection.state != HubConnectionState.Connected;
  }


  sendMessage() {
    if (!this.user || !this.message) return;
    this.connection.invoke('ShareText', this.user, this.message);
    this.message = '';
  }

  @ViewChild('fileInput') fileInput!: ElementRef;

  sendFile(event: any) {
    const file: File = event.target.files[0];

    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => {
      this.connection.invoke("ShareImg", this.user, reader.result);
    };
    this.fileInput.nativeElement.value = '';
  }


}

export class ChatMessage {
  constructor(public UserName: string, public Message: string, public IsText: boolean = true) { }
}
