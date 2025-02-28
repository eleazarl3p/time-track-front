// import { Injectable } from '@angular/core';
// import {
//   HttpRequest,
//   HttpHandler,
//   HttpInterceptor,
// } from '@angular/common/http';
// import { AuthService } from './auth.service'; // Adjust the path

// @Injectable()
// export class AuthInterceptor implements HttpInterceptor {
//   constructor(private authService: AuthService) {}

//   intercept(req: HttpRequest<any>, next: HttpHandler) {
//     console.log('Interceptor triggered!');
//     const token = this.authService.getToken();

//     if (token) {
//       const clonedRequest = req.clone({
//         setHeaders: {
//           Authorization: `Bearer ${token}`,
//         },
//       });
//       return next.handle(clonedRequest);
//     }

//     return next.handle(req);
//   }
// }
