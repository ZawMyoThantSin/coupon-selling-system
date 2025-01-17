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
  imageFile?:File | null;
}
