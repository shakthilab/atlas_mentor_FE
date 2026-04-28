import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';

export const passwordMatchValidator: ValidatorFn = (control: AbstractControl): ValidationErrors | null => {
  const password = control.get('password');
  const confirmPassword = control.get('confirmPassword');

  if (password && confirmPassword && password.value !== confirmPassword.value) {
    // We set the mismatch error on the confirmPassword control as well
    if (confirmPassword.errors) {
      confirmPassword.setErrors({ ...confirmPassword.errors, mismatch: true });
    } else {
      confirmPassword.setErrors({ mismatch: true });
    }
    return { mismatch: true };
  } else if (confirmPassword && confirmPassword.hasError('mismatch')) {
    const errors = { ...confirmPassword.errors };
    delete errors['mismatch'];
    confirmPassword.setErrors(Object.keys(errors).length ? errors : null);
  }
  return null;
};

export function calculatePasswordStrength(password: string): { score: number, label: string } {
  if (!password) return { score: 0, label: '' };

  let score = 0;
  if (password.length > 5) score += 1;
  if (password.length > 8) score += 1;
  if (/[A-Z]/.test(password) && /[a-z]/.test(password)) score += 1;
  if (/[0-9]/.test(password)) score += 1;
  if (/[^a-zA-Z0-9]/.test(password)) score += 1;

  if (score === 0) return { score: 1, label: 'Weak' };
  if (score <= 2) return { score: 2, label: 'Fair' };
  if (score <= 4) return { score: 3, label: 'Good' };
  return { score: 4, label: 'Strong' };
}
