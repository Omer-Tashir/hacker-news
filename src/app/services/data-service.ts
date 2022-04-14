import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { map } from "rxjs/operators";
import { Observable } from "rxjs";

import { User } from "../model/user";
import { Story } from "../model/story";
import { Comment } from "../model/comment";
import { StoryStartup } from "../model/story-startup";
import { CommentStartup } from "../model/comment-startup";
import { SuspiciousUser } from "../model/suspicious-user";
import { WarningNotification } from "../model/warning-notification";
import { WarningNotificationType } from "../model/warning-notification-type";

@Injectable({
    providedIn: 'root',
})
export class DataService {

    constructor(
        private http: HttpClient
    ) { }

    getUsers(): Observable<User[]> {
        return this.http.get(`http://localhost/hacker-news/get_users.php`).pipe(
            map((result: any) => result as User[])
        );
    }

    getComments(): Observable<Comment[]> {
        return this.http.get(`http://localhost/hacker-news/get_comments.php`).pipe(
            map((result: any) => result as Comment[])
        );
    }
    
    getStories(): Observable<Story[]> {
        return this.http.get(`http://localhost/hacker-news/get_stories.php`).pipe(
            map((result: any) => result as Story[])
        );
    }

    getCommentStartup(): Observable<CommentStartup[]> {
        return this.http.get(`http://localhost/hacker-news/get_comment_startup.php`).pipe(
            map((result: any) => result as CommentStartup[])
        );
    }

    getStoryStartup(): Observable<StoryStartup[]> {
        return this.http.get(`http://localhost/hacker-news/get_story_startup.php`).pipe(
            map((result: any) => result as StoryStartup[])
        );
    }

    getSuspiciousUsers(): Observable<SuspiciousUser[]> {
        return this.http.get(`http://localhost/hacker-news/get_suspicious_users.php`).pipe(
            map((result: any) => result as SuspiciousUser[])
        );
    }

    getWarningNotifications(): Observable<WarningNotification[]> {
        return this.http.get(`http://localhost/hacker-news/get_warning_notifications.php`).pipe(
            map((result: any) => result as WarningNotification[])
        );
    }

    getWarningNotificationTypes(): Observable<WarningNotificationType[]> {
        return this.http.get(`http://localhost/hacker-news/get_warning_notification_types.php`).pipe(
            map((result: any) => result as WarningNotificationType[])
        );
    }
}