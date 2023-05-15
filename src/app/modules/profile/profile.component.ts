import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { NgbModal, NgbModalConfig } from '@ng-bootstrap/ng-bootstrap';
import { first, Observable } from 'rxjs';
import { AuthService, UserType } from '../auth';
import { UserHTTPService } from '../auth/services/other-http/user-http.service';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
})
export class ProfileComponent implements OnInit {

  UserForm: FormGroup;
  submitted: boolean = false;
  user$: Observable<UserType>;
  currentId: number;
  obj: any = [];

  constructor(private modalService: NgbModal,
    private userHTTPService: UserHTTPService,
    private changeDetectorRef: ChangeDetectorRef,
    private auth: AuthService,
    private fb: FormBuilder,
    config: NgbModalConfig,
  ) {
    config.backdrop = 'static';
    config.keyboard = false;
  }

  ngOnInit(): void {
    this.user$ = this.auth.currentUserSubject.asObservable();
    this.Validate();
    this.userHTTPService.Refreshrequiard.subscribe(() => {
      this.user$ = this.auth.currentUserSubject.asObservable();
    });
  }

  // ------------ Update  Mt Profile ------------
  Update(): void {
    this.submitted = true;
    if (this.UserForm.valid) {
      this.userHTTPService.UpdateUser(this.currentId, this.UserForm.getRawValue()).pipe(first())
        .subscribe(() => {
          this.submitted = false;
          this.modalService.dismissAll();
          this.changeDetectorRef.detectChanges();
        });
    }
  }

  // ------------ Edit Mt Profile ------------
  EditMyProfile(id: any): void {
    this.currentId = id;
    this.userHTTPService.GetUser(id).subscribe((res: any) => {
      this.obj = res;
      this.UserForm.patchValue({
        fullname: this.obj.fullname,
        username: this.obj.username,
        email: this.obj.email,
        phone: this.obj.phone
      });
    });
  }

  openVerticallyCentered(content: any): void {
    this.modalService.open(content, { centered: true, });
  }

  // ------------ Validataion ------------
  Validate() {
    this.UserForm = this.fb.group({
      fullname: [null, Validators.compose([Validators.required, Validators.minLength(3),
      Validators.maxLength(50)]),
      ],
      username: [null, Validators.compose([Validators.required, Validators.minLength(3),
      Validators.maxLength(50)]),
      ],
      email: [null, Validators.compose([Validators.required, Validators.email,
      Validators.minLength(3), Validators.maxLength(50)]),
      ],
      phone: [null, Validators.compose([Validators.required, Validators.minLength(3),
      Validators.maxLength(50)]),
      ]
    });
  }
}
