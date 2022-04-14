import { Component, OnInit } from '@angular/core';
import { fadeInOnEnterAnimation, fadeInRightOnEnterAnimation, fadeOutOnLeaveAnimation, jackInTheBoxOnEnterAnimation } from 'angular-animations';
import { AuthService } from '../auth/auth.service';
import { Admin } from '../model/admin';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss'],
  animations: [fadeInOnEnterAnimation(), fadeOutOnLeaveAnimation(),
  fadeInRightOnEnterAnimation(), jackInTheBoxOnEnterAnimation()
  ]
})
export class HomeComponent implements OnInit {
  logo: string = 'assets/logo.svg';
  loggedIn: boolean = false;
  photoLoaded = false;

  name!: string;
  image!: string;

  constructor(
    private authService: AuthService
  ) { }

  logout(): void {
    this.authService.logout();
  }

  ngOnInit(): void {
    const loadUser = sessionStorage.getItem('admin');
    if (!!loadUser) {
      const admin: Admin = JSON.parse(loadUser);
      this.name = admin.name;
      this.image = admin.photo;
      this.photoLoaded = true;
      this.loggedIn = true;
    }
  }
}
