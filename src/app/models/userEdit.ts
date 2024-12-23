export interface UserEdit {
  id: number;
  name: string;
  email: string;
  role: string;
  profile: string;
  enableNoti: number;
  authProvider:string |undefined;
  phone: string;
  address: string;
  created_At?: string;


}
