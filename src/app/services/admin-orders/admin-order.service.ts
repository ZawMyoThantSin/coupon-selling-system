import { Injectable } from '@angular/core';
import { Observable, delay, of } from 'rxjs';


@Injectable({
  providedIn: 'root',
})
export class AdminOrderService {
  private mockOrders: Order[] = [
    {
      id: '1',
      customerName: 'Alice Smith',
      email: 'alice.smith@example.com',
      phone: '+1234567891',
      items: [
        {
          id: 'item1',
          name: 'Pro Subscription',
          quantity: 1,
          price: 59.99,
          description: 'Access to pro features for one year',
          image: 'https://via.placeholder.com/150/0000FF/FFFFFF?text=Pro+Sub'
        },
        {
          id: 'item2',
          name: 'E-Book Bundle',
          quantity: 3,
          price: 19.99,
          description: 'Set of three e-books on productivity',
          image: 'https://via.placeholder.com/150/FF0000/FFFFFF?text=E-Book'
        }
      ],
      total: 119.96,
      paymentProof: {
        url: 'https://via.placeholder.com/400x600?text=Payment+Proof',
        uploadedAt: new Date('2024-02-25T09:00:00')
      },
      status: 'pending',
      createdAt: new Date('2024-02-25T08:30:00'),
      notes: 'Expedited delivery requested'
    },
    {
      id: '2',
      customerName: 'Bob Johnson',
      email: 'bob.johnson@example.com',
      phone: '+9876543210',
      items: [
        {
          id: 'item3',
          name: 'Webinar Access',
          quantity: 1,
          price: 29.99,
          description: 'Ticket for live webinar on web development',
          image: 'https://via.placeholder.com/150/00FF00/FFFFFF?text=Webinar'
        }
      ],
      total: 29.99,
      paymentProof: {
        url: 'https://via.placeholder.com/400x600?text=Proof+of+Payment',
        uploadedAt: new Date('2024-02-24T15:45:00')
      },
      status: 'accepted',
      createdAt: new Date('2024-02-24T14:30:00'),
      notes: 'Joined the webinar late'
    }
  ];

  getOrders(): Observable<Order[]> {
    return of(this.mockOrders).pipe(delay(800));
  }

  updateOrderStatus(orderId: string, status: 'accepted' | 'rejected', notes?: string): Observable<Order> {
    const order = this.mockOrders.find(o => o.id === orderId);
    if (order) {
      order.status = status;
      if (notes) order.notes = notes;
    }
    return of(order!).pipe(delay(500));
  }
}

export interface Order {
  id: string;
  customerName: string;
  email: string;
  phone: string;
  items: OrderItem[];
  total: number;
  paymentProof: {
    url: string;
    uploadedAt: Date;
  };
  status: 'pending' | 'accepted' | 'rejected';
  createdAt: Date;
  notes?: string;
}

export interface OrderItem {
  id: string;
  name: string;
  quantity: number;
  price: number;
  description?: string;
  image?: string;
}

