import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class ComentarioService {
  constructor(private http: HttpClient) {}
  url = 'https://imagehub-y2nt.onrender.com/';

  writeComment(
    id: string,
    com: string,
    dniPublication: string,

    dni: string = ''
  ) {
    let json = { dni, id, com, dniPublication };
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
