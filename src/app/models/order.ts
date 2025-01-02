export interface Order {
  id: number;
  payment_id: number;
  coupon_id: number;
  user_id: number;
  quantity: number;
  phoneNumber: string;
  totalPrice: number;
  screenshot: string;
  createdAt: string; // Use `Date` type if you want to work with actual Date objects
  updatedAt: string | null;
  message: string | null;
  status: number;
  order_id: number;
  userName: string;
  userEmail: string;
}
