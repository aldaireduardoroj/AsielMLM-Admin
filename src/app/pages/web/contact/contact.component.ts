import { Component, OnInit } from '@angular/core';
import { CONSTANTS } from '@shared/constants/constants';


@Component({
  selector: 'app-contact',
  templateUrl: './contact.component.html',
  styleUrls: ['./contact.component.scss']
})
export class ContactComponent implements OnInit {

  PHONENUMNER: string = '';
  EMAIL: string = '';
  ADDRESS: string = '';

  YOUTUBE: string = '';
  INSTAGRAM: string = '';
  LINKEDIN: string = '';

  constructor(

  ) { }

  ngOnInit(): void {
    this.onLoad();
  }

  public onLoad(): void{

  }

}
