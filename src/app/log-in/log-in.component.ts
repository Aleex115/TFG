import { Component } from '@angular/core';
import {
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { CustomValidator } from '../CustomValidator';

@Component({
  selector: 'app-log-in',
  imports: [ReactiveFormsModule],
  templateUrl: './log-in.component.html',
  styleUrl: './log-in.component.css',
})
export class LogInComponent {
  form = new FormGroup({
    email: new FormControl('', [Validators.required, CustomValidator.email]),
    pwd: new FormControl('', [Validators.required, Validators.minLength(4)]),
  });
  enviar() {
    let fd = new FormData();
    fd.append('email', this.form.value.email!);
    fd.append('pwd', this.form.value.pwd!);
  }
}
