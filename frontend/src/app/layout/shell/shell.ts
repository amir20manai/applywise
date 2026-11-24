import { Component, OnDestroy, OnInit, inject } from '@angular/core';
import { TitleCasePipe } from '@angular/common';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';

import { AuthService } from '../../core/services/auth';
import { NotificationApi } from '../../core/services/notification-api';

type Audience = 'all' | 'candidate' | 'admin';

interface NavItem {
  label: string;
  path: string;
  audience: Audience;
}

@Component({
  selector: 'app-shell',
  imports: [RouterOutlet, RouterLink, RouterLinkActive, TitleCasePipe],
  templateUrl: './shell.html',
  styleUrl: './shell.css',
})
export class Shell implements OnInit, OnDestroy {
  auth = inject(AuthService);
  notifications = inject(NotificationApi);

  private timer?: ReturnType<typeof setInterval>;

  // Chaque nouvelle page = une ligne ici
  private allItems: NavItem[] = [
    { label: 'Overview', path: '/admin/overview', audience: 'admin' },
    { label: 'Applications', path: '/admin/applications', audience: 'admin' },
    { label: 'Interviews', path: '/admin/interviews', audience: 'admin' },
    { label: 'Companies', path: '/admin/companies', audience: 'admin' },
    { label: 'Manage offers', path: '/admin/job-offers', audience: 'admin' },

    { label: 'Dashboard', path: '/dashboard', audience: 'candidate' },
    { label: 'Job offers', path: '/job-offers', audience: 'candidate' },
    { label: 'My applications', path: '/applications', audience: 'candidate' },
    { label: 'Interviews', path: '/interviews', audience: 'candidate' },
    { label: 'My CVs', path: '/resumes', audience: 'candidate' },
    { label: 'Notifications', path: '/notifications', audience: 'candidate' },

    { label: 'Profile', path: '/profile', audience: 'all' },
  ];

  // L'admin voit ses pages, le candidat voit les siennes
  get nav(): NavItem[] {
    const admin = this.auth.isAdmin();
    return this.allItems.filter(
      (item) =>
        item.audience === 'all' ||
        (item.audience === 'admin' && admin) ||
        (item.audience === 'candidate' && !admin),
    );
  }

  get initial(): string {
    return this.auth.user()?.firstName?.charAt(0) ?? '';
  }

  ngOnInit(): void {
    // Les notifications concernent les candidats (changement de status, entretiens, rappels)
    if (this.auth.isAdmin()) return;

    this.notifications.refreshUnread();
    // Vérifie les nouvelles notifications chaque minute
    this.timer = setInterval(() => this.notifications.refreshUnread(), 60_000);
  }

  ngOnDestroy(): void {
    clearInterval(this.timer);
  }
}