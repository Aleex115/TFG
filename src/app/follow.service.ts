import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class FollowService {
  constructor(private http: HttpClient) {}
  url = 'https://imagehub-y2nt.onrender.com/';

  follow(dni: string = '') {
    let json = { dni }; // No es necesario convertirlo a string
    return this.http.post(this.url + 'follow', json, {
      withCredentials: true,
    });
  }
  unfollow(dni: string = '') {
    let params = { dni };
    return this.http.delete(this.url + `unfollow?dni=${dni}`, {
      withCredentials: true,
    });
  }
  getAll() {
    return this.http.get(this.url + 'allFriends', {
      withCredentials: true,
    });
  }
}
