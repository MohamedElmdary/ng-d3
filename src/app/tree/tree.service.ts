import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class TreeService {
  constructor(private readonly http: HttpClient) {}

  public readFile<T = any>(): Observable<T> {
    return this.http.get<T>(environment.variables.WORLD_DATA);
  }
}
