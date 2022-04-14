import { Component, OnInit } from '@angular/core';
import { fadeInOnEnterAnimation, fadeInRightOnEnterAnimation, fadeOutOnLeaveAnimation, jackInTheBoxOnEnterAnimation } from 'angular-animations';

@Component({
  selector: 'app-warning-notifications',
  templateUrl: './warning-notifications.component.html',
  styleUrls: ['./warning-notifications.component.scss'],
  animations: [fadeInOnEnterAnimation(), fadeOutOnLeaveAnimation(),
    fadeInRightOnEnterAnimation(), jackInTheBoxOnEnterAnimation()
  ]
})
export class WarningNotificationsComponent implements OnInit {

  constructor() { }

  ngOnInit(): void {
  }

}
