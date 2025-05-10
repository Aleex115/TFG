import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class ComentarioService {
  constructor(private http: HttpClient) {}
  url = 'https://3068-85-56-123-170.ngrok-free.app/';

  writeComment(id: string, com: string, dni: string = '') {
    let json = { dni, id, com };
    return this.http.post(this.url + 'comment', json, {
      withCredentials: true,
    });
  }
  deleteComment(id: string, dni: string = '') {
    let params = { dni, id };
    return this.http.delete(this.url + 'deleteComment', {
      params,
      withCredentials: true,
    });
  }
  getAllComment(id: string) {
    return this.http.get(this.url + `getAllComment?id=${id}`, {
      withCredentials: true,
    });
  }
}
