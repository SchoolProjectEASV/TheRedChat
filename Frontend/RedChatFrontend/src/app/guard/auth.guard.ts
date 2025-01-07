import { CanActivateFn, CanMatchFn, Router } from '@angular/router';
import { inject } from '@angular/core';
import { AuthService } from '../services/auth.service';
import {LoginComponent} from "../components/login/login.component";

export const authGuard: CanActivateFn & CanMatchFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  if (authService.hasToken()) {
    return true;
  } else {
    router.navigate(['/login']).then(r => LoginComponent);
    return false;
  }
};
