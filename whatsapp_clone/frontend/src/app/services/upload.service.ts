import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export interface UploadResponse {
  success: boolean;
  message: string;
  data: {
    imageUrl: string;
    filename: string;
  };
}

@Injectable({
  providedIn: 'root'
})
export class UploadService {
  private apiUrl = `${environment.apiUrl}/upload`;

  constructor(private http: HttpClient) {}

  /**
   * Uploads an image file to the backend using multipart/form-data.
   * The browser sets the Content-Type (with multipart boundary) automatically,
   * so we never set it manually.
   */
  uploadImage(file: File): Observable<UploadResponse> {
    const formData = new FormData();
    formData.append('image', file);

    return this.http.post<UploadResponse>(`${this.apiUrl}/image`, formData);
  }
}
