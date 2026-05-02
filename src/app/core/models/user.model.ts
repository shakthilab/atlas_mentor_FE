export interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  status?: 'ACTIVE' | 'PENDING_APPROVAL';
  token?: string;
  isEmployee?: boolean; // Flag to identify employee users regardless of role
  
  // Specific fields
  phone?: string;
  preferredCountry?: string;
  preferredUniversity?: string;
  course?: string;
  intake?: string;
  employeeType?: string;
  experience?: string;
  notes?: string;
  dialCode?: string;
  referralCode?: string;
  branch?: string;
}

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
}
