import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { Ng2ImgMaxService } from 'ng2-img-max';
import { first, map, startWith, tap } from 'rxjs/operators';
import { Observable } from 'rxjs';

import {
  fadeInRightOnEnterAnimation,
  jackInTheBoxOnEnterAnimation,
  fadeInOnEnterAnimation,
  fadeOutOnLeaveAnimation
} from 'angular-animations';

import { AlertService } from '../core/alerts/alert.service';
import { SessionStorageService } from '../core/session-storage-service';
import { Admin } from '../model/admin';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.scss'],
  animations: [fadeInOnEnterAnimation(), fadeOutOnLeaveAnimation(),
  fadeInRightOnEnterAnimation(), jackInTheBoxOnEnterAnimation()
  ]
})
export class ProfileComponent implements OnInit {

  admin!: Admin;
  sessionUser!: Admin;
  form!: FormGroup;
  uploadedImage!: File;
  isLoading = false;
  disabledFlag = false;

  constructor(
    private http: HttpClient,
    private route: ActivatedRoute,
    private alertService: AlertService,
    private ng2ImgMax: Ng2ImgMaxService,
    private sessionStorageService: SessionStorageService
  ) { 
    this.admin = this.sessionStorageService.getAdmin();
    this.sessionUser = this.sessionStorageService.getAdmin();
  }

  submit(): void {
    const admin = {
      username: this.form.get('username')?.value,
      ...this.form.value
    } as Admin;

    this.sessionStorageService.setAdmin(admin);

    this.http.post(`http://localhost/hacker-news/update_admin.php`, admin).pipe(first()).subscribe(() => {
        this.alertService.ok('success', 'your profile has been updated');
    }, error => {
      console.log(error);
        this.alertService.ok('error', 'your profile wasn\'t updated');
    });
  }

  onImageChange(event: any) {
    let image = event.target.files[0];
    if(!!image) {
      this.ng2ImgMax.resizeImage(image, 75, 75).pipe(first()).pipe(first()).subscribe(
        result => {
          this.uploadedImage = new File([result], result.name);
          const reader = new FileReader();
          reader.readAsDataURL(this.uploadedImage);
          reader.onload = () => {
              this.form.get('photo')?.setValue(reader.result);
          };
        },
        error => {
          console.log('😢 Oh no!', error);
        }
      );
    }
  }

  hasError = (controlName: string, errorName: string) => {
    return this.form?.controls[controlName].hasError(errorName);
  };

  private initForm() {
    this.form = new FormGroup({
      id: new FormControl({ value: this.admin.id, disabled: this.disabledFlag }, [Validators.nullValidator]),
      lastLoginTime: new FormControl({ value: this.admin.lastLoginTime, disabled: this.disabledFlag }, [Validators.nullValidator]),
      username: new FormControl({ value: this.admin.username, disabled: true }, [Validators.required]),
      password: new FormControl({ value: this.admin.password, disabled: this.disabledFlag }, [Validators.required]),
      name: new FormControl({ value: this.admin.name, disabled: this.disabledFlag }, [Validators.required]),
      email: new FormControl({ value: this.admin.email, disabled: this.disabledFlag }, [Validators.required, Validators.email]),
      phone: new FormControl({ value: this.admin.phone, disabled: this.disabledFlag }, [Validators.required]),
      city: new FormControl({ value: this.admin.city, disabled: this.disabledFlag }, [Validators.required]),
      address: new FormControl({ value: this.admin.address, disabled: this.disabledFlag }, [Validators.required]),
      addressNumber: new FormControl({ value: this.admin.addressNumber, disabled: this.disabledFlag }, [Validators.required]),
      photo: new FormControl({ value: this.admin.photo, disabled: this.disabledFlag }, [Validators.nullValidator]),
    });

    this.isLoading = false;
  }

  private getUserById(id: any): Observable<Admin> {
    return this.http.get(`http://localhost/hacker-news/get_admins.php`).pipe(
      map((admins: any) => admins.find((u: any) => u.id == id)),
    );
  }

  ngOnInit(): void {
    this.route.params.pipe(first()).subscribe(params => {
      if (params.id !== undefined) {
        this.getUserById(params.id).pipe(first()).subscribe((admin: Admin) => {
          this.sessionStorageService.setAdmin(admin);
          this.disabledFlag = true;
          this.initForm();
        });
      }
      else {
        this.initForm();
      }
    });
  }
}