export class Coupon {
    id: number; 
    code: string;
    discount: number;
    expDate: Date;
  
    constructor(id: number, code: string, discount: number, expDate: Date) {
      this.id = id;
      this.code = code;
      this.discount = discount;
      this.expDate = expDate;
    }
  }
  