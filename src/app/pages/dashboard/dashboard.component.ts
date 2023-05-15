import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { NgbModal, NgbModalConfig } from '@ng-bootstrap/ng-bootstrap';
import { CustomValidators } from 'ng2-validation';
import { first, Observable } from 'rxjs';
import { AuthService, UserType } from 'src/app/modules/auth';
import { OtherHTTPService } from 'src/app/modules/auth/services/other-http/other-http.service';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss'],
})
export class DashboardComponent implements OnInit {

  isLoading$: Observable<boolean>;
  isCrudLoading$: Observable<boolean>;
  PicPath: string = `${environment.picPath}`;
  user$: Observable<UserType>;
  FileForm: FormGroup;
  Files: any = [];
  Folders: any = [];
  Images: any = [];
  editObj: any = [];
  user: any = [];
  selectedId: any = [];
  submitted: boolean = false;
  appearTable: boolean = true;
  alertRename: boolean = false;
  alertRemove: boolean = false;
  isNewUser: boolean;
  folderID: string;
  userId: string = "";
  searchText: string = "";
  imageName: string = "";
  page: number = 1;
  size: number = 6;
  imageSize: number;
  totalCount: number;
  totalRecords: number;
  totalCountfolders: number;
  totalCountimages: number;
  totalRecordsfolders: number;
  totalRecordsimages: number;
  files: FileList;

  constructor(private modalService: NgbModal,
    private otherHTTPService: OtherHTTPService,
    private auth: AuthService,
    private router: Router,
    config: NgbModalConfig
  ) {
    this.isLoading$ = this.otherHTTPService.isLoading$;
    this.isCrudLoading$ = this.otherHTTPService.isCrudLoading$;
    config.backdrop = 'static';
    config.keyboard = false;
  }

  ngOnInit(): void {
    this.getUserId();
    this.fetchAllFiles(this.page);
    this.fetchImages(this.page);
    this.fetchFolders(this.page);
    this.validate();
    this.otherHTTPService.Refreshrequiard.subscribe(() => {
      this.fetchAllFiles(this.page);
      this.fetchImages(this.page);
      this.fetchFolders(this.page);
    });
  }

  // ------------ Fetch Folders ------------
  fetchAllFiles(p: number): void {
    this.page = p;
    this.otherHTTPService.List1(this.userId, 0, this.searchText, this.size, this.page)
      .pipe(first())
      .subscribe((res: any | undefined) => {
        this.Files = res.data;
        this.totalCount = res.count;
        this.totalRecords = res.record;
      });
  }

  // ------------ Fetch Folders ------------
  fetchFolders(p: number): void {
    this.page = p;
    this.otherHTTPService.List1(this.userId, 1, this.searchText, 200, this.page)
      .pipe(first())
      .subscribe((res: any | undefined) => {
        this.Folders = res.data;
        this.totalCountfolders = res.count;
        this.totalRecordsfolders = res.record;
      });
  }

  // ------------ Fetch Images ------------
  fetchImages(p: number): void {
    this.page = p;
    this.otherHTTPService.List1(this.userId, 2, this.searchText, 200, this.page)
      .pipe(first())
      .subscribe((res: any | undefined) => {
        this.Images = res.data;
        this.totalCountimages = res.count;
        this.totalRecordsimages = res.record;
      });
  }

  // ------------ Add Folder ------------
  addFolder(name: string): void {
    this.submitted = true;
    if (this.FileForm.controls['name'].valid) {
      this.otherHTTPService.Add(name, "0", this.userId).pipe(first())
        .subscribe(() => {
          this.modalService.dismissAll();
          this.otherHTTPService.Showsuccess("The folder has been add successfully");
          this.FileForm.reset();
          this.submitted = false;
        });
    }
  }

  // ------------ Add Image ------------
  addImage(): void {
    this.submitted = true;
    if (this.FileForm.controls['name'].valid) {
      let description = this.FileForm.controls['description'].value;
      this.otherHTTPService.Upload(description ? description : "", "0", this.userId, this.files)
        .pipe(first())
        .subscribe(() => {
          this.modalService.dismissAll();
          this.otherHTTPService.Showsuccess("The image has been add successfully");
          this.FileForm.reset();
          this.submitted = false;
        });
    }
  }

  // ------------ Rename ------------
  rename(id: string): void {
    this.alertRename = true;
    this.submitted = true;
    if (this.FileForm.controls['newName'].valid) {
      let newName = this.FileForm.controls['newName'].value;
      this.otherHTTPService.Reneme(id, newName).pipe(first()).subscribe(() => {
        this.modalService.dismissAll();
        this.otherHTTPService.Showinfo("The name has been modified successfully");
      });
    }
  }

  // ------------ Edit ------------
  edit(id: any): void {
    this.otherHTTPService.GetFolder(id).subscribe((res: any | undefined) => {
      this.editObj = res;
      this.FileForm.patchValue({
        newName: this.editObj.name.includes('.') ? this.editObj.name
          .split('.').slice(0, -1).join('.') : this.editObj.name
      });
    });
  }

  // ------------ Move ------------
  moveTo(id: string, parentId: string): void {
    if (this.FileForm.controls['moveTo'].valid) {
      this.selectedId.push(id);
      this.otherHTTPService.MoveSelected(this.selectedId, parentId).subscribe(() => {
        this.modalService.dismissAll();
        this.otherHTTPService.Showinfo("The file has been moved successfully");
      });
    }
  }

  // ------------ Remove ------------
  remove(id: string): void {
    this.selectedId.push(id);
    this.otherHTTPService.DeleteSelected(this.selectedId).subscribe(() => {
      this.modalService.dismissAll();
      this.otherHTTPService.Showerroe("The file has been removed successfully", "Remove");
    });
  }

  // ------------ Selected ID ------------
  getCheckboxValues(event: any, Id: string) {
    if (event.target.checked) {
      this.selectedId.push(Id);
    } else {
      let el = this.selectedId.find((id: string) => id === Id);
      if (el)
        this.selectedId.splice(this.selectedId.indexOf(el), 1);
      if (this.selectedId.length == 0) {
        this.selectedId = [];
      }
    }
  }

  // ------------ Check All ------------
  checkAll(event: any) {
    var checkboxes = document.getElementsByTagName('input');
    if (event.target.checked) {
      this.Files.forEach((element: any) => {
        const Id = element.id;
        this.selectedId.push(Id);
      });
      for (var i = 0; i < checkboxes.length; i++) {
        if (checkboxes[i].type == 'checkbox') {
          checkboxes[i].checked = true;
        }
      }
    } else {
      for (var i = 0; i < checkboxes.length; i++) {
        if (checkboxes[i].type == 'checkbox') {
          checkboxes[i].checked = false;
        }
      }
      this.selectedId = [];
    }
  }

  // ------------ Move All Selected------------
  moveAllSelected(parentId: string) {
    if (this.FileForm.controls['moveTo'].valid) {
      this.otherHTTPService.MoveSelected(this.selectedId, parentId).subscribe(() => {
        this.modalService.dismissAll();
        this.otherHTTPService.Showinfo("All items have been successfully moved");
      });
    }
  }

  // ------------ Remove All Selected------------
  removeAllSelected() {
    this.otherHTTPService.DeleteSelected(this.selectedId).subscribe(() => {
      this.modalService.dismissAll();
      this.otherHTTPService.Showerroe("All items have been successfully removed", "Remove");
    });
  }

  // ------------ Get User Id ------------
  getUserId() {
    this.user$ = this.auth.currentUserSubject.asObservable();
    this.user = this.user$;
    this.isNewUser = this.user.source._value.is_new_user;
    this.userId = this.user.source._value.id;
  }

  // ------------ Modal ------------
  openVerticallyCentered(content: any): void {
    this.modalService.open(content, { centered: true });
  }
  openSm(content: any) {
    this.modalService.open(content, { size: 'sm', backdrop: true });
  }
  openXl(content: any) {
    this.modalService.open(content, { fullscreen: true, backdrop: true });
  }

  // ------------ Folder Or Image ------------
  folderOrImage(type: number, content: any, id: string) {
    if (type == 1) {
      this.router.navigate(['/folders', id])
    } else {
      this.openXl(content);
    }
  }

  // ------------ Show Style ------------
  showStyle() {
    this.appearTable = !this.appearTable;
  }

  // ------------ Uploud image ------------
  onChange(files: FileList | null) {
    if (files) {
      this.files = files;
    }
    return;
  }

  // ------------ validataion ------------
  validate(): void {
    this.FileForm = new FormGroup({
      name: new FormControl(null, Validators.compose([Validators.required,
      Validators.maxLength(50)])),
      newName: new FormControl(null, Validators.compose([Validators.required,
      Validators.maxLength(50)])),
      description: new FormControl(null),
      moveTo: new FormControl(null, Validators.required),
      password: new FormControl(null, Validators.compose([Validators.required,
      Validators.maxLength(10), Validators.minLength(3), CustomValidators.number
      ]))
    });
  }
}