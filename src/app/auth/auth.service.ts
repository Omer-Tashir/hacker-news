import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';

import { AlertService } from '../core/alerts/alert.service';
import { SessionStorageService } from '../core/session-storage-service';
import { Admin } from '../model/admin';

@Injectable({
  providedIn: 'root',
})
export class AuthService {

  constructor(
    private router: Router,
    private http: HttpClient,
    private alertService: AlertService,
    private sessionStorageService: SessionStorageService,
  ) { }

  login(username: string, password: string) {
    this.http.post(`http://localhost/hacker-news/login.php`, {username, password}).subscribe(result => {
      let admin = result as Admin;
      this.sessionStorageService.setAdmin(admin);
      this.router.navigate(['']);
    }, error => {
      console.log(error);
      this.alertService.httpError(error);
    });
  }

  register(admin: any) {
    this.http.post(`http://localhost/hacker-news/create_admin.php`, admin).subscribe(result => {
      let admin = result as Admin;
      this.sessionStorageService.setAdmin(admin);
      this.router.navigate(['']);
    }, error => {
      console.log(error);
      this.alertService.httpError(error);
    });
  }

  logout(error?: HttpErrorResponse | undefined) {
    if (error != undefined) {
      this.alertService.httpError(error);
    }

    this.http.get(`http://localhost/hacker-news/logout.php`).subscribe(() => {
      this.clearSessionAndLogout();
    }, error => {
      console.log(error);
      this.alertService.httpError(error);
      this.clearSessionAndLogout();
    });
  }

  private clearSessionAndLogout(): void {
    sessionStorage.clear();
    this.router.navigate(['login']);
  }
}