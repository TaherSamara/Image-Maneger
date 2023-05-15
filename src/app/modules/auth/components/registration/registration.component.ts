import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { Subscription, Observable } from 'rxjs';
import { Router } from '@angular/router';
import { AuthService, UserType } from '../../services/auth.service';
import { ConfirmPasswordValidator } from './confirm-password.validator';
import { UserModel } from '../../models/user.model';
import { first } from 'rxjs/operators';
import { OtherHTTPService } from '../../services/other-http/other-http.service';

@Component({
  selector: 'app-registration',
  templateUrl: './registration.component.html',
  styleUrls: ['./registration.component.scss'],
})
export class RegistrationComponent implements OnInit, OnDestroy {

  registrationForm: FormGroup;
  hasError: boolean;
  isLoading$: Observable<boolean>;
  isCrudLoading$: Observable<boolean>;
  file: File;
  submitted: boolean = false;

  // private fields
  private unsubscribe: Subscription[] = [];

  constructor(
    private otherHTTPService: OtherHTTPService,
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router
  ) {
    this.isLoading$ = this.authService.isLoading$;
    this.isCrudLoading$ = this.otherHTTPService.isCrudLoading$;
    // redirect to home if already logged in
    if (this.authService.currentUserValue) {
      this.router.navigate(['/']);
    }
  }

  ngOnInit(): void {
    this.initForm();
  }

  // convenience getter for easy access to form fields
  get f() {
    return this.registrationForm.controls;
  }

  initForm() {
    this.registrationForm = this.fb.group(
      {
        fullname: [
          '',
          Validators.compose([
            Validators.required,
            Validators.minLength(5),
            Validators.maxLength(50),
          ]),
        ],
        username: [
          '',
          Validators.compose([
            Validators.required,
            Validators.minLength(5),
            Validators.maxLength(50),
          ]),
        ],
        email: [
          '',
          Validators.compose([
            Validators.required,
            Validators.email,
            Validators.minLength(3),
            Validators.maxLength(50), // https://stackoverflow.com/questions/386294/what-is-the-maximum-length-of-a-valid-email-address
          ]),
        ],
        password: [
          '',
          Validators.compose([
            Validators.required,
            Validators.minLength(5),
            Validators.maxLength(15),
          ]),
        ],
        confirmPassword: [
          '',
          Validators.compose([
            Validators.required,
            Validators.minLength(5),
            Validators.maxLength(15),
          ]),
        ],
        picUrl: [
          '',
          Validators.compose([
            Validators.required
          ]),
        ]
      },
      {
        validator: ConfirmPasswordValidator.MatchPassword,
      }
    );
  }

  submit(user: {
    fullname: string, username: string, email: string, password: string,
    confirmPassword: string, file: File
  }) {
    if (this.registrationForm.valid) {
      this.hasError = false;
      user.file = this.file;
      const registrationSubscr = this.authService
        .registration(user)
        .pipe(first())
        .subscribe((user: UserType) => {
          if (user) {
            this.otherHTTPService.ShowInfoRegistration("Registration completed successfully");
            this.router.navigate(['/']);
          } else {
            this.hasError = true;
          }
        });
      this.unsubscribe.push(registrationSubscr);
    }
  }

  // ------------ Uploud image ------------
  onChange(files: FileList | null) {
    if (files) {
      this.file = <File>files[0];
    }
  }

  ngOnDestroy() {
    this.unsubscribe.forEach((sb) => sb.unsubscribe());
  }
}
