import { Component } from '@angular/core';
import {
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { CustomValidator } from '../CustomValidator';
import { UsuarioService } from '../usuario.service';
import { Router, RouterLink } from '@angular/router';
import { AlertService } from '../alert.service';

@Component({
  selector: 'app-sign-in',
  imports: [ReactiveFormsModule, RouterLink],
  templateUrl: './sign-in.component.html',
  styleUrl: './sign-in.component.css',
})
export class SignInComponent {
  constructor(
    private uS: UsuarioService,
    private alert: AlertService,
    private router: Router
  ) {}

  form = new FormGroup({
    dni: new FormControl('', [Validators.required, CustomValidator.dni]),
    email: new FormControl('', [Validators.required, CustomValidator.email]),
    username: new FormControl('', [
      Validators.required,
      CustomValidator.username,
    ]),
    pwd: new FormControl('', [Validators.required, Validators.minLength(4)]),
    ConfirmPwd: new FormControl('', [
      Validators.required,
      Validators.minLength(4),
    ]),
  });
  enviar() {
    this.uS
      .signin(
        this.form.value.dni!.trim(),
        this.form.value.email!.trim(),
        this.form.value.username!.trim(),
        this.form.value.pwd!.trim()
      )
      .subscribe({
        next: (res) => {
          this.router.navigate(['/login']);
          this.alert.showAlert(
            'success',
            'Successful signin',
            'Welcome to the system'
          );
          this.form.setValue({
            dni: '',
            email: '',
            username: '',
            pwd: '',
            ConfirmPwd: '',
          });
        },
        error: (err) => {
          console.log(err);
          this.alert.showAlert(
            'error',
            err.error.title,
            err.error.message || 'An unexpected error occurred'
          );
        },
      });
  }
}
