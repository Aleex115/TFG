import { Component } from '@angular/core';
import {
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { CustomValidator } from '../CustomValidator';

@Component({
  selector: 'app-sign-in',
  imports: [ReactiveFormsModule],
  templateUrl: './sign-in.component.html',
  styleUrl: './sign-in.component.css',
})
export class SignInComponent {
  form = new FormGroup({
    dni: new FormControl('', [Validators.required, CustomValidator.dni]),
    email: new FormControl('', [Validators.required, CustomValidator.email]),
    username: new FormControl('', [Validators.required]),
    pwd: new FormControl('', [Validators.required, Validators.minLength(4)]),
    ConfirmPwd: new FormControl('', [
      Validators.required,
      Validators.minLength(4),
    ]),
  });
  enviar() {
    let fd = new FormData();
    fd.append('dni', this.form.value.dni!);
    fd.append('email', this.form.value.email!);
    fd.append('pwd', this.form.value.pwd!);
  }
}
