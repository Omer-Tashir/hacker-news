import { Component, OnInit, ChangeDetectionStrategy, ViewChild, EventEmitter, Input, OnDestroy, AfterViewInit } from '@angular/core';
import { MultiDataSet, Label, PluginServiceGlobalRegistrationAndOptions, Color, BaseChartDirective } from 'ng2-charts';
import { delay, filter, map, startWith, switchMap, takeUntil, tap } from 'rxjs/operators';
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

@Component({
  selector: 'dashboard-counters',
  templateUrl: './dashboard-counters.component.html',
  styleUrls: ['./dashboard-counters.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class DashboardCountersComponent implements OnInit, AfterViewInit, OnDestroy {
  @ViewChild(BaseChartDirective) chart!: BaseChartDirective;

  public chartPlugins = [ pluginDataLabels ];
  
  @Input()
  dateRange!: FormGroup;
  dataStartDate!: Date;
  dataEndDate!: Date;

  private refresh$ = new Subject<{}>();
  private destroy$ = new Subject<void>();

  users$!: Observable<User[]>;
  suspiciousUsers$!: Observable<SuspiciousUser[]>;

  suspiciousUsersDisplayedColumns: string[] = ['user_name', 'email', 'start_up_name'];
  suspiciousUsersDataSource!: MatTableDataSource<SuspiciousUser>;

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
          return data.value + ' Requests';
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

  countUpOptionsAvg = {
    decimalPlaces: 1,
    ...this.countUpOptions
  };

  constructor(
    private dataService: DataService
  ) { }

  ngOnInit(): void {
    this.dataStartDate = this.dateRange.get('start')?.value.toDate();
    this.dataEndDate = this.dateRange.get('end')?.value.toDate();

    this.users$ = this.refresh$.pipe(
      switchMap(() => this.dataService.getUsers())
    );

    this.suspiciousUsers$ = this.refresh$.pipe(
      switchMap(() => this.dataService.getSuspiciousUsers()),
      map(users => users
        .filter(user => moment(user.identify_date)
          .isBetween(moment(this.dataStartDate), moment(this.dataEndDate)))
      ),
      tap(users => this.setSuspiciousUsersTable(users)),
      tap(users => this.setSuspiciousUsersPerStartup(users))
    );

    this.dateRange.valueChanges.pipe(
      tap(date => {
        this.dataStartDate = date.start.toDate();
        this.dataEndDate = date.end ? date.end.toDate() : date.start.toDate();
        this.refresh$.next();
      }),
      takeUntil(this.destroy$)
    ).subscribe();
  }

  getUserEmail(users: User[], user_id: string): any {
    return users?.find(user => user.user_id === user_id)?.email;
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
    usersCountMap = new Map([...usersCountMap].sort((a, b) => b[1] - a[1]).slice(0, 10));

    let dataSource: SuspiciousUser[] = [];
    for (let username of usersCountMap.keys()) {
      const user = users.find(u => u.user_name === username);
      if (user) {
        dataSource.push(user);
      }
    }

    this.suspiciousUsersDataSource = new MatTableDataSource(dataSource);
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

  private getRandomColor(): string {
    return `#${Math.floor(Math.random() * 16777215).toString(16)}90`;
  }

  ngAfterViewInit(): void {
    this.refresh$.pipe(
      tap(() => this.chart.chart.resize()),
      takeUntil(this.destroy$)
    ).subscribe();

    this.refresh$.next();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
    this.refresh$.complete();
  }
}
