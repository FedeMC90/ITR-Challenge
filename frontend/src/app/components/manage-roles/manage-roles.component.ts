import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { UserService, User } from '../../services/user.service';
import { RoleService, Role } from '../../services/role.service';

@Component({
  selector: 'app-manage-roles',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './manage-roles.component.html',
  styleUrls: ['./manage-roles.component.css'],
})
export class ManageRolesComponent implements OnInit {
  private userService = inject(UserService);
  private roleService = inject(RoleService);

  users: User[] = [];
  roles: Role[] = [];
  selectedUser: User | null = null;
  loading = false;
  error: string | null = null;
  success: string | null = null;

  ngOnInit() {
    this.loadData();
  }

  loadData() {
    this.loading = true;
    this.error = null;

    // Load users and roles in parallel
    Promise.all([
      this.userService.getAllUsers().toPromise(),
      this.roleService.getAllRoles().toPromise(),
    ])
      .then(([users, roles]) => {
        this.users = users || [];
        this.roles = roles || [];
        this.loading = false;
      })
      .catch((err) => {
        console.error('Failed to load data:', err);
        this.error = 'Failed to load users and roles. Please try again.';
        this.loading = false;
      });
  }

  selectUser(user: User) {
    this.selectedUser = user;
    this.error = null;
    this.success = null;
  }

  hasRole(roleId: number): boolean {
    if (!this.selectedUser) return false;
    return this.selectedUser.roles.some((role) => role.id === roleId);
  }

  toggleRole(roleId: number) {
    if (!this.selectedUser) return;

    this.error = null;
    this.success = null;

    const hasRole = this.hasRole(roleId);
    const action = hasRole ? 'remove' : 'assign';
    const roleName = this.roles.find((r) => r.id === roleId)?.name || 'Unknown';

    const request = {
      userId: this.selectedUser.id,
      roleId: roleId,
    };

    const observable = hasRole
      ? this.roleService.removeRole(request)
      : this.roleService.assignRole(request);

    observable.subscribe({
      next: () => {
        this.success = `Successfully ${
          action === 'assign' ? 'assigned' : 'removed'
        } role "${roleName}"`;

        // Update local state
        if (this.selectedUser) {
          if (action === 'assign') {
            const role = this.roles.find((r) => r.id === roleId);
            if (role && !this.selectedUser.roles.some((r) => r.id === roleId)) {
              this.selectedUser.roles.push(role);
            }
          } else {
            this.selectedUser.roles = this.selectedUser.roles.filter(
              (r) => r.id !== roleId,
            );
          }

          // Update user in the list
          const userIndex = this.users.findIndex(
            (u) => u.id === this.selectedUser!.id,
          );
          if (userIndex !== -1) {
            this.users[userIndex] = { ...this.selectedUser };
          }
        }

        // Clear success message after 3 seconds
        setTimeout(() => {
          this.success = null;
        }, 3000);
      },
      error: (err) => {
        console.error(`Failed to ${action} role:`, err);
        this.error =
          err.error?.message || `Failed to ${action} role. Please try again.`;
      },
    });
  }

  getRoleNames(user: User): string {
    return user.roles.map((role) => role.name).join(', ') || 'No roles';
  }
}
