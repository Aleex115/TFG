import { HttpClient } from '@angular/common/http';
import { EnvironmentInjector, Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class PublicacionesService {
  constructor(private http: HttpClient) {}
  url = 'https://imagehub-y2nt.onrender.com/';

  upload(fd: FormData) {
    return this.http.post(this.url + 'upload', fd, { withCredentials: true });
  }
  getAllUser(offset: number, filter: string, username: string = '') {
    return this.http.get(
      this.url +
        `getPublicacionesUser?username=${username}&offset=${offset}&filter=${filter}`,
      {
        withCredentials: true,
      }
    );
  }
  getAllPublic(offset: number, filter: string) {
    return this.http.get(
      this.url + `getPublicacionesPublic?offset=${offset}&filter=${filter}`,
      {
        withCredentials: true,
      }
    );
  }
  deletePubli(id: string, url: string, dni: string = '') {
    let params = { dni, id, url };
    return this.http.delete(this.url + 'deletePubli', {
      params,
      withCredentials: true,
    });
  }
  download(
    url: string,
    format: string,
    quality: number,
    dniPublication: string,
    id_publi: string
  ) {
    return this.http.get(
      this.url +
        `download?url=${encodeURIComponent(
          url
        )}&format=${format}&quality=${quality}&dniPublication=${dniPublication}&id_publi=${id_publi}`,
      {
        withCredentials: true,
        responseType: 'blob',
      }
    );
  }
}
