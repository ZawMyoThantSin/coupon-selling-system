export interface Business {
  id:number;
  name:string;
  location:string;
  description:string;
  contactNumber:string;
  photo:string;
  category:string;
  categoryId: number;
  status:boolean;
  userId:number;
  userName:string;
  userEmail:string;
  count:number;
  income:any;
  paid:any;
  profitPercentage:any;
  lastProfitPercentage: any;
  ownerProfit:any;
  adminProfit:any;
  saleCouponId:number;
  remainingAmount:any;
  lastPaidAmount:any;
  paymentStatus:any;
  imageFile?:File | null;
}
