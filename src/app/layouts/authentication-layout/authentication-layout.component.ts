import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-authentication-layout',
  templateUrl: './authentication-layout.component.html',
  styleUrls: ['./authentication-layout.component.scss']
})
export class AuthenticationLayoutComponent implements OnInit {

  isAuth: boolean = false;

  constructor(
    private router: Router,
  ) { }

  ngOnInit(): void {
  }


  goTo(section: string): void{
      let path = '/home';
      this.router.navigate([path] , { fragment: section } );
    }
}
