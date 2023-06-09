import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { UserModel } from '../../models/user.model';
import { environment } from '../../../../../environments/environment';
import { AuthModel } from '../../models/auth.model';

const API_USERS_URL = `${environment.apiUrl}/auth`;

@Injectable({
  providedIn: 'root',
})
export class AuthHTTPService {
  constructor(private http: HttpClient) { }

  // public methods
  login(email: string, password: string): Observable<any> {
    return this.http.post<AuthModel>(`${API_USERS_URL}/login`, {
      email,
      password,
    });
  }

  // CREATE =>  POST: add a new user to the server
  createUser(formData: FormData): Observable<UserModel> {
    return this.http.post<UserModel>(`${API_USERS_URL}/register`, formData);
  }

  // Your server should check email => If email exists send link to the user and return true | If email doesn't exist return false
  forgotPassword(email: string): Observable<boolean> {
    return this.http.post<boolean>(`${API_USERS_URL}/forgot-password`, { email });
  }

  resetPassword(data: any): Observable<boolean> {
    return this.http.post<boolean>(`${API_USERS_URL}/reset-password`, data);
  }

  getUserByToken(token: string): Observable<UserModel> {
    return this.http.post<UserModel>(`${API_USERS_URL}/me`, { token });
  }
}