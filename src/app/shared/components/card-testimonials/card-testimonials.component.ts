import { Component, Input, OnInit } from '@angular/core';
import { ICardTestimonialData } from '@shared/data/card-testimonial';

@Component({
  selector: 'app-card-testimonials',
  templateUrl: './card-testimonials.component.html',
  styleUrls: ['./card-testimonials.component.scss']
})
export class CardTestimonialsComponent implements OnInit {

  @Input() data: ICardTestimonialData;
  constructor() { }

  ngOnInit(): void {
  }

  get styleImage(): any{
    return "background-image: url('" + this.data.image + "')";
  }
}
