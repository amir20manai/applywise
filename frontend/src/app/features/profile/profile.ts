import { Component, OnInit, inject, signal } from '@angular/core';
import { DatePipe, TitleCasePipe } from '@angular/common';
import {
  AbstractControl,
  FormBuilder,
  ReactiveFormsModule,
  ValidationErrors,
  Validators,
} from '@angular/forms';

import { ToastService } from '../../core/services/toast';
import { AuthService } from '../../core/services/auth';
import { ProfileApi } from '../../core/services/profile-api';
import { Profile as UserProfile } from '../../core/models/profile.model';

function passwordsMatch(group: AbstractControl): ValidationErrors | null {
  const password = group.get('newPassword')?.value;
  const confirm = group.get('confirmPassword')?.value;
  return password && confirm && password !== confirm ? { mismatch: true } : null;
}

@Component({
  selector: 'app-profile',
  imports: [ReactiveFormsModule, DatePipe, TitleCasePipe],
  templateUrl: './profile.html',
  styleUrl: './profile.css',
})
export class Profile implements OnInit {
  private fb = inject(FormBuilder);
  private api = inject(ProfileApi);
  private auth = inject(AuthService);
  private toast = inject(ToastService);

  profile = signal<UserProfile | null>(null);
  loading = signal(true);

  savingProfile = signal(false);
  profileError = signal('');
  profileNotice = signal('');

  savingPassword = signal(false);
  passwordError = signal('');
  passwordNotice = signal('');

  profileForm = this.fb.nonNullable.group({
    firstName: ['', [Validators.required, Validators.maxLength(100)]],
    lastName: ['', [Validators.required, Validators.maxLength(100)]],
    phone: ['', Validators.maxLength(20)],
  });

  passwordForm = this.fb.nonNullable.group(
    {
      currentPassword: ['', Validators.required],
      newPassword: ['', [Validators.required, Validators.minLength(8)]],
      confirmPassword: ['', Validators.required],
    },
    { validators: passwordsMatch },
  );

  get p() {
    return this.profileForm.controls;
  }

  get pw() {
    return this.passwordForm.controls;
  }

  ngOnInit(): void {
    this.api.get().subscribe({
      next: (profile) => {
        this.profile.set(profile);
        this.profileForm.reset({
          firstName: profile.firstName,
          lastName: profile.lastName,
          phone: profile.phone ?? '',
        });
        this.loading.set(false);
      },
      error: (err) => {
        this.loading.set(false);
        this.profileError.set(err.error?.message ?? 'Could not load your profile. Try again.');
      },
    });
  }

  saveProfile(): void {
    if (this.profileForm.invalid) {
      this.profileForm.markAllAsTouched();
      return;
    }

    const v = this.profileForm.getRawValue();
    this.savingProfile.set(true);
    this.profileError.set('');

    this.api
      .update({
        firstName: v.firstName.trim(),
        lastName: v.lastName.trim(),
        phone: v.phone.trim(),
        // on renvoie la photo actuelle pour ne pas l'effacer
        profilePicture: this.profile()?.profilePicture ?? null,
      })
      .subscribe({
        next: (updated) => {
          this.savingProfile.set(false);
          this.profile.set(updated);
          this.auth.updateUserName(updated.firstName, updated.lastName);
          this.toast.success('Your profile was updated.');
        },
        error: (err) => {
          this.savingProfile.set(false);
          const details = err.error?.validationErrors;
          this.profileError.set(
            details
              ? Object.values(details).join(' ')
              : (err.error?.message ?? 'Could not update your profile. Try again.'),
          );
        },
      });
  }

  savePassword(): void {
    if (this.passwordForm.invalid) {
      this.passwordForm.markAllAsTouched();
      return;
    }

    const v = this.passwordForm.getRawValue();
    this.savingPassword.set(true);
    this.passwordError.set('');

    this.api
      .changePassword({ currentPassword: v.currentPassword, newPassword: v.newPassword })
      .subscribe({
        next: () => {
          this.savingPassword.set(false);
          this.passwordForm.reset();
          this.toast.success('Your password was changed.');
        },
        error: (err) => {
          this.savingPassword.set(false);
          const details = err.error?.validationErrors;
          this.passwordError.set(
            details
              ? Object.values(details).join(' ')
              : (err.error?.message ?? 'Could not change your password. Try again.'),
          );
        },
      });
  }
}