import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { FormGroup } from '@angular/forms';
import { first } from 'rxjs/operators';

import { AuthenticationService } from '../_services';
import { NgxSpinnerService } from 'ngx-spinner';

@Component({
    selector: 'login',
    templateUrl: './login.component.html',
    styleUrls: ['./login.component.css']
  })
export class LoginComponent implements OnInit {
    loginForm: FormGroup;
    loading = false;
    submitted = false;
    returnUrl: string;
    error = '';

    constructor(
        private route: ActivatedRoute,
        private router: Router,
        private authenticationService: AuthenticationService,
        public spinnerService: NgxSpinnerService
    ) { 
        // redirect to home if already logged in
        if (this.authenticationService.currentUserValue) { 
            this.router.navigate(['/login']);
        }
    }

    ngOnInit() {
        // get return url from route parameters or default to '/'
        this.returnUrl = this.route.snapshot.queryParams['returnUrl'] || '/';
    }

    doLogin(loginformData: any){
        console.log(loginformData);
        this.spinnerService.show();
        this.authenticationService.login(loginformData.username, loginformData.password)
        .pipe(first())
        .subscribe(
            data => {
                this.router.navigate(['/home']);
            },
            error => {
                this.error = error;
                this.spinnerService.hide();
            });
    }
}
