import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { fadeInOnEnterAnimation } from 'angular-animations';
import { Ng2ImgMaxService } from 'ng2-img-max';
import { first } from 'rxjs/operators';

import { AuthService } from '../auth.service';

/**
 * Login page component.
 */
@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss'],
  animations: [fadeInOnEnterAnimation()],
})
export class LoginComponent implements OnInit {
  logo: string = 'assets/logo.svg';
  newUser: boolean = false;
  uploadedImage!: File;
  formGroup!: FormGroup;

  constructor(
    private router: Router,
    private authService: AuthService,
    private ng2ImgMax: Ng2ImgMaxService,
    private cdref: ChangeDetectorRef
  ) { }

  ngOnInit(): void {
    this.formGroup = new FormGroup({
      username: new FormControl('', [Validators.required]),
      password: new FormControl('', [Validators.required]),
      name: new FormControl('', [Validators.nullValidator]),
      email: new FormControl('', [Validators.nullValidator]),
      phone: new FormControl('', [Validators.nullValidator]),
      city: new FormControl('', [Validators.nullValidator]),
      address: new FormControl('', [Validators.nullValidator]),
      addressNumber: new FormControl('', [Validators.nullValidator]),
      photo: new FormControl('', [Validators.nullValidator]),
    });
  }
  
  toggleNewUser(): void {
    this.newUser = !this.newUser;
    this.formGroup.reset();

    if (this.newUser) {
      this.formGroup.get('name')?.setValidators(Validators.required);
      this.formGroup.get('email')?.setValidators([Validators.required, Validators.email]);
      this.formGroup.get('phone')?.setValidators(Validators.required);
      this.formGroup.get('city')?.setValidators(Validators.required);
      this.formGroup.get('address')?.setValidators(Validators.required);
      this.formGroup.get('addressNumber')?.setValidators(Validators.required);
    }
    else {
      this.formGroup.get('name')?.setValidators(Validators.nullValidator);
      this.formGroup.get('email')?.setValidators(Validators.nullValidator);
      this.formGroup.get('phone')?.setValidators(Validators.nullValidator);
      this.formGroup.get('city')?.setValidators(Validators.nullValidator);
      this.formGroup.get('address')?.setValidators(Validators.nullValidator);
      this.formGroup.get('addressNumber')?.setValidators(Validators.nullValidator);
    }

    this.formGroup.updateValueAndValidity({ emitEvent: true });
    this.cdref.detectChanges();
  }

  resetPassword(): void {
    this.router.navigate(['reset-password']);
  }

  onImageChange(event: any) {
    let image = event.target.files[0];
    if(!!image) {
      this.ng2ImgMax.resizeImage(image, 64, 64).pipe(first()).subscribe(
        result => {
          this.uploadedImage = new File([result], result.name);
          const reader = new FileReader();
          reader.readAsDataURL(this.uploadedImage);
          reader.onload = () => {
              this.formGroup.get('photo')?.setValue(reader.result);
          };
        },
        error => {
          console.log('😢 Oh no!', error);
        }
      );
    }
  }

  hasError = (controlName: string, errorName: string) => {
    return this.formGroup?.controls[controlName].hasError(errorName);
  };

  submit() {
    if (this.formGroup.invalid) {
      return;
    }

    if (this.newUser) {
      this.authService.register(this.formGroup.value);
    }
    else {
      this.authService.login(
        this.formGroup.get('username')?.value,
        this.formGroup.get('password')?.value
      );
    }
  }
}