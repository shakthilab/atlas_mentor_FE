import { Injectable } from '@angular/core';
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root'
})
export class RoleConfigService {
  constructor(private authService: AuthService) {}

  private configs = {
    ADMIN: {
      canViewAllData: true,
      canEditAllData: true,
      canDeleteAllData: true,
      defaultFilters: {},
      dataScope: 'all'
    },
    MANAGER: {
      canViewAllData: false,
      canEditAllData: false,
      canDeleteAllData: false,
      defaultFilters: { branchId: 'current' },
      dataScope: 'branch'
    },
    COMPANY: {
      canViewAllData: false,
      canEditAllData: false,
      canDeleteAllData: false,
      defaultFilters: { companyId: 'current' },
      dataScope: 'company'
    },
    REFERRAL: {
      canViewAllData: false,
      canEditAllData: false,
      canDeleteAllData: false,
      defaultFilters: { referralId: 'current' },
      dataScope: 'referral'
    },
    STUDENT: {
      canViewAllData: false,
      canEditAllData: false,
      canDeleteAllData: false,
      defaultFilters: { studentId: 'current' },
      dataScope: 'student'
    },
    EMPLOYEE: {
      canViewAllData: false,
      canEditAllData: false,
      canDeleteAllData: false,
      defaultFilters: { employeeId: 'current' },
      dataScope: 'employee'
    }
  };

  getCurrentUserRole(): string {
    const user = this.authService.currentUser$;
    // In a real app, this would get the role from the current user
    return 'ADMIN'; // Default for now
  }

  getConfig(role?: string) {
    const currentRole = role || this.getCurrentUserRole();
    return this.configs[currentRole as keyof typeof this.configs] || this.configs.ADMIN;
  }

  canEdit(role?: string): boolean {
    return this.getConfig(role).canEditAllData;
  }

  canDelete(role?: string): boolean {
    return this.getConfig(role).canDeleteAllData;
  }

  getDataScope(role?: string): string {
    return this.getConfig(role).dataScope;
  }

  getDefaultFilters(role?: string): any {
    return this.getConfig(role).defaultFilters;
  }

  applyRoleBasedFilter(data: any[], role?: string): any[] {
    const config = this.getConfig(role);
    const currentRole = role || this.getCurrentUserRole();
    
    // For now, return all data since we don't have real role-based data
    // In a real implementation, this would filter based on the user's role
    if (currentRole === 'ADMIN') {
      return data;
    }
    
    // For other roles, you would filter based on their scope
    // This is a placeholder implementation
    return data.slice(0, Math.floor(data.length * 0.6)); // Show subset for non-admin
  }

  getRoleSpecificTitle(baseTitle: string, role?: string): string {
    const currentRole = role || this.getCurrentUserRole();
    
    switch (currentRole) {
      case 'MANAGER':
        return `${baseTitle} - Branch View`;
      case 'COMPANY':
        return `${baseTitle} - Company View`;
      case 'REFERRAL':
        return `${baseTitle} - My Referrals`;
      case 'STUDENT':
        return `${baseTitle} - My Profile`;
      case 'EMPLOYEE':
        return `${baseTitle} - My Tasks`;
      default:
        return baseTitle;
    }
  }
}
