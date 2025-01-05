export interface Business {
  id:number;
  name:string;
  location:string;
  description:string;
  contactNumber:string;
  photo:string;
  category:string;
  status:boolean;
  userId:number;
  userName:string;
  userEmail:string
  imageFile?:File | null;
}
