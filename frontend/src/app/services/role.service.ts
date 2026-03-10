import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { environment } from '../../environments/environment';

export interface Role {
  id: number;
  name: string;
}

export interface RoleListResponse {
  isSuccess: boolean;
  message: string;
  data: Role[];
  errorCode: any;
  errors: any[];
}

export interface AssignRoleRequest {
  userId: number;
  roleId: number;
}

export interface RoleResponse {
  isSuccess?: boolean;
  data?: any;
}

@Injectable({
  providedIn: 'root',
})
export class RoleService {
  private http = inject(HttpClient);

  getAllRoles(): Observable<Role[]> {
    return this.http
      .get<RoleListResponse>(`${environment.apiUrl}/role`)
      .pipe(map((response) => response.data));
  }

  assignRole(data: AssignRoleRequest): Observable<RoleResponse> {
    return this.http.post<RoleResponse>(
      `${environment.apiUrl}/role/assign`,
      data,
    );
  }

  removeRole(data: AssignRoleRequest): Observable<RoleResponse> {
    return this.http.post<RoleResponse>(
      `${environment.apiUrl}/role/remove`,
      data,
    );
  }
}
