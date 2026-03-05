import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { API_URL } from '../../app.config';


@Injectable({ providedIn: 'root' })
export class UbigeoService {

  private http = inject(HttpClient);
  private apiUrl = inject(API_URL);

  //constructor(private http: HttpClient) {}

  getDepartamentos(): Observable<any[]> {
    //return this.http.get<any[]>('/api/Ubigeo/departamentos');
    return this.http.get<any[]>(`${this.apiUrl}/api/Ubigeo/departamentos`);

  }

  getProvincias(departamentoId: string): Observable<any[]> {
    //return this.http.get<any[]>(`/api/Ubigeo/provincias/${departamentoId}`);
    return this.http.get<any[]>(`${this.apiUrl}/api/Ubigeo/provincias/${departamentoId}`);
  }



  getDistritos(departamentoId: string, provinciaId: string): Observable<any[]> {
    // return this.http.get<any[]>(`/api/Ubigeo/distritos/${departamentoId}/${provinciaId}`);
    return this.http.get<any[]>(`${this.apiUrl}/api/Ubigeo/distritos/${departamentoId}/${provinciaId}`);
  }

  getTelefonia(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/api/Ubigeo/telefonia`);
  }


}