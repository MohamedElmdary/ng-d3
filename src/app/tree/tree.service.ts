import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class TreeService {
  constructor(private readonly http: HttpClient) {}

  public readFile<T = any>(path: string): Observable<T> {
    return this.http.get<T>(path);
  }
}
