import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class PetitionService {
  constructor(private http: HttpClient) {}
  url = 'https://imagehub-y2nt.onrender.com/';

  request(dni: string = '') {
    let json = { dni };
    return this.http.post(this.url + 'petition', json, {
      withCredentials: true,
    });
  }
  cancelRequest(dni: string = '') {
    return this.http.delete(this.url + `petition?dni=${dni}`, {
      withCredentials: true,
    });
  }
  getAll() {
    return this.http.get(this.url + 'getAllPetition', {
      withCredentials: true,
    });
  }
  accept(dni: string = '') {
    let json = { dni };
    return this.http.post(this.url + 'acceptPetition', json, {
      withCredentials: true,
    });
  }
}
