import { animate, animateChild, query, stagger, state, style, transition, trigger } from '@angular/animations';
import { fadeInOnEnterAnimation, fadeInRightOnEnterAnimation, fadeOutOnLeaveAnimation, jackInTheBoxOnEnterAnimation } from 'angular-animations';
import { AfterViewInit, Component, HostBinding, OnInit } from '@angular/core';
import { DataService } from '../services/data-service';
import { FormControl, FormGroup } from '@angular/forms';
import { map, tap } from 'rxjs/operators';

import * as moment from 'moment/moment';


@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss'],
  animations: [fadeInOnEnterAnimation(), fadeOutOnLeaveAnimation(),
    fadeInRightOnEnterAnimation(), jackInTheBoxOnEnterAnimation(),
    trigger('fadeInUpAllAnimation', [
      transition(':enter', [
        query('@*', stagger(100, animateChild()), { optional: true })
      ])
    ]),
    trigger('item', [
      state('void', style({ opacity: 0, transform: 'translateY(-5%)' })),
      transition(':enter', [
        animate(`.7s ease`, style({ opacity: 1, transform: 'translateY(0)' }))
      ]),
    ])
  ]
})
export class DashboardComponent implements OnInit {

  dateRange: FormGroup = new FormGroup({
    start: new FormControl(moment()),
    end: new FormControl(moment()),
  });

  constructor(
    private dataService: DataService
  ) { }

  ngOnInit(): void {
    this.dataService.getSuspiciousUsers().pipe(
      map(users => users.map((u: any) => moment(u.identify_date).toDate().getTime()).sort().reverse()),
      map((dates: any) => dates.filter((d: any) => !isNaN(d))[0]),
      tap((date: any) => {
        this.dateRange.controls['end'].setValue(moment(date));
        this.dateRange.controls['start'].setValue(moment(date).subtract(1, 'month'));
      }),
    ).subscribe();
  }

  @HostBinding('@fadeInUpAllAnimation')
  get hostAnimation() {
    return true;
  }
}
