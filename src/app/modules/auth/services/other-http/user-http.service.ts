import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, Subject, finalize, map, tap } from 'rxjs';
import { environment } from 'src/environments/environment';

const API_AUTH_URL = `${environment.apiUrl}/Auth`;
const API_USERS_URL = `${environment.apiUrl}/User`;

@Injectable({
    providedIn: 'root'
})
export class UserHTTPService {

    isCrudLoading$: Observable<boolean>;
    isCrudLoadingSubject: BehaviorSubject<boolean>;

    constructor(private http: HttpClient) {
        this.isCrudLoadingSubject = new BehaviorSubject<boolean>(false);
        this.isCrudLoading$ = this.isCrudLoadingSubject.asObservable();
    }

    private _refreshrequiard = new Subject<void>();
    get Refreshrequiard() {
        return this._refreshrequiard;
    }

    // begin::User Methods
    GetUser(id: string) {
        return this.http.get(`${API_USERS_URL}/${id}/get`).pipe(
            tap(() => {
                this.Refreshrequiard.next();
            })
        );
    }
    UpdateUser(id: any, data: any) {
        return this.http.post(`${API_USERS_URL}/${id}/edit`, data)
            .pipe(
                tap(() => {
                    this.Refreshrequiard.next();
                })
            );
    }
    CreateHiddenPage(id: string, password: string) {
        this.isCrudLoadingSubject.next(true);
        return this.http.post(`${API_AUTH_URL}/create-hidden-page`, {
            id,
            password
        }).pipe(
            map((res: any) => res),
            finalize(() => this.isCrudLoadingSubject.next(false))
        );
    }
    LoginHiddenPage(id: string, password: string) {
        this.isCrudLoadingSubject.next(true);
        return this.http.post(`${API_AUTH_URL}/login-hidden-page`, {
            id,
            password
        }).pipe(
            map((res: any) => res),
            finalize(() => this.isCrudLoadingSubject.next(false))
        );
    }
    // end::User Methods
}