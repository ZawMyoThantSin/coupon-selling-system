export interface CartData{
 
  cartId: number,
  userId: number,
  couponId: number,
  quantity: number |any,
  couponRemain: number;
  price: number | any,
  productImage: string,
  productName: string,
  expireDate: string

}
