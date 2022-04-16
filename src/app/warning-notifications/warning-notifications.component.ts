import { AfterViewInit, ChangeDetectorRef, Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort, Sort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { fadeInOnEnterAnimation, fadeInRightOnEnterAnimation, fadeOutOnLeaveAnimation, jackInTheBoxOnEnterAnimation } from 'angular-animations';
import { Observable, Subject } from 'rxjs';
import { finalize, first, map, switchMap, takeUntil, tap } from 'rxjs/operators';
import { WarningNotification } from '../model/warning-notification';
import { WarningNotificationType } from '../model/warning-notification-type';
import { SuspiciousUser } from '../model/suspicious-user';
import { Algorithem } from '../services/algorithem';
import { DataService } from '../services/data-service';

import * as moment from 'moment/moment';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { AlertService } from '../core/alerts/alert.service';

@Component({
  selector: 'app-warning-notifications',
  templateUrl: './warning-notifications.component.html',
  styleUrls: ['./warning-notifications.component.scss'],
  animations: [fadeInOnEnterAnimation(), fadeOutOnLeaveAnimation(),
    fadeInRightOnEnterAnimation(), jackInTheBoxOnEnterAnimation()
  ]
})
export class WarningNotificationsComponent implements OnInit, AfterViewInit, OnDestroy {

  private refresh$ = new Subject<{}>();
  private destroy$ = new Subject<void>();

  isLoading = false;
  //blockForm!: FormGroup;
  warningForm!: FormGroup;
  suspiciousUsers$!: Observable<string[]>;
  warningNotificationsTypes: WarningNotificationType[] = [];

  constructor(
    private http: HttpClient,
    private alertService: AlertService,
    private dataService: DataService,
    private cdref: ChangeDetectorRef
  ) { }

  submit(): void {
    const warning = {
      identify_date: moment().format('DD/MM/YYYY HH:mm'),
      ...this.warningForm.value
    } as WarningNotification;

    this.http.post(`http://localhost/hacker-news/send_warning.php`, warning).pipe(first()).subscribe(() => {
        this.alertService.ok('success', 'a warning was sent to the user');
    }, error => {
        console.log(error);
        this.alertService.ok('error', 'the warning couldn\'t be sent to the user');
    });
  }

  // blockSubmit(): void {
  //   this.http.post(`http://localhost/hacker-news/send_block.php`, this.blockForm.value).pipe(first()).subscribe(() => {
  //       this.alertService.ok('success', 'the user was blocked');
  //   }, error => {
  //       console.log(error);
  //       this.alertService.ok('error', 'the user couldn\'t be blocked');
  //   });
  // }

  warningFormHasError = (controlName: string, errorName: string) => {
    return this.warningForm?.controls[controlName].hasError(errorName);
  };

  // blockFormHasError = (controlName: string, errorName: string) => {
  //   return this.warningForm?.controls[controlName].hasError(errorName);
  // };

  private initForms() {
    // this.blockForm = new FormGroup({
    //   user_id: new FormControl(null, [Validators.required]),
    // });
    
    this.warningForm = new FormGroup({
      warning_id: new FormControl(null, [Validators.required]),
      user_id: new FormControl(null, [Validators.required]),
    });

    this.isLoading = false;
  }

  ngOnInit() {
    this.initForms();

    this.suspiciousUsers$ = this.refresh$.pipe(
      switchMap(() => this.dataService.getWarningNotificationTypes()),
      tap(types => this.warningNotificationsTypes = types),
      switchMap(() => this.dataService.getSuspiciousUsers()),
      map(users => Array.from(new Set(users.map(user => user.user_name)))),
      takeUntil(this.destroy$),
      finalize(() => this.cdref.detectChanges())
    );
  }

  ngAfterViewInit() {
    this.refresh$.pipe(
      takeUntil(this.destroy$),
      finalize(() => this.cdref.detectChanges())
    ).subscribe();

    this.refresh$.next();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
    this.refresh$.complete();
  }
}
