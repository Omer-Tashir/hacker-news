import { AfterViewInit, ChangeDetectorRef, Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { fadeInOnEnterAnimation, fadeInRightOnEnterAnimation, fadeOutOnLeaveAnimation, jackInTheBoxOnEnterAnimation } from 'angular-animations';
import { Observable, Subject } from 'rxjs';
import { finalize, switchMap, takeUntil, tap } from 'rxjs/operators';
import { WarningNotification } from '../model/warning-notification';
import { WarningNotificationType } from '../model/warning-notification-type';
import { Algorithem } from '../services/algorithem';
import { DataService } from '../services/data-service';

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

  warningNotifications$!: Observable<WarningNotification[]>;

  displayedColumns: string[] = ['id', 'identify_date', 'warning_id', 'user_id'];
  dataSource: MatTableDataSource<WarningNotification> = new MatTableDataSource<WarningNotification>([]);

  warningNotificationTypes: WarningNotificationType[] = [];

  sort!: MatSort;
  paginator!: MatPaginator;

  @ViewChild(MatSort) set matSort(ms: MatSort) {
    this.sort = ms;
    this.setDataSourceAttributes();
  }

  @ViewChild(MatPaginator) set matPaginator(mp: MatPaginator) {
      this.paginator = mp;
      this.setDataSourceAttributes();
  }

  constructor(
    private algorithem: Algorithem,
    private dataService: DataService,
    private cdref: ChangeDetectorRef
  ) { }

  setDataSourceAttributes() {
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
  }

  applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();

    if (this.dataSource.paginator) {
      this.dataSource.paginator.firstPage();
    }
  }

  ngOnInit() {
    this.warningNotifications$ = this.refresh$.pipe(
      switchMap(() => this.dataService.getWarningNotifications()),
      tap(warnings => this.dataSource.data = warnings),
      takeUntil(this.destroy$),
      finalize(() => this.cdref.detectChanges())
    );
  }

  ngAfterViewInit() {
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;

    console.log(this.paginator);

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
