import { HttpErrorResponse, HttpHandler, HttpRequest } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { Observable, of, switchMap, tap, throwError } from 'rxjs';
import { environment } from 'src/environments/environment';
import { AuthModel } from '../models/auth.model';
import { AuthHTTPService } from './auth-http/auth-http.service';

@Injectable({
  providedIn: 'root'
})
export class AuthInterceptor {

  private authLocalStorageToken = `${environment.appVersion}-${environment.USERDATA_KEY}`;

  constructor(public router: Router,
    private authHTTPService: AuthHTTPService
  ) { }

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<any> {
    const auth = this.getAuthFromLocalStorage();
    if (!auth || !auth.authToken || !auth.refreshToken) {
      return of(undefined);
    }
    var req = req.clone({
      setHeaders: { Authorization: `Bearer ${auth.authToken}` }
    });
    return next.handle(req).pipe(tap(() => { },
      (err: any) => {
        if (err instanceof HttpErrorResponse) {
          if (err.status != 401)
            return;
          localStorage.removeItem(this.authLocalStorageToken);
          this.router.navigate(['/auth/login']);
        }
      }));
    // return next.handle(req).pipe(tap(() => { },
    //   (err: any) => {
    //     switch (err.status) {
    //       case 404:
    //         alert("404 - Not Found");
    //         break;
    //       case 400:
    //         alert("400 - Bad Request");
    //         break;
    //       default:
    //         return this.authHTTPService.refreshToken(auth.refreshToken).pipe(
    //           switchMap((auth: AuthModel) => {
    //             var newReq = req.clone({
    //               setHeaders: { Authorization: `Bearer ${auth.authToken}` }
    //             });
    //             this.setAuthFromLocalStorage(auth);
    //             return next.handle(newReq);
    //           })
    //         ).subscribe();
    //     }
    //     return throwError(err);
    //   }));
  }

  // private methods
  private setAuthFromLocalStorage(auth: AuthModel): boolean {
    if (auth && auth.authToken) {
      localStorage.setItem(this.authLocalStorageToken, JSON.stringify(auth));
      return true;
    }
    return false;
  }

  private getAuthFromLocalStorage(): AuthModel | undefined {
    try {
      const lsValue = localStorage.getItem(this.authLocalStorageToken);
      if (!lsValue) {
        return undefined;
      }

      const authData = JSON.parse(lsValue);
      return authData;
    } catch (error) {
      console.error(error);
      return undefined;
    }
  }
}