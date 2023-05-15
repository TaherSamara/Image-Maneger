import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { Observable, Subscription } from 'rxjs';
import { AuthService } from '../../services/auth.service';
import { first } from 'rxjs/operators';
import { Router } from '@angular/router';

enum ErrorStates {
  NotSubmitted,
  HasError,
  NoError,
}

@Component({
  selector: 'app-forgot-password',
  templateUrl: './forgot-password.component.html',
  styleUrls: ['./forgot-password.component.scss'],
})
export class ForgotPasswordComponent implements OnInit {
  forgotPasswordForm: FormGroup;
  errorState: ErrorStates = ErrorStates.NotSubmitted;
  errorStates = ErrorStates;
  isLoading$: Observable<boolean>;
  submitted: boolean = false;

  // private fields
  private unsubscribe: Subscription[] = []; // Read more: => https://brianflove.com/2016/12/11/anguar-2-unsubscribe-observables/
  constructor(private fb: FormBuilder,
    private authService: AuthService,
    private router: Router
  ) {
    this.isLoading$ = this.authService.isLoading$;
  }

  ngOnInit(): void {
    this.initForm();
  }

  // convenience getter for easy access to form fields
  get f() {
    return this.forgotPasswordForm.controls;
  }

  initForm() {
    this.forgotPasswordForm = this.fb.group({
      email: ['',
        Validators.compose([
          Validators.required,
          Validators.email,
          Validators.minLength(3),
          Validators.maxLength(50),
        ]),
      ],
    });
  }

  submit() {
    if (this.forgotPasswordForm.valid) {
      this.errorState = ErrorStates.NotSubmitted;
      const forgotPasswordSubscr = this.authService
        .forgotPassword(this.f.email.value)
        .pipe(first())
        .subscribe((res: any) => {
          console.log(res);
          if (res) {
            this.errorState = ErrorStates.NoError;
            setTimeout(() => {
              this.router.navigate(['/auth/reset-password']);
            }, 3000);
          }
        }, (() => this.errorState = ErrorStates.HasError));
      this.unsubscribe.push(forgotPasswordSubscr);
    }
  }
}
