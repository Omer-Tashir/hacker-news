import { Injectable } from '@angular/core';

@Injectable({
    providedIn: 'root'
})
export class SessionStorageService {

  get_users: any;
  get_comments: any;
  get_stories: any;
  get_comment_startup: any;
  get_story_startup: any;
  get_suspicious_users: any;
  get_active_users: any;

  public getAdmin() {
    if (sessionStorage.getItem('admin')) {
      const admin: any = sessionStorage.getItem('admin');
      return JSON.parse(admin);
    }

    return undefined;
  }

  public setAdmin(admin: any) {
    sessionStorage.setItem('admin', JSON.stringify(admin));
  }

  public clear() {
    this.get_users = undefined;
    this.get_comments = undefined;
    this.get_stories = undefined;
    this.get_comment_startup = undefined;
    this.get_story_startup = undefined;
    this.get_suspicious_users = undefined;
    this.get_active_users = undefined;
  }
}