import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-web-layout',
  templateUrl: './web-layout.component.html',
  styleUrls: ['./web-layout.component.scss']
})
export class WebLayoutComponent implements OnInit {

  constructor(
    private _router: Router
  ) { }

  ngOnInit(): void {
    this._router.navigate(['/auth/login']);
  }

}
