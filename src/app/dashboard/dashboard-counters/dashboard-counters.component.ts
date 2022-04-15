import { Component, OnInit, ChangeDetectionStrategy, ViewChild, EventEmitter, Input, OnDestroy, AfterViewInit, ChangeDetectorRef } from '@angular/core';
import { MultiDataSet, Label, PluginServiceGlobalRegistrationAndOptions, Color, BaseChartDirective } from 'ng2-charts';
import { delay, filter, finalize, first, map, startWith, switchMap, takeUntil, tap } from 'rxjs/operators';
import { ChartDataSets, ChartOptions, ChartType } from 'chart.js';
import { MatTableDataSource } from '@angular/material/table';
import { FormGroup } from '@angular/forms';
import { Observable, Subject } from 'rxjs';

import * as moment from 'moment/moment';
import * as pluginDataLabels from 'chartjs-plugin-datalabels';

import { SuspiciousUser } from 'src/app/model/suspicious-user';
import { DataService } from 'src/app/services/data-service';
import { StoryStartup } from 'src/app/model/story-startup';
import { CommentStartup } from 'src/app/model/comment-startup';
import { User } from 'src/app/model/user';
import { Algorithem } from 'src/app/services/algorithem';
import { MatSort } from '@angular/material/sort';
import { MatPaginator } from '@angular/material/paginator';

@Component({
  selector: 'dashboard-counters',
  templateUrl: './dashboard-counters.component.html',
  styleUrls: ['./dashboard-counters.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class DashboardCountersComponent implements OnInit, AfterViewInit, OnDestroy {
  @ViewChild(BaseChartDirective) chart!: BaseChartDirective;

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

  public chartPlugins = [ pluginDataLabels ];
  
  @Input()
  dateRange!: FormGroup;
  dataStartDate!: Date;
  dataEndDate!: Date;

  private refresh$ = new Subject<{}>();
  private destroy$ = new Subject<void>();

  userFullDetailsMap = new Map<string, any>();
  suspiciousUsers$!: Observable<SuspiciousUser[]>;
  suspiciousUsersPrecentege: number = 0;
  suspiciousStoriesPrecentege: number = 0;
  suspiciousCommentsPrecentege: number = 0;

  suspiciousUsersDisplayedColumns: string[] = ['user_name', 'email', 'start_up_name'];
  suspiciousUsersDataSource: MatTableDataSource<SuspiciousUser> = new MatTableDataSource<SuspiciousUser>([]);

  suspiciousUsersOptions: (ChartOptions) = {
    responsive: true,
    maintainAspectRatio: false,
    legend: {
      display: false
    },
    tooltips: {
      bodyFontSize: 14,
      titleFontSize: 14,
      footerFontFamily: '"Lato", sans-serif',
      bodyFontFamily: '"Lato", sans-serif',
      titleFontFamily: '"Lato", sans-serif',
      displayColors: false,
      callbacks: {
        label: (data) => {
          return data.value + ' Users';
        }
      }
    },
    scales: {
      xAxes: [{
        id: 'x-axis-0',
        ticks: {
          padding: 15,
          fontColor: '#95949A',
          fontFamily: '"Lato", sans-serif'
        }
      }],
      yAxes: [
        {
          id: 'y-axis-0',
          position: 'left',
          stacked: false,
          ticks: {
            padding: 15,
            stepSize: 1,
            maxTicksLimit: 10,
            beginAtZero: true,
            fontColor: '#95949A',
            fontFamily: '"Lato", sans-serif'
          }
        }
      ]
    },
    plugins: {
      datalabels: {
        anchor: 'center',
        align: 'center',
        backgroundColor: '#fff',
        borderColor: '#fff',
        borderRadius: 100,
        borderWidth: 2,
        opacity: 1,
        color: '#000000',
        font: {
          family: '"Lato", sans-serif',
          weight: 700,
          size: 16,
        }
      }
    },
    layout: {
      padding: {
        top: 0,
        left: 0,
        right: 0,
        bottom: 0
      }
    }
  };

  suspiciousUsersColors: Color[] = [
    {
      backgroundColor: 'transparent',
      borderColor: '#72AFF2',
      pointBackgroundColor: '#72AFF2',
      pointBorderColor: '#72AFF2',
      pointHoverBackgroundColor: '#72AFF2',
      pointHoverBorderColor: '#72AFF2',
      pointRadius: 4
    }
  ];

  suspiciousUsersLegend = false;
  suspiciousUsersType: ChartType = 'line';
  suspiciousUsersData: ChartDataSets[] = [{
    data: [],
    lineTension: 0,
    fill: false,
    datalabels: {
      backgroundColor: 'white',
      padding: {
        bottom: 0
      }
    }
  }];

  suspiciousUsersLabels: Label[] = [];

  startupsMap: Map<string, any> = new Map<string, any>();
  startupsChartLabels: Label[] = [];
  startupsChartData: MultiDataSet = [[]];
  startupsChartType: ChartType = 'pie';
  startupsChartOptions: ChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    tooltips: {
      bodyFontSize: 14,
      titleFontSize: 14,
      footerFontFamily: '"Lato", sans-serif',
      bodyFontFamily: '"Lato", sans-serif',
      titleFontFamily: '"Lato", sans-serif',
      displayColors: true,
      callbacks: {
        title: (tooltipItem: any, data: any) => {
          return "" + data.labels[tooltipItem[0].index];
        },
        label: (tooltipItem: any, data: any) => {
          return data.datasets[0].data[tooltipItem.index] + ' Users';
        }
      }
    },
    legend: {
      display: true,
      position: 'bottom',
      align: 'start',
      labels: {
        padding: 18,
        boxWidth: 14,
        fontSize: 14,
        fontColor: '#95949A',
        fontFamily: '"Lato", sans-serif'
      },
    },
    plugins: {
      datalabels: {
        anchor: 'center',
        align: 'center',
        color: '#000000',
        font: {
          family: '"Lato", sans-serif',
          size: 14
        }
      }
    },
    layout: {
      padding: {
        top: 0,
        left: 0,
        right: 0,
        bottom: 0
      }
    }
  };

  startupsChartPlugins: PluginServiceGlobalRegistrationAndOptions[] = [{}];
  startupsChartColors: Color[] = [{ backgroundColor: [] }];

  countUpOptions = {
    duration: 1,
    useGrouping: true,
    useEasing: true
  }

  countUpOptionsCounter = {
    decimalPlaces: 0,
    ...this.countUpOptions
  };

  countUpOptionsPrecentege = {
    decimalPlaces: 1,
    ...this.countUpOptions,
    formattingFn: (n: number) => `${n}%` 
  };

  constructor(
    private algorithem: Algorithem,
    private dataService: DataService,
    private cdref: ChangeDetectorRef
  ) { }

  setDataSourceAttributes() {
    this.suspiciousUsersDataSource.paginator = this.paginator;
    this.suspiciousUsersDataSource.sort = this.sort;
  }

  ngOnInit(): void {
    this.dataStartDate = this.dateRange.get('start')?.value.toDate();
    this.dataEndDate = this.dateRange.get('end')?.value.toDate();

    let allUsers: SuspiciousUser[] = [];
    this.suspiciousUsers$ = this.refresh$.pipe(
      switchMap(() => this.dataService.getSuspiciousUsers()),
      tap(users => allUsers = users),
      map(users => users
        .filter(user => moment(user.identify_date)
          .isBetween(moment(this.dataStartDate), moment(this.dataEndDate)))
      ),
      tap(() => this.cleanCharts()),
      tap(users => this.getUsersFullDetails(users)),
      tap(users => this.setSuspiciousUsersTable(users)),
      tap(users => this.setSuspiciousUsersPerStartup(users)),
      tap(users => this.setSuspiciousUsersPerStartupByDateRange(users)),
      tap(users => this.runAlgorithem(allUsers, users))
    );

    this.dateRange.valueChanges.pipe(
      tap(date => {
        this.dataStartDate = date.start.toDate();
        this.dataEndDate = date.end ? date.end.toDate() : date.start.toDate();
        this.refresh$.next();
      }),
      takeUntil(this.destroy$),
      finalize(() => this.cdref.detectChanges())
    ).subscribe();
  }

  private getUsersFullDetails(suspiciousUsers: SuspiciousUser[]): void {
    this.dataService.getUsers().pipe(
      first(),
      map(users => users.filter(u => suspiciousUsers.map(su => su.user_name).includes(u.user_id))),
      tap(users => users.forEach(u => {
        this.userFullDetailsMap.set(u.user_id, u.email);
      })),
      finalize(() => this.cdref.detectChanges())
    ).subscribe();
  }

  private runAlgorithem(allUsers: SuspiciousUser[], users: SuspiciousUser[]): void {
    this.algorithem.getSuspiciousCommentsPrecentege(users).pipe(
      tap(num => this.suspiciousCommentsPrecentege = num),
      finalize(() => this.cdref.detectChanges())
    ).subscribe();

    this.algorithem.getSuspiciousStoriesPrecentege(users).pipe(
      tap(num => this.suspiciousStoriesPrecentege = num),
      finalize(() => this.cdref.detectChanges())
    ).subscribe();

    this.algorithem.getSuspiciousUsersPrecentege(allUsers, users).pipe(
      tap(num => this.suspiciousUsersPrecentege = num),
      finalize(() => this.cdref.detectChanges())
    ).subscribe();
  }

  private cleanCharts(): void {
    this.startupsChartPlugins = [{}];
    this.startupsChartColors = [{ backgroundColor: [] }];
    this.startupsChartData = [[]];
    this.startupsChartLabels = [];
    this.startupsMap = new Map<string, any>();
    this.suspiciousUsersLabels = [];
    this.suspiciousUsersData[0].data = [];
    this.suspiciousUsersDataSource.data = [];
  }

  setSuspiciousUsersTable(users: SuspiciousUser[]): void {
    let usersCountMap = new Map<string, number>();
    for (let user of users) {
      if (usersCountMap.has(user.user_name)) {
        const userCount: number = usersCountMap.get(user.user_name) ?? 0;
        usersCountMap.set(user.user_name, userCount + 1);
      }
      else {
        usersCountMap.set(user.user_name, 1);
      }
    }

    // remove duplicates users
    users = [...users.reduce((a, c) => {
      a.set(c.user_name, c);
      return a;
    }, new Map()).values()];

    // sort users by count of apperance
    usersCountMap = new Map([...usersCountMap].sort((a, b) => b[1] - a[1]).slice(0, this.paginator?.pageSize));

    let dataSource: SuspiciousUser[] = [];
    for (let username of usersCountMap.keys()) {
      const user = users.find(u => u.user_name === username);
      if (user) {
        dataSource.push(user);
      }
    }

    this.suspiciousUsersDataSource.data = dataSource;
  }

  setSuspiciousUsersPerStartup(users: SuspiciousUser[]): void {
    let startupCountMap = new Map<string, number>();
    for (let user of users) {
      if (startupCountMap.has(user.start_up_name)) {
        const userCount: number = startupCountMap.get(user.start_up_name) ?? 0;
        startupCountMap.set(user.start_up_name, userCount + 1);
      }
      else {
        startupCountMap.set(user.start_up_name, 1);
      }
    }

    for (let [startup, count] of startupCountMap.entries()) {
      if (count > 0) {
        this.startupsMap.set(startup, {color: this.getRandomColor(), value: count})
      }
    }

    this.startupsChartData[0] = Array.from(this.startupsMap.values()).map(a => a.value);
    this.startupsChartLabels = Array.from(this.startupsMap.keys());
    this.startupsChartColors[0].backgroundColor = Array.from(this.startupsMap.values()).map(a => a.color);
  }

  setSuspiciousUsersPerStartupByDateRange(users: SuspiciousUser[]): void {
    var a = moment(this.dataStartDate);
    var b = moment(this.dataEndDate);
    const daysDiff = Math.abs(b.diff(a, 'days'));
    const points = 12;

    let startupCountMap = new Map<string, number>(); // date range, count

    for (let i = 1; i <= points; i++) {
      const fromDate = moment(this.dataStartDate).add(((daysDiff / points) * (i-1)), 'days');
      const toDate = moment(this.dataStartDate).add(((daysDiff / points) * i), 'days');

      let usersArrPerRange = users.filter(user => moment(user.identify_date)
          .isBetween(fromDate, toDate))

      startupCountMap.set(fromDate.format('DD/MM/YY'), usersArrPerRange.length);
    }

    this.suspiciousUsersLabels = Array.from(startupCountMap.keys());
    this.suspiciousUsersData[0].data = this.suspiciousUsersLabels.map(key => startupCountMap.get("" + key));
  }

  private getRandomColor(): string {
    return `#${Math.floor(Math.random() * 16777215).toString(16)}90`;
  }

  ngAfterViewInit(): void {
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
