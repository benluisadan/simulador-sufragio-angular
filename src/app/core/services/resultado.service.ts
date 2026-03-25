import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { EstadisticaPresidencial } from '../models/resultado-electoral.models';
import { API_URL } from '../../app.config';

@Injectable({ providedIn: 'root' })
export class ResultadoService {

    private http = inject(HttpClient);
    private apiUrl = inject(API_URL);


    private baseUrl = `${this.apiUrl}/api/ResumenVoto/estadisticas`;


    getEstadisticasPresidencial(): Observable<EstadisticaPresidencial[]> {
        return this.http.get<EstadisticaPresidencial[]>(`${this.baseUrl}/presidencial`);
    }

    getEstadisticasSenadoUnico(): Observable<EstadisticaPresidencial[]> {
        return this.http.get<EstadisticaPresidencial[]>(`${this.baseUrl}/SenadoUnico`);
    }

    getEstadisticasSenadoMultiple(): Observable<EstadisticaPresidencial[]> {
        return this.http.get<EstadisticaPresidencial[]>(`${this.baseUrl}/SenadoMultiple`);
    }

    getEstadisticasDiputado(): Observable<EstadisticaPresidencial[]> {
        return this.http.get<EstadisticaPresidencial[]>(`${this.baseUrl}/Diputado`);
    }
    getEstadisticasParlamentoAndino(): Observable<EstadisticaPresidencial[]> {
        return this.http.get<EstadisticaPresidencial[]>(`${this.baseUrl}/ParlamentoAndino`);
    }

}