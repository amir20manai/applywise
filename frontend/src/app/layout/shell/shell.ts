import { Component, OnDestroy, OnInit, inject } from '@angular/core';
import { TitleCasePipe } from '@angular/common';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';

import { AuthService } from '../../core/services/auth';
import { NotificationApi } from '../../core/services/notification-api';

interface NavItem {
  label: string;
  path: string;
  adminOnly?: boolean;
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
    { label: 'Dashboard', path: '/dashboard' },
    { label: 'Job offers', path: '/job-offers' },
    { label: 'Applications', path: '/applications' },
    { label: 'Interviews', path: '/interviews' },
    { label: 'My CVs', path: '/resumes' },
    { label: 'Notifications', path: '/notifications' },
    { label: 'Profile', path: '/profile' },
    { label: 'Companies', path: '/admin/companies', adminOnly: true },
    { label: 'Manage offers', path: '/admin/job-offers', adminOnly: true },
  ];

  // Les pages admin ne sont visibles que pour un ADMIN
  get nav(): NavItem[] {
    return this.allItems.filter((item) => !item.adminOnly || this.auth.isAdmin());
  }

  get initial(): string {
    return this.auth.user()?.firstName?.charAt(0) ?? '';
  }

  ngOnInit(): void {
    this.notifications.refreshUnread();
    // Vérifie les nouvelles notifications chaque minute
    this.timer = setInterval(() => this.notifications.refreshUnread(), 60_000);
  }

  ngOnDestroy(): void {
    clearInterval(this.timer);
  }
}