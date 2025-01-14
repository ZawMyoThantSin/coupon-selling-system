import { Component, OnInit } from '@angular/core';
import { WebsocketService } from './services/websocket/websocket.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent implements OnInit{
  constructor(private websocketService: WebsocketService) {}
  ngOnInit(): void {
    this.websocketService.connect();
  }
  title = 'coupon-selling-system';
}
