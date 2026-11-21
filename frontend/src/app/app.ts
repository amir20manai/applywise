import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';

import { ConfirmDialog } from './shared/confirm-dialog/confirm-dialog';
import { ToastHost } from './shared/toast-host/toast-host';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, ConfirmDialog, ToastHost],
  templateUrl: './app.html',
  styleUrl: './app.css',
})
export class App {}