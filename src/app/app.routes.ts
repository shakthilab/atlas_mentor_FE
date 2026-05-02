import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';

export const routes: Routes = [
  {
    path: 'auth',
    loadComponent: () => import('./features/auth/layout/auth-layout.component').then(m => m.AuthLayoutComponent),
    children: [
      { path: 'login', loadComponent: () => import('./features/auth/login/login.component').then(m => m.LoginComponent) },
      { path: 'forgot-password', loadComponent: () => import('./features/auth/forgot-password/forgot-password.component').then(m => m.ForgotPasswordComponent) },
      { path: 'register/student', loadComponent: () => import('./features/auth/register-student/register-student.component').then(m => m.RegisterStudentComponent) },
      { path: '', redirectTo: 'login', pathMatch: 'full' }
    ]
  },
  {
    path: 'verify-email',
    loadComponent: () => import('./features/auth/verify-email/verify-email.component').then(m => m.VerifyEmailComponent)
  },
  {
    path: 'reset-password',
    loadComponent: () => import('./features/auth/reset-password/reset-password.component').then(m => m.ResetPasswordComponent)
  },

  // Dashboard Layout (Public for Landing, Protected for Dashboards)
  {
    path: '',
    canActivate: [authGuard],
    loadComponent: () => import('./shared/layouts/dashboard-layout/dashboard-layout.component').then(m => m.DashboardLayoutComponent),
    children: [
      {
        path: '',
        loadComponent: () => import('./features/home/home.component').then(m => m.HomeComponent)
      },
      {
        path: 'admin',
        canActivate: [authGuard],
        data: { roles: ['ADMIN'] },
        children: [
          { path: '', loadComponent: () => import('./features/dashboards/admin/admin-dashboard.component').then(m => m.AdminDashboardComponent) },
          { path: 'approvals', loadComponent: () => import('./features/admin/pending-approvals/pending-approvals.component').then(m => m.PendingApprovalsComponent) },

          // New Modules
          {
            path: 'students', children: [
              { path: '', loadComponent: () => import('./features/admin/students/student-list/student-list.component').then(m => m.StudentListComponent) },
              { path: 'add', loadComponent: () => import('./features/admin/students/student-form/student-form.component').then(m => m.StudentFormComponent) },
              { path: 'edit/:id', loadComponent: () => import('./features/admin/students/student-form/student-form.component').then(m => m.StudentFormComponent) },
              { path: ':id', loadComponent: () => import('./features/admin/students/student-detail/student-detail.component').then(m => m.StudentDetailComponent) }
            ]
          },
          {
            path: 'tasks', children: [
              { path: '', loadComponent: () => import('./features/admin/tasks/task-list/task-list.component').then(m => m.TaskListComponent) }
            ]
          },
          {
            path: 'payments', children: [
              { path: '', loadComponent: () => import('./features/admin/payments/payment-list/payment-list.component').then(m => m.PaymentListComponent) }
            ]
          },
          {
            path: 'employees', children: [
              { path: '', loadComponent: () => import('./features/admin/employees/employee-list/employee-list.component').then(m => m.EmployeeListComponent) },
              { path: 'approvals', loadComponent: () => import('./features/admin/pending-approvals/pending-approvals.component').then(m => m.PendingApprovalsComponent) }
            ]
          },
          { path: 'hierarchy', loadComponent: () => import('./features/admin/hierarchy/hierarchy-manager/hierarchy-manager.component').then(m => m.HierarchyManagerComponent) },
          { path: 'branches', loadComponent: () => import('./features/admin/branches/branch-list/branch-list.component').then(m => m.BranchListComponent) },
          { path: 'referrals', loadComponent: () => import('./features/admin/referrals/referral-list/referral-list.component').then(m => m.ReferralListComponent) },
          { path: 'companies', loadComponent: () => import('./features/admin/companies/company-list/company-list.component').then(m => m.CompanyListComponent) },
          { path: 'documents', loadComponent: () => import('./features/admin/documents/document-manager/document-manager.component').then(m => m.DocumentManagerComponent) },
          { path: 'export', loadComponent: () => import('./features/admin/export/export-tool/export-tool.component').then(m => m.ExportToolComponent) },
          { path: 'settings', loadComponent: () => import('./features/admin/settings/settings.component').then(m => m.SettingsComponent) }
        ]
      },
      {
        path: 'student',
        canActivate: [authGuard],
        data: { roles: ['STUDENT'] },
        loadComponent: () => import('./features/dashboards/student/student-dashboard.component').then(m => m.StudentDashboardComponent)
      },
      {
        path: 'employee',
        canActivate: [authGuard],
        data: { roles: ['EMPLOYEE'] },
        loadComponent: () => import('./features/dashboards/employee/employee-dashboard.component').then(m => m.EmployeeDashboardComponent)
      },
      {
        path: 'manager',
        canActivate: [authGuard],
        data: { roles: ['MANAGER'] },
        children: [
          { path: '', loadComponent: () => import('./features/dashboards/manager/manager-dashboard.component').then(m => m.ManagerDashboardComponent) },
          // Reuse admin components with branch-specific filtering
          { path: 'tasks', loadComponent: () => import('./features/admin/tasks/task-list/task-list.component').then(m => m.TaskListComponent) },
          { path: 'students', loadComponent: () => import('./features/admin/students/student-list/student-list.component').then(m => m.StudentListComponent) },
          { path: 'employees', loadComponent: () => import('./features/admin/employees/employee-list/employee-list.component').then(m => m.EmployeeListComponent) },
          { path: 'hierarchy', loadComponent: () => import('./features/admin/hierarchy/hierarchy-manager/hierarchy-manager.component').then(m => m.HierarchyManagerComponent) },
          { path: 'referrals', loadComponent: () => import('./features/admin/referrals/referral-list/referral-list.component').then(m => m.ReferralListComponent) },
          { path: 'companies', loadComponent: () => import('./features/admin/companies/company-list/company-list.component').then(m => m.CompanyListComponent) },
          { path: 'branches', loadComponent: () => import('./features/admin/branches/branch-list/branch-list.component').then(m => m.BranchListComponent) },
          { path: 'payments', loadComponent: () => import('./features/admin/payments/payment-list/payment-list.component').then(m => m.PaymentListComponent) },
          { path: 'documents', loadComponent: () => import('./features/admin/documents/document-manager/document-manager.component').then(m => m.DocumentManagerComponent) },
          { path: 'settings', loadComponent: () => import('./features/admin/settings/settings.component').then(m => m.SettingsComponent) }
        ]
      },
      {
        path: 'company',
        canActivate: [authGuard],
        data: { roles: ['COMPANY'] },
        loadComponent: () => import('./features/dashboards/company/company-dashboard.component').then(m => m.CompanyDashboardComponent)
      },
      {
        path: 'referral',
        canActivate: [authGuard],
        data: { roles: ['REFERRAL'] },
        loadComponent: () => import('./features/dashboards/referral/referral-dashboard.component').then(m => m.ReferralDashboardComponent)
      }
    ]
  },

  { path: '**', redirectTo: '' }
];

