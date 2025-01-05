export interface OrderDetail{
  id: number;
  order_id: number;
  user_id: number;
  quantity: number;
  totalPrice: number;
  status: number;
  screenshot: string;
  order_date: string;  // You can use `Date` if you need a Date object instead of a string
  message: string | null;
  userName: string;
  phoneNumber: string;
  userEmail: string;
  paymentInfo: PaymentInfo;
  orderItems: OrderItem[];
}

export interface PaymentInfo {
  accountName: string;
  accountNumber: string;
  paymentType: string;
}

export interface OrderItem {
  name: string;
  imagePath: string;
  unitPrice: number;
  quantity: number;
}
