import { Routes } from '@angular/router';

import { authGuard } from './core/guards/auth-guard';
import { adminGuard } from './core/guards/admin-guard';
import { Login } from './features/auth/login/login';
import { Register } from './features/auth/register/register';
import { Dashboard } from './features/dashboard/dashboard';
import { Shell } from './layout/shell/shell';
import { Applications } from './features/applications/applications';
import { ApplicationForm } from './features/applications/application-form/application-form';
import { Resumes } from './features/resumes/resumes';
import { JobOffers } from './features/job-offers/job-offers';
import { Interviews } from './features/interviews/interviews';
import { Notifications } from './features/notifications/notifications';
import { Profile } from './features/profile/profile';
import { Companies } from './features/admin/companies/companies';
import { ManageOffers } from './features/admin/manage-offers/manage-offers';

export const routes: Routes = [
  { path: 'login', component: Login },
  { path: 'register', component: Register },
  {
    path: '',
    component: Shell,
    canActivate: [authGuard],
    children: [
      { path: 'dashboard', component: Dashboard },
      { path: 'applications/new', component: ApplicationForm },
      { path: 'applications/:id/edit', component: ApplicationForm },
      { path: 'applications', component: Applications },
      { path: 'resumes', component: Resumes },
      { path: 'job-offers', component: JobOffers },
      { path: 'interviews', component: Interviews },
      { path: 'notifications', component: Notifications },
      { path: 'profile', component: Profile },
      { path: 'admin/companies', component: Companies, canActivate: [adminGuard] },
      { path: 'admin/job-offers', component: ManageOffers, canActivate: [adminGuard] },
      { path: '', pathMatch: 'full', redirectTo: 'dashboard' },
    ],
  },
  { path: '**', redirectTo: 'dashboard' },
];