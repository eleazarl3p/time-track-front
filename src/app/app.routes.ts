import { Routes } from '@angular/router';
import { UtaskComponent } from './pages/utask/utask.component';
import { UserComponent } from './components/user/user.component';
import { AdminComponent } from './pages/admin/admin.component';
import { HomeComponent } from './pages/home/home.component';
import { LoginComponent } from './pages/login/login.component';
import { DashboardComponent } from './pages/dashboard/dashboard.component';

export const routes: Routes = [
  {
    path: '',
    pathMatch: 'full',
    redirectTo: 'login',
    // loadComponent: () => {
    //   return import('./pages/home/home.component').then((m) => m.HomeComponent);
    // },
  },
  {
    path: 'login',
    component: LoginComponent,
  },
  // {
  //   path: 'home',
  //   component: HomeComponent,
  // },
  {
    path: 'admin',
    component: AdminComponent,
  },
  {
    path: 'activity',
    component: UtaskComponent,
  },

  {
    path: 'dashboard',
    component: DashboardComponent,
  },
];
