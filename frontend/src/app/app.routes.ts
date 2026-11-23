import { Routes } from '@angular/router';

import { authGuard } from './core/guards/auth-guard';
import { adminGuard } from './core/guards/admin-guard';
import { guestGuard } from './core/guards/guest-guard';
import { homeRedirect } from './core/guards/home-redirect';

import { Login } from './features/auth/login/login';
import { Register } from './features/auth/register/register';
import { Shell } from './layout/shell/shell';
import { Dashboard } from './features/dashboard/dashboard';
import { Applications } from './features/applications/applications';
import { ApplicationForm } from './features/applications/application-form/application-form';
import { Resumes } from './features/resumes/resumes';
import { JobOffers } from './features/job-offers/job-offers';
import { Interviews } from './features/interviews/interviews';
import { Notifications } from './features/notifications/notifications';
import { Profile } from './features/profile/profile';
import { Overview } from './features/admin/overview/overview';
import { Companies } from './features/admin/companies/companies';
import { ManageOffers } from './features/admin/manage-offers/manage-offers';

// Titre de l'onglet: "Applications | ApplyWise"
const title = (name: string) => `${name} | ApplyWise`;

export const routes: Routes = [
  // ---------- Public pages (a signed-in user goes to their home page) ----------
  { path: 'login', component: Login, canActivate: [guestGuard], title: title('Sign in') },
  {
    path: 'register',
    component: Register,
    canActivate: [guestGuard],
    title: title('Create account'),
  },

  // ---------- Signed-in area ----------
  {
    path: '',
    component: Shell,
    canActivate: [authGuard],
    children: [
      // Candidate pages
      { path: 'dashboard', component: Dashboard, title: title('Dashboard') },
      { path: 'job-offers', component: JobOffers, title: title('Job offers') },
      { path: 'applications/new', component: ApplicationForm, title: title('Add application') },
      {
        path: 'applications/:id/edit',
        component: ApplicationForm,
        title: title('Edit application'),
      },
      { path: 'applications', component: Applications, title: title('Applications') },
      { path: 'interviews', component: Interviews, title: title('Interviews') },
      { path: 'resumes', component: Resumes, title: title('My CVs') },
      { path: 'notifications', component: Notifications, title: title('Notifications') },
      { path: 'profile', component: Profile, title: title('Profile') },

      // Admin pages
      {
        path: 'admin',
        canActivate: [adminGuard],
        children: [
          { path: 'overview', component: Overview, title: title('Overview') },
          { path: 'companies', component: Companies, title: title('Companies') },
          { path: 'job-offers', component: ManageOffers, title: title('Manage offers') },
          { path: '', pathMatch: 'full', redirectTo: 'overview' },
        ],
      },

      // "/" -> home page of the user's role
      { path: '', pathMatch: 'full', redirectTo: homeRedirect },
    ],
  },

  // ---------- Any other address ----------
  // Signed out -> /login, candidate -> /dashboard, admin -> /admin/overview
  { path: '**', redirectTo: homeRedirect },
];