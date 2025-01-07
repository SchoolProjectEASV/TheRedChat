import { Routes } from '@angular/router';
import { LoginComponent } from './components/login/login.component';
import { ChatComponent } from './components/chat/chat.component';
import { RegisterComponent } from './components/register/register.component';
import { authGuard } from './guard/auth.guard';

export const routes: Routes = [
  { path: '', component: LoginComponent },
  { path: 'register', component: RegisterComponent },
  { path: 'chat', component: ChatComponent, canActivate: [authGuard] },
  { path: '**', redirectTo: '' }
];
