import { HttpClient } from '@angular/common/http';
import { EnvironmentInjector, Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class PublicacionesService {
  constructor(private http: HttpClient) {}
  url = 'https://back-end-tfg-post-gre.vercel.app/';

  upload(fd: FormData) {
    return this.http.post(this.url + 'upload', fd, { withCredentials: true });
  }
  getAllUser(offset: number, username: string = '') {
    return this.http.get(
      this.url + `getPublicacionesUser?username=${username}&offset=${offset}`,
      {
        withCredentials: true,
      }
    );
  }
  getAllPublic(offset: number) {
    return this.http.get(this.url + `getPublicacionesPublic?offset=${offset}`, {
      withCredentials: true,
    });
  }
  deletePubli(id: string, public_id: string, dni: string = '') {
    let params = { dni, id, public_id };
    return this.http.delete(this.url + 'deletePubli', {
      params,
      withCredentials: true,
    });
  }
  download(url: string, format: string, quality: number) {
    return this.http.get(
      this.url +
        `download?url=${encodeURIComponent(
          url
        )}&format=${format}&quality=${quality}`,
      {
        withCredentials: true,
        responseType: 'blob',
      }
    );
  }
}
