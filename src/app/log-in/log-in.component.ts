import { Component } from '@angular/core';
import {
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { UsuarioService } from '../usuario.service';
import { ActivatedRoute, ParamMap, Router, RouterLink } from '@angular/router';
import { AlertService } from '../alert.service';
import { CustomValidator } from '../CustomValidator';

@Component({
  selector: 'app-log-in',
  imports: [ReactiveFormsModule, RouterLink],
  templateUrl: './log-in.component.html',
  styleUrl: './log-in.component.css',
})
export class LogInComponent {
  url = '';
  constructor(
    private uS: UsuarioService,
    private aR: ActivatedRoute,
    private router: Router,
    private alert: AlertService
  ) {}
  ngOnInit() {
    this.aR.paramMap.subscribe((param: ParamMap) => {
      console.log(param);
      this.url = param.get('returnUrl') || '/';
    });
  }

  form = new FormGroup({
    username: new FormControl('', [
      Validators.required,
      CustomValidator.username,
    ]),
    pwd: new FormControl('', [Validators.required, Validators.minLength(3)]),
  });
  enviar() {
    this.uS
      .login(this.form.value.username?.trim()!, this.form.value.pwd?.trim()!)
      .subscribe({
        next: (res: any) => {
          this.alert.showAlert(
            'success',
            'Login Successful',
            'Welcome to the system'
          );

          this.router.navigateByUrl(this.url);
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
