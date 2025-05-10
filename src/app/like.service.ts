import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class LikeService {
  constructor(private http: HttpClient) {}
  url = 'https://back-end-tfg-post-gre.vercel.app/';

  giveLike(id: string, dni: string = '') {
    let json = { dni, id }; // No es necesario convertirlo a string
    return this.http.post(this.url + 'giveLike', json, {
      withCredentials: true,
    });
  }
  deleteLike(id: string, dni: string = '') {
    let params = { dni, id };
    return this.http.delete(this.url + 'deleteLike', {
      params,
      withCredentials: true,
    });
  }
  getAll(id: string) {
    return this.http.get(this.url + `getAllFromPubli?id=${id}`, {
      withCredentials: true,
    });
  }
}

// routes.post('/giveLike', cLike.create);
// routes.delete('/deleteLike', cLike.delete);
// routes.get('/getAllFromPubli', cLike.getAllFromPubli);
