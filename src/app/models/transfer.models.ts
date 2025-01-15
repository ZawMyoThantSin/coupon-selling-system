export interface TransferResponse {
    transferId: number;
    senderId: number;
    senderName:string;
    accepterName:string;
    accepterId: number;
    saleCouponId: number;
    status: number;
    transferAt: string;
  }