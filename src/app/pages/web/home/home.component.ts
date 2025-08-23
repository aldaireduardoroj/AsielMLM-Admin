import { Component, OnInit } from '@angular/core';
import { environment } from '@env/environment';
import { ICardImageData, productList, teamMembers } from '@shared/data/card-image';
import { ICardTestimonialData, testimonial } from '@shared/data/card-testimonial';
import { ApiService } from '@shared/services/api.service';
import { PackModel } from '@shared/services/models/packs.interface';
import { ModalService } from '@shared/utilities/modal-services';
import AOS from 'aos';
import { NzModalService } from 'ng-zorro-antd/modal';
import { OwlOptions } from 'ngx-owl-carousel-o';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit {

  windowWidth: number = 0;

  customOptions: OwlOptions = {
    loop: true,
    mouseDrag: true,
    touchDrag: true,
    pullDrag: false,
    dots: false,
    navSpeed: 700,
    navText: ['', ''],
    responsive: {
      0: {
        items: 1
      },
      400: {
        items: 2
      },
      900: {
        items: 3
      }
    },
    nav: true
  }

  env = environment;

  teamMember: Array<ICardImageData> = teamMembers;
  productList: Array<ICardImageData> = productList;

  planList: Array<PackModel> = [];
  testimonialList: Array<ICardTestimonialData> = testimonial;
  showVideo: boolean = false;
  constructor(
    private nzModalService: NzModalService,
    private apiService: ApiService,
    private modalService: ModalService,
  ) { }

  ngOnInit(): void {
    this.windowWidth = window.innerWidth;

    AOS.init({disable: 'mobile'});//AOS - 2
    AOS.refresh();

    this.loadOptions();
    this.loadPlans();
  }


  ngOnChanges(): void {
    //Called before any other lifecycle hook. Use it to inject dependencies, but avoid any serious work here.
    //Add '${implements OnChanges}' to the class.
    this.windowWidth = window.innerWidth;
  }

  public loadOptions(): void{

  }

  public loadPlans(): void{
    this.apiService.getPlansSearch({}).subscribe(
      (response) =>{
        this.planList = response.data;
      },
      (error) =>{

      }
    )
  }

  public onShowVideo(): void{
    this.showVideo = !this.showVideo ;
  }
}
