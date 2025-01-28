import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { MessageService } from '../../../../../services/user/message.service';

@Component({
  selector: 'app-message',
  standalone: true,
  imports: [],
  templateUrl: './message.component.html',
  styleUrl: './message.component.css'
})
export class MessageComponent implements OnInit {

  friendId!: number;

  constructor(private route: ActivatedRoute,
    private router: Router,
    private messageService: MessageService) { }

  ngOnInit(): void {
    this.friendId = +this.route.snapshot.paramMap.get('friendId')!;
  }
}
