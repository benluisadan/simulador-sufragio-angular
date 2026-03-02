import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class VotanteService {

  constructor(private http: HttpClient) { }

  registrarVotante(data: any): Observable<any> {
    return this.http.post('/api/Votantes/registrar', data);
  }

  validarDni(dni: string) {
    return this.http.get(`/api/Votantes/validar-dni/${dni}`);
  }

}
