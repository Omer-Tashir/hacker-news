import { Injectable } from "@angular/core";
import { forkJoin, Observable, of } from "rxjs";
import { map, tap } from "rxjs/operators";
import { Comment } from "../model/comment";
import { Story } from "../model/story";
import { SuspiciousUser } from "../model/suspicious-user";
import { DataService } from "./data-service";

@Injectable({
    providedIn: 'root',
})
export class Algorithem {

    constructor(
        private dataService: DataService,
    ) { }

    getSuspiciousUsersPrecentege(allUsers: SuspiciousUser[], users: SuspiciousUser[]): Observable<number> {
        return of((users.length / allUsers.length) * 100);
    }

    getSuspiciousUsersTrend(users: SuspiciousUser[]): Observable<number> {
        return of(0);
    }
    
    getSuspiciousStoriesPrecentege(users: SuspiciousUser[]): Observable<number> {
        let totalStories = 0;
        return this.dataService.getStories().pipe(
            tap((results: Story[]) => totalStories = results.length),
            map((results: Story[]) => results.filter(r => users.map(u => u.user_name).includes(r.user_id))),
            map((results: Story[]) => (results.length / totalStories) * 100),
        );
    }

    getSuspiciousCommentsPrecentege(users: SuspiciousUser[]): Observable<number> {
        let totalComments = 0;
        return this.dataService.getComments().pipe(
            tap((results: Comment[]) => totalComments = results.length),
            map((results: Comment[]) => results.filter(r => users.map(u => u.user_name).includes(r.user_id))),
            map((results: Comment[]) => (results.length / totalComments) * 100),
        );
    }
}