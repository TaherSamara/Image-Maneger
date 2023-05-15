import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { LayoutType } from '../../../core/configs/config';
import { LayoutInitService } from '../../../core/layout-init.service';
import { LayoutService } from '../../../core/layout.service';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { Observable, first } from 'rxjs';
import { CustomValidators } from 'ng2-validation';
import { AuthService, UserType } from 'src/app/modules/auth';
import { UserHTTPService } from 'src/app/modules/auth/services/other-http/user-http.service';

@Component({
  selector: 'app-header-menu',
  templateUrl: './header-menu.component.html',
  styleUrls: ['./header-menu.component.scss'],
})
export class HeaderMenuComponent implements OnInit {

  isCrudLoading$: Observable<boolean>;
  HiddenForm: FormGroup;
  Hidden: any = [];
  user: any = [];
  submitted: boolean = false;
  hasError: boolean = false;
  user$: Observable<UserType>;
  userId: string;
  isNewUser: boolean;

  constructor(private modalService: NgbModal,
    private auth: AuthService,
    private userHTTPService: UserHTTPService,
    private router: Router,
    private layout: LayoutService,
    private layoutInit: LayoutInitService) {
    this.isCrudLoading$ = this.userHTTPService.isCrudLoading$;
  }

  ngOnInit(): void {
    this.user$ = this.auth.currentUserSubject.asObservable();
    this.getUserId();
    this.validate();
  }

  getUserId() {
    this.user$ = this.auth.currentUserSubject.asObservable();
    this.user = this.user$;
    this.userId = this.user.source._value.id;
    this.isNewUser = this.user.source._value.is_new_user;
  }

  isVerified(password: string) {
    this.submitted = true;
    if (this.HiddenForm.controls['password'].valid) {
      this.userHTTPService.LoginHiddenPage(this.userId, password).pipe(first())
        .subscribe((res) => {
          this.router.navigate(['/hidden']);
          this.modalService.dismissAll();
          this.HiddenForm.reset();
          this.hasError = false;
        },
          (err) => {
            this.hasError = true;
          });
    }
  }

  // ------------ validataion ------------
  validate(): void {
    this.HiddenForm = new FormGroup({
      password: new FormControl(null,
        Validators.compose([Validators.required,
        Validators.maxLength(10),
        Validators.minLength(3),
        CustomValidators.number
        ]))
    });
  }

  openVerticallyCentered(content: any) {
    this.modalService.open(content, { centered: true });
  }

  calculateMenuItemCssClass(url: string): string {
    return checkIsActive(this.router.url, url) ? 'active' : '';
  }

  setBaseLayoutType(layoutType: LayoutType) {
    this.layoutInit.setBaseLayoutType(layoutType);
  }

  setToolbar(toolbarLayout: 'classic' | 'accounting' | 'extended' | 'reports' | 'saas') {
    const currentConfig = { ...this.layout.layoutConfigSubject.value };
    if (currentConfig && currentConfig.app && currentConfig.app.toolbar) {
      currentConfig.app.toolbar.layout = toolbarLayout;
      this.layout.saveBaseConfig(currentConfig)
    }
  }
}

const getCurrentUrl = (pathname: string): string => {
  return pathname.split(/[?#]/)[0];
};

const checkIsActive = (pathname: string, url: string) => {
  const current = getCurrentUrl(pathname);
  if (!current || !url) {
    return false;
  }

  if (current === url) {
    return true;
  }

  if (current.indexOf(url) > -1) {
    return true;
  }

  return false;
};
