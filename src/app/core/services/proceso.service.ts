import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Proceso } from '../models/proceso.model';
import { API_URL } from '../../app.config';

@Injectable({ providedIn: 'root' })
export class ProcesoService {

  private http = inject(HttpClient);
  private apiUrl = inject(API_URL);


  //private apiUrl = '/api/Procesos';
  //constructor(private http: HttpClient) {}

    private baseUrl = `${this.apiUrl}/api/Procesos`;


  obtenerProcesos(): Observable<Proceso[]> {
    return this.http.get<Proceso[]>(this.baseUrl);
  }
}