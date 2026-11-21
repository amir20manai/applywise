import { Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';

import { ToastService } from '../../core/services/toast';

@Component({
  selector: 'app-toast-host',
  imports: [RouterLink],
  templateUrl: './toast-host.html',
  styleUrl: './toast-host.css',
})
export class ToastHost {
  protected toast = inject(ToastService);
}