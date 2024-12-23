export interface Business {
  id:number,
  name:string,
  location:string,
  description:string,
  contactNumber:string,
  photo:string,
  category:string,
  status:boolean,
  userName:string,
  userEmail:string
  imageFile?:File | null;
}
