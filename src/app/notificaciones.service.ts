import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class NotificacionesService {
  constructor(private http: HttpClient) {}
  url = 'https://imagehub-y2nt.onrender.com/';

  getAll(type: string, read: boolean) {
    return this.http.get(
      this.url + `getAllNotifications?type=${type}&read=${read}`,
      {
        withCredentials: true,
      }
    );
  }
  setRead(id: string) {
    return this.http.put(
      this.url + 'setRead',
      { id },
      { withCredentials: true }
    );
  }
}
