import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { environment } from '../../environments/environment';

@Injectable({ providedIn: 'root' })
export class ImagesService {
  private http = inject(HttpClient);
  private apiUrl = environment.apiUrl;

  uploadImage(file: File): Promise<string> {
    const formData = new FormData();
    formData.append('file', file);
    return firstValueFrom(
      this.http.post<{ imageUrl: string }>(`${this.apiUrl}/images/upload`, formData),
    ).then((response) => response.imageUrl);
  }
}
