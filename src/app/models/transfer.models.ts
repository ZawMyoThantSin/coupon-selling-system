export interface TransferResponse {
    transferId: number;
    senderId: number;
    accepterId: number;
    senderName:string;
    accepterName:string;
    saleCouponId: number;
    status: number;
    transferAt: string;
  }
