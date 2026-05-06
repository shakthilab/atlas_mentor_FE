export const ApiEndpoint = {
  AUTH: {
    LOGIN: '/api/auth/login',
    VERIFY_EMAIL: '/api/auth/verify-email',
    FORGOT_PASSWORD: '/api/auth/forgot-password',
    RESET_PASSWORD: '/api/auth/reset-password',
  },
  ADMIN: {
    GET_ALL_EMPLOYEE: '/api/admin/get-all-employee',
  },
  STUDENTS: {
    BASE: '/api/students',
    REGISTER: '/api/students/register',
    REGISTERED: '/api/students/registered',
    NON_REGISTERED: '/api/students/non-registered',
    REQUIRED_DOCUMENTS: '/api/students/required-documents',
    ONBOARDING: '/api/students/onboarding',
    BY_EMAIL: '/api/students/by-email',
    UPDATE_STATUS: '/api/students', // used as /api/students/{id}/status
    WITH_PAYMENTS: '/api/students/with-payment-by-referral-company',
  },
  EMPLOYEES: {
    BASE: '/api/employees',
    UNASSIGNED: '/api/employees/unassigned',
  },
  BRANCHES: {
    BASE: '/api/branches',
    UNASSIGNED_EMPLOYEES: '/api/branches/unassigned-employees',
  },
  HIERARCHY: {
    BASE: '/api/hierarchy',
    COUNSELLORS: '/api/hierarchy/counsellors',
    MANAGERS: '/api/hierarchy/managers',
    USERS_BY_ROLE: '/api/hierarchy/users-by-role',
    ASSIGN_EMPLOYEES_BY_ROLES: '/api/hierarchy/assign-employee-by-roles',
    ASSIGN_JUNIORS: '/api/hierarchy/assign-junior-counsellors',
    UNASSIGN_EMPLOYEE: '/api/hierarchy/unassign-employee',
    UNASSIGN_JUNIOR: '/api/hierarchy/unassign-junior-counsellor',
  },
  PAYMENTS: {
    BASE: '/api/payments',
    APPROVE: '/api/payments/approve',
    REJECT: '/api/payments/reject',
    RAISE_DISPUTE: '/api/payments/raise-dispute',
    ACCEPT_DISPUTE: '/api/payments/accept-dispute',
    REJECT_DISPUTE: '/api/payments/reject-dispute',
    UPDATE_AMOUNT: '/api/students/payment/amount',
    UPDATE_STATUS: '/api/students/payment/status',
  },
  TASKS: {
    BASE: '/api/tasks',
  },
  ROLES: {
    BASE: '/api/roles',
  },
  COUNTRIES: {
    MOBILE_CODES: '/api/mobile-country-codes',
    BASE: '/api/countries',
  },
  UNIVERSITIES: {
    BY_COUNTRY: '/api/universities/country',
  },
  REFERRALS: {
    BASE: '/api/referral',
    CREATE: '/api/referral/create',
    LIST: '/api/referral/list',
    DELETE: '/api/referral/delete',
    STATUS: '/api/referral/status',
    UPDATE: '/api/referral/update',
    TYPES: '/api/referral/types',
  },
  COMPANIES: {
    BASE: '/api/company',
    CREATE: '/api/company/create',
    LIST: '/api/company/list',
    DELETE: '/api/company/delete',
    TOGGLE_STATUS: '/api/company/toggle-status',
    EDIT: '/api/company/edit',
  },
  USERS: {
    ACTIVE_COUNSELLORS: '/api/users/counsellors/active',
  }
};
