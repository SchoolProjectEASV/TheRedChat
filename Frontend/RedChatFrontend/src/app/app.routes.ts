import { Routes } from '@angular/router';
import { LoginComponent} from "./components/login/login.component";
import { ChatComponent} from "./components/chat/chat.component";

export const routes: Routes = [
  { path: '', component: LoginComponent }, // Default route
  { path: '**', redirectTo: '' }           // Wildcard route to redirect invalid paths to login
];
