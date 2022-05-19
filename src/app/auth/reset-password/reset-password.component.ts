import { HttpClient } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { fadeInOnEnterAnimation } from 'angular-animations';
import { AlertService } from 'src/app/core/alerts/alert.service';

@Component({
  selector: 'app-reset-password',
  templateUrl: './reset-password.component.html',
  styleUrls: ['./reset-password.component.scss'],
  animations: [fadeInOnEnterAnimation()],
})
export class ResetPasswordComponent implements OnInit {
  logo: string = 'assets/logo.svg';
  formGroup!: FormGroup;

  constructor(
    private http: HttpClient,
    private alert: AlertService,
  ) { }

  ngOnInit(): void {
    this.formGroup = new FormGroup({
      username: new FormControl('', [Validators.required]),
    });
  }

  hasError = (controlName: string, errorName: string) => {
    return this.formGroup?.controls[controlName].hasError(errorName);
  };

  submit() {
    this.http.post(`http://localhost/hacker-news/reset_password.php`, {
      username: this.formGroup.controls['username'].value
    }).subscribe(() => {
      this.alert.ok('Your password has been reset!', 'Your temp password is: 123456, Please make sure to change it on the next log in');
    });
  }
}
