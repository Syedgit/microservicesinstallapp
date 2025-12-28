solution # 1


import { Component } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from 'src/app/services/auth.service';

@Component({
  selector: 'app-login',
  templateUrl: './login-page.component.html',
  styleUrls: ['./login-page.component.scss'],
})
export class LoginComponent {
  loginForm: FormGroup;

  isServerError = false;
  serverErrorMessage: string = '';

  constructor(private authService: AuthService, private router: Router) {
    this.loginForm = new FormGroup(
      {
        email: new FormControl('', [Validators.required, Validators.email]),
        password: new FormControl('', [Validators.required]),
      },
      this.formValidator.bind(this)
    );
  }

  onSubmit() {
    if (this.loginForm.invalid) return;

    this.authService.login(this.loginForm.value).subscribe(
      () => {
        const redirectUrl = this.authService.redirectUrl;
        if (redirectUrl) {
          this.router.navigate([redirectUrl]);
        } else {
          this.router.navigate(['/recipes']);
        }
      },
      (error) => {
        switch (error.error.type) {
          case 'badCredentialsException':
            this.serverErrorMessage = 'Invalid email or password';
            break;
          case 'accessDeniedException':
            this.serverErrorMessage = 'The user is blocked';
            break;
          default:
            this.serverErrorMessage = 'Login error. Please try again later';
        }

        this.isServerError = true;
        this.loginForm.updateValueAndValidity();
      }
    );
  }

  formValidator() {
    if (!this.isServerError) return null;

    this.isServerError = false;
    return { serverError: true };
  }
}

Solution #2 

Selected solution 
import { Component } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from 'src/app/services/auth.service';

@Component({
  selector: 'app-login',
  templateUrl: './login-page.component.html',
  styleUrls: ['./login-page.component.scss'],
})
export class LoginComponent {
  loginForm: FormGroup;

  isServerError = false;
  serverErrorMessage: string = '';

  constructor(private authService: AuthService, private router: Router) {
    this.loginForm = new FormGroup(
      {
        email: new FormControl('', [Validators.required, Validators.email]),
        password: new FormControl('', [Validators.required]),
      },
      this.formValidator.bind(this)
    );
  }

  onSubmit() {
    if (this.loginForm.invalid) return;

    this.authService.login(this.loginForm.value).subscribe(
      () => {
        const redirectUrl = this.authService.redirectUrl;
        const authUser = this.authService.userChange$.value;

        if (
          (redirectUrl && !redirectUrl.includes('admin')) ||
          (redirectUrl && redirectUrl.includes('admin') && authUser?.isAdmin)
        ) {
          this.router.navigate([redirectUrl]);
        } else {
          this.router.navigate(['/recipes']);
        }
      },
      (error) => {
        switch (error.error.type) {
          case 'badCredentialsException':
            this.serverErrorMessage = 'Invalid email or password';
            break;
          case 'accessDeniedException':
            this.serverErrorMessage = 'The user is blocked';
            break;
          default:
            this.serverErrorMessage = 'Login error. Please try again later';
        }

        this.isServerError = true;
        this.loginForm.updateValueAndValidity();
      }
    );
  }

  formValidator() {
    if (!this.isServerError) return null;

    this.isServerError = false;
    return { serverError: true };
  }
}

Solution # 3


import { Component } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from 'src/app/services/auth.service';

@Component({
  selector: 'app-login',
  templateUrl: './login-page.component.html',
  styleUrls: ['./login-page.component.scss'],
})
export class LoginComponent {
  loginForm: FormGroup;

  isServerError = false;
  serverErrorMessage: string = '';

  constructor(private authService: AuthService, private router: Router) {
    this.loginForm = new FormGroup(
      {
        email: new FormControl('', [Validators.required, Validators.email]),
        password: new FormControl('', [Validators.required]),
      },
      this.formValidator.bind(this)
    );
  }

  onSubmit() {
    if (this.loginForm.invalid) return;

    this.authService.login(this.loginForm.value).subscribe(
      () => {
        const redirectUrl = this.authService.redirectUrl;
        if (redirectUrl) {
          this.router.navigate([redirectUrl]);
        } else {
          this.router.navigate(['/recipes']);
        }
      },
      (error) => {
        switch (error.error.type) {
          case 'badCredentialsException':
            this.serverErrorMessage = 'Invalid email or password';
            break;
          case 'accessDeniedException':
            this.serverErrorMessage = 'The user is blocked';
            break;
          default:
            this.serverErrorMessage = 'Login error. Please try again later';
        }

        this.isServerError = true;
        this.loginForm.updateValueAndValidity();
      }
    );
  }

  formValidator() {
    if (!this.isServerError) return null;

    this.isServerError = false;
    return { serverError: true };
  }
}

Solution # 4


import { Component } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from 'src/app/services/auth.service';

@Component({
  selector: 'app-login',
  templateUrl: './login-page.component.html',
  styleUrls: ['./login-page.component.scss'],
})
export class LoginComponent {
  loginForm: FormGroup;

  isServerError = false;
  serverErrorMessage: string = '';

  constructor(private authService: AuthService, private router: Router) {
    this.loginForm = new FormGroup(
      {
        email: new FormControl('', [Validators.required, Validators.email]),
        password: new FormControl('', [Validators.required]),
      },
      this.formValidator.bind(this)
    );
  }

  onSubmit() {
    if (this.loginForm.invalid) return;

    this.authService.login(this.loginForm.value).subscribe(
      () => {
        const redirectUrl = this.authService.redirectUrl;
        if (redirectUrl) {
          this.router.navigate([redirectUrl]);
        } else {
          this.router.navigate(['/recipes']);
        }
      },
      (error) => {
        switch (error.error.type) {
          case 'badCredentialsException':
            this.serverErrorMessage = 'Invalid email or password';
            break;
          case 'accessDeniedException':
            this.serverErrorMessage = 'The user is blocked';
            break;
          default:
            this.serverErrorMessage = 'Login error. Please try again later';
        }

        this.isServerError = true;
        this.loginForm.updateValueAndValidity();
      }
    );
  }

  formValidator() {
    if (!this.isServerError) return null;

    this.isServerError = false;
    return { serverError: true };
  }
}
