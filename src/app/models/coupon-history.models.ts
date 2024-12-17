export interface CouponHistory {
    id: number;
    couponName: string;
    shopName: string;
    purchasedAt: Date;
    usedAt: Date | null; 
  }