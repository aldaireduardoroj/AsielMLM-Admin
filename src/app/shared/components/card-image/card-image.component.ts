import { Component, Input, OnInit } from '@angular/core';
import { ICardImageData } from '@shared/data/card-image';

@Component({
  selector: 'app-card-image',
  templateUrl: './card-image.component.html',
  styleUrls: ['./card-image.component.scss']
})
export class CardImageComponent implements OnInit {

  @Input() data: ICardImageData; 
  
  constructor() { }
  // 
  ngOnInit(): void {
  }

}
