import { Component } from '@angular/core';
import { NotificacionesService } from '../notificaciones.service';

@Component({
  selector: 'app-notifications',
  imports: [],
  templateUrl: './notifications.component.html',
  styleUrl: './notifications.component.css',
})
export class NotificationsComponent {
  constructor(private nS: NotificacionesService) {}
}
