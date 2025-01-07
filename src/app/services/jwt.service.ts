import { Injectable } from '@angular/core';
import { jwtDecode } from 'jwt-decode';

@Injectable({
  providedIn: 'root'
})
export class JwtService {
  decodeToken(token: string): string {
    try {
      return jwtDecode(token);
      // console.log(JSON.stringify(test,null, 2));
      // console.log("Email: ", test.sub);
      // console.log("Role: "+ test.id);


    } catch (error) {
      console.error('Invalid token', error);
      return 'null';
    }
  }
  getUserId(token: string): any {
    try {
      const decodedToken:any = jwtDecode(token);
      return decodedToken.id;

    } catch (error) {
      console.error('Invalid token In jwt SErvice: ', error);
      return null;
    }
  }
  // <--- without jwt-decode library we will write like this(just knowledge) --->

  // decodeToken(token: string): any {
  //   try {
  //     const base64Url = token.split('.')[1];
  //     const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
  //     const jsonPayload = decodeURIComponent(
  //       atob(base64)
  //         .split('')
  //         .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
  //         .join('')
  //     );
  //     return JSON.parse(jsonPayload);
  //   } catch (error) {
  //     console.error('Invalid token', error);
  //     return null;
  //   }
  // }
}
