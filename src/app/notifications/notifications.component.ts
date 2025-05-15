import { Component } from '@angular/core';
import { NotificacionesService } from '../notificaciones.service';
import { AlertService } from '../alert.service';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { UsuarioService } from '../usuario.service';

@Component({
  selector: 'app-notifications',
  imports: [FormsModule],
  templateUrl: './notifications.component.html',
  styleUrl: './notifications.component.css',
})
export class NotificationsComponent {
  constructor(
    private nS: NotificacionesService,
    private alert: AlertService,
    private router: Router,
    private uS: UsuarioService
  ) {}
  type = '';
  username = '';
  onlyUnread = false;
  user: any;
  notifications: any;
  notificationsFilter: any;
  ngOnInit() {
    this.getNotificaciones();
    this.uS.getOne().subscribe({
      next: (res: any) => {
        this.user = res.user;
      },
      error: (err) => {
        if (err.status == 401) {
          this.alert.showMessageExpired();
          this.router.navigate(['/login']);
        } else {
          this.alert.showAlert(
            'error',
            err.error.title,
            err.error.message || 'An unexpected error occurred'
          );
        }
      },
    });
  }

  none(e: Event) {
    e.stopPropagation();
  }
  setRead(e: Event, not: any) {
    e.stopPropagation();
    let card = e.target as HTMLElement;
    card = card.closest('.notification') || card;
    this.nS.setRead(not.id).subscribe({
      next: (res: any) => {
        card.classList.add('read');
      },
      error: (err) => {
        if (err.status == 401) {
          this.alert.showMessageExpired();
          this.router.navigate(['/login']);
        } else {
          this.alert.showAlert(
            'error',
            err.error.title,
            err.error.message || 'An unexpected error occurred'
          );
        }
      },
    });
  }

  filterUsername() {
    this.notificationsFilter = this.notifications.filter((el: any) =>
      el.username.includes(this.username)
    );
  }
  setType(e: any) {
    this.type = e.target.value;
    this.getNotificaciones();
  }
  setNoRead(e: any) {
    this.onlyUnread = e.target.checked;
    this.getNotificaciones();
  }
  getNotificaciones() {
    console.log(this.onlyUnread);
    this.nS.getAll(this.type, this.onlyUnread).subscribe({
      next: (res: any) => {
        this.notifications = res.notifications;
        this.filterUsername();
      },
      error: (err) => {
        if (err.status == 401) {
          this.alert.showMessageExpired();
          this.router.navigate(['/login']);
        } else {
          this.alert.showAlert(
            'error',
            err.error.title,
            err.error.message || 'An unexpected error occurred'
          );
        }
      },
    });
  }
  link(u: any, e: Event) {
    e.stopPropagation();
    console.log(u);
    console.log(this.user);

    if (this.user.dni == u.dni_ejecutor) {
      this.router.navigate(['/user']);
      setTimeout(() => {
        window.location.reload();
      }, 100);
    } else {
      this.router.navigate(['/user', u.username]);
      setTimeout(() => {
        window.location.reload();
      }, 100);
    }
  }
}
