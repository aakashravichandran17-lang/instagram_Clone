import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, Subject } from 'rxjs';
import { debounceTime, distinctUntilChanged, switchMap } from 'rxjs/operators';
import { environment } from '../../environments/environment';
import { User } from '../models/user.model';

@Injectable({
  providedIn: 'root'
})
export class SearchService {
  private apiUrl = `${environment.apiUrl}/users`;
  private searchSubject = new Subject<string>();

  constructor(private http: HttpClient) {}

  search(query: string): Observable<{
    success: boolean;
    data: { users: User[] };
  }> {
    return this.http.get<{
      success: boolean;
      data: { users: User[] };
    }>(`${this.apiUrl}/search?q=${encodeURIComponent(query)}`);
  }

  /**
   * Debounced search — call searchSubject.next(query) from components.
   */
  get debouncedSearch() {
    return this.searchSubject.pipe(
      debounceTime(300),
      distinctUntilChanged(),
      switchMap((query) => this.search(query))
    );
  }

  searchSubjectNext(query: string): void {
    this.searchSubject.next(query);
  }
}
