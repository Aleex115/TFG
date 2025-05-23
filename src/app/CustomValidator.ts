import { AbstractControl, ValidationErrors } from '@angular/forms';

export class CustomValidator {
  static email(control: AbstractControl): ValidationErrors | null {
    let regex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    if (regex.test(control.value)) return null;
    else return { email: true };
  }
  static dni(control: AbstractControl): ValidationErrors | null {
    let regex = /^[0-9]{8}[TRWAGMYFPDXBNJZSQVHLCKE]$/;
    if (regex.test(control.value)) return null;
    else return { dni: true };
  }
  static username(control: AbstractControl): ValidationErrors | null {
    let regex = /^[a-zA-Z0-9_]+$/;
    if (regex.test(control.value)) return null;
    else return { username: true };
  }
  static pwd(control: AbstractControl): ValidationErrors | null {
    let regex = /^[^\\'"&=;{}\/[\]:,\n\r\t]+$/;
    if (regex.test(control.value)) return null;
    else return { pwd: true };
  }
}
