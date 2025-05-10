import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class UsuarioService {
  constructor(private http: HttpClient) {}
  url = 'https://back-end-tfg-post-gre.vercel.app/';
  login(username: string, pwd: string) {
    let fd = new FormData();
    fd.append('username', username.trim());
    fd.append('pwd', pwd.trim());
    return this.http.post(this.url + 'login', fd, { withCredentials: true });
  }
  updateProfile(fd: FormData) {
    return this.http.put(this.url + 'profile', fd, { withCredentials: true });
  }
  signin(dni: string, email: string, username: string, pwd: string) {
    let fd = new FormData();
    fd.append('dni', dni.trim());
    fd.append('email', email.trim());
    fd.append('pwd', pwd.trim());
    fd.append('username', username.trim());
    return this.http.post(this.url + 'signin', fd, { withCredentials: true });
  }
  session() {
    return this.http.get(this.url + 'session', { withCredentials: true });
  }
  getOne(username: string = '') {
    return this.http.get(this.url + `user?username=${username.trim()}`, {
      withCredentials: true,
    });
  }
  getAll(username: string) {
    return this.http.get(this.url + `getAllUsers?username=${username.trim()}`, {
      withCredentials: true,
    });
  }
  updatePwd(newPwd: string, oldPwd: string) {
    return this.http.put(
      this.url + 'pwd',
      { newPwd, oldPwd },
      { withCredentials: true }
    );
  }
  logout() {
    return this.http.get(this.url + 'logout', { withCredentials: true });
  }
  delete() {
    return this.http.delete(this.url + 'deleteUser', { withCredentials: true });
  }
}
