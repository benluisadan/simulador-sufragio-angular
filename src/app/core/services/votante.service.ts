import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { API_URL } from '../../app.config';


@Injectable({ providedIn: 'root' })
export class VotanteService {


  private http = inject(HttpClient);
  private apiUrl = inject(API_URL);


  //constructor(private http: HttpClient) { }

  registrarVotante(data: any): Observable<any> {
    //return this.http.post('/api/Votantes/registrar', data);
    return this.http.post(`${this.apiUrl}/api/Votantes/registrar`, data);
  }


  validarDni(dni: string) {
    //return this.http.get(`/api/Votantes/validar-dni/${dni}`);
    return this.http.get(`${this.apiUrl}/api/Votantes/validar-dni/${dni}`);
  }


}
