import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { ToastrService } from 'ngx-toastr';
import { BehaviorSubject, finalize, map, Observable, Subject, tap } from 'rxjs';
import { environment } from 'src/environments/environment';

const API_AUTH_URL = `${environment.apiUrl}/Auth`;
const API_DRIVE_URL = `${environment.apiUrl}/Folder`;

@Injectable({
    providedIn: 'root'
})
export class OtherHTTPService {

    isLoading$: Observable<boolean>;
    isLoadingSubject: BehaviorSubject<boolean>;
    isCrudLoading$: Observable<boolean>;
    isCrudLoadingSubject: BehaviorSubject<boolean>;
    isInfoLoading$: Observable<boolean>;
    isInfoLoadingSubject: BehaviorSubject<boolean>;

    constructor(private http: HttpClient, private toastr: ToastrService) {
        this.isLoadingSubject = new BehaviorSubject<boolean>(false);
        this.isLoading$ = this.isLoadingSubject.asObservable();
        this.isCrudLoadingSubject = new BehaviorSubject<boolean>(false);
        this.isCrudLoading$ = this.isCrudLoadingSubject.asObservable();
        this.isInfoLoadingSubject = new BehaviorSubject<boolean>(false);
        this.isInfoLoading$ = this.isInfoLoadingSubject.asObservable();
    }

    private _refreshrequiard = new Subject<void>();
    get Refreshrequiard() {
        return this._refreshrequiard;
    }

    // ------------------ List Methods ------------------
    // begin::List
    List1(id: string, type: number, q: string, size: number, page: number) {
        this.isLoadingSubject.next(true);
        return this.http.get(`${API_DRIVE_URL}/${id}/list1?type=${type}&q=${q}&size=${size}&page=${page}`)
            .pipe(
                map((res: any) => res),
                finalize(() => this.isLoadingSubject.next(false))
            );
    }
    List2(id: string, type: number, q: string, perantId: string, size: number, page: number) {
        this.isLoadingSubject.next(true);
        return this.http.get(`${API_DRIVE_URL}/${id}/list2?type=${type}&q=${q}&parent_id=${perantId}&size=${size}&page=${page}`)
            .pipe(
                map((res: any) => res),
                finalize(() => this.isLoadingSubject.next(false))
            );
    }
    // end::List

    // ------------------ Crud Methods ------------------

    // begin::Crud
    Upload(description: string, perantId: string, userId: string, files: FileList) {
        this.isCrudLoadingSubject.next(true);
        const formData = new FormData();
        formData.append('description', description);
        formData.append('parent_id', perantId);
        formData.append('user_id', userId);
        for (let i = 0; i < files.length; i++) {
            formData.append('formData', files[i], files[i].name);
        }
        return this.http.post(`${API_DRIVE_URL}/add-image`, formData).pipe(
            tap(() => {
                this.Refreshrequiard.next();
            }),
            map((res: any) => res),
            finalize(() => this.isCrudLoadingSubject.next(false))
        );
    }
    Add(name: string, parent_id: string, user_id: string) {
        this.isCrudLoadingSubject.next(true);
        return this.http.post(`${API_DRIVE_URL}/add-folder`, {
            name,
            parent_id,
            user_id
        }).pipe(
            tap(() => {
                this.Refreshrequiard.next();
            }),
            map((res: any) => res),
            finalize(() => this.isCrudLoadingSubject.next(false))
        );
    }
    Reneme(id: any, newName: any) {
        this.isCrudLoadingSubject.next(true);
        return this.http.post(`${API_DRIVE_URL}/${id}/edit?newName=${newName}`, {})
            .pipe(
                tap(() => {
                    this.Refreshrequiard.next();
                }),
                map((res: any) => res),
                finalize(() => this.isCrudLoadingSubject.next(false))
            );
    }
    Move(id: string, perantId: string) {
        this.isCrudLoadingSubject.next(true);
        return this.http.post(`${API_DRIVE_URL}/${id}/moveto/${perantId}`, {})
            .pipe(
                tap(() => {
                    this.Refreshrequiard.next();
                }),
                map((res: any) => res),
                finalize(() => this.isCrudLoadingSubject.next(false))
            );
    }
    Remove(id: any) {
        this.isCrudLoadingSubject.next(true);
        return this.http.post(`${API_DRIVE_URL}/${id}/delete`, {})
            .pipe(
                tap(() => {
                    this.Refreshrequiard.next();
                }),
                map((res: any) => res),
                finalize(() => this.isCrudLoadingSubject.next(false))
            );
    }
    MoveSelected(selected: string[], parentId: string) {
        this.isCrudLoadingSubject.next(true);
        return this.http.post(`${API_DRIVE_URL}/moveTo/${parentId}`, { selected })
            .pipe(
                tap(() => {
                    this.Refreshrequiard.next();
                }),
                map((res: any) => res),
                finalize(() => this.isCrudLoadingSubject.next(false))
            );
    }
    RemoveSelected(selected: string[]) {
        this.isCrudLoadingSubject.next(true);
        return this.http.post(`${API_DRIVE_URL}/delete`, selected)
            .pipe(
                tap(() => {
                    this.Refreshrequiard.next();
                }),
                map((res: any) => res),
                finalize(() => this.isCrudLoadingSubject.next(false))
            );
    }
    DeleteSelected(selected: string[]) {
        this.isCrudLoadingSubject.next(true);
        return this.http.post(`${API_DRIVE_URL}/delete`, { selected })
            .pipe(
                tap(() => {
                    this.Refreshrequiard.next();
                }),
                map((res: any) => res),
                finalize(() => this.isCrudLoadingSubject.next(false))
            );
    }
    GetFolder(id: string) {
        this.isInfoLoadingSubject.next(true);
        return this.http.get(`${API_DRIVE_URL}/${id}/get`)
            .pipe(
                map((res: any) => res),
                finalize(() => this.isInfoLoadingSubject.next(false))
            );
    }
    UploudImage(formData: FormData) {
        return this.http.post(`${API_AUTH_URL}/uploud`, formData);
    }
    // end::Crud

    // ------------------ Toater Methods ------------------

    // begin::Toater
    Showerroe(message: string, title: string) {
        this.toastr.error(message, title, {
            positionClass: "toast-top-left",
            closeButton: true,
            timeOut: 3000
        });
    }
    Showsuccess(message: string) {
        this.toastr.success(message, 'Add', {
            positionClass: "toast-bottom-full-width",
            closeButton: true,
            timeOut: 3000
        });
    }
    Showinfo(message: string) {
        this.toastr.info(message, 'Update', {
            positionClass: "toast-bottom-full-width",
            closeButton: true,
            timeOut: 3000
        });
    }
    ShowInfoRegistration(message: string) {
        this.toastr.info(message, 'Registration', {
            positionClass: "toast-bottom-full-width",
            closeButton: true,
            timeOut: 2000
        });
    }
    // end::Toater
}
