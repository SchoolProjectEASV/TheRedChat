import { CanActivateFn, CanMatchFn, Router } from '@angular/router';
import { inject } from '@angular/core';
import { AuthService } from '../services/auth.service';

export const authGuard: CanActivateFn & CanMatchFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  if (authService.hasToken()) {
    return true;
  } else {
    router.navigate(['']);
    return false;
  }
};