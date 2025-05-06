import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class PetitionService {
  constructor(private http: HttpClient) {}
  url = 'http://localhost:3000/';

  request(dni: string = '') {
    let json = { dni }; // No es necesario convertirlo a string
    return this.http.post(this.url + 'petition', json, {
      withCredentials: true,
    });
  }
  cancelRequest(dni: string = '') {
    let params = { dni };
    return this.http.delete(this.url + `petition?dni=${dni}`, {
      withCredentials: true,
    });
  }
}
