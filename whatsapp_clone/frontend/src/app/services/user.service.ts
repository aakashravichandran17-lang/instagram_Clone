import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { User } from '../models/user.model';

@Injectable({
  providedIn: 'root'
})
export class UserService {
  private apiUrl = `${environment.apiUrl}/users`;

  constructor(private http: HttpClient) {}

  getUserById(id: string): Observable<{ success: boolean; data: { user: User } }> {
    return this.http.get<{ success: boolean; data: { user: User } }>(
      `${this.apiUrl}/${id}`
    );
  }

  getUserByUsername(
    username: string
  ): Observable<{ success: boolean; data: { user: User } }> {
    return this.http.get<{ success: boolean; data: { user: User } }>(
      `${this.apiUrl}/username/${username}`
    );
  }

  updateProfile(data: {
    fullName?: string;
    bio?: string;
    profileImage?: string;
  }): Observable<{ success: boolean; data: { user: User } }> {
    return this.http.put<{ success: boolean; data: { user: User } }>(
      `${this.apiUrl}/profile`,
      data
    );
  }

  followUser(id: string): Observable<{ success: boolean; data: any }> {
    return this.http.post<{ success: boolean; data: any }>(
      `${this.apiUrl}/${id}/follow`,
      {}
    );
  }

  unfollowUser(id: string): Observable<{ success: boolean; data: any }> {
    return this.http.delete<{ success: boolean; data: any }>(
      `${this.apiUrl}/${id}/follow`
    );
  }

  getFollowers(
    id: string
  ): Observable<{ success: boolean; data: { followers: User[] } }> {
    return this.http.get<{ success: boolean; data: { followers: User[] } }>(
      `${this.apiUrl}/${id}/followers`
    );
  }

  getFollowing(
    id: string
  ): Observable<{ success: boolean; data: { following: User[] } }> {
    return this.http.get<{ success: boolean; data: { following: User[] } }>(
      `${this.apiUrl}/${id}/following`
    );
  }

  getSuggestedUsers(): Observable<{ success: boolean; data: { suggestions: User[] } }> {
    return this.http.get<{ success: boolean; data: { suggestions: User[] } }>(
      `${this.apiUrl}/suggestions`
    );
  }

  searchUsers(
    query: string
  ): Observable<{ success: boolean; data: { users: User[] } }> {
    return this.http.get<{ success: boolean; data: { users: User[] } }>(
      `${this.apiUrl}/search?q=${encodeURIComponent(query)}`
    );
  }
}
