import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { environment } from '../../environments/environment';

export interface UserRole {
  id: number;
  name: string;
}

export interface User {
  id: number;
  email: string;
  firstName: string;
  lastName: string;
  roles: UserRole[];
}

export interface UserListResponse {
  isSuccess: boolean;
  message: string;
  data: User[];
  errorCode: any;
  errors: any[];
}

@Injectable({
  providedIn: 'root',
})
export class UserService {
  private http = inject(HttpClient);

  getAllUsers(): Observable<User[]> {
    return this.http
      .get<UserListResponse>(`${environment.apiUrl}/user`)
      .pipe(map((response) => response.data));
  }
}
