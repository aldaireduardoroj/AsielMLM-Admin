import { Component, OnInit } from '@angular/core';
import { environment } from '@env/environment';
import { CONSTANTS } from '@shared/constants/constants';

import { IdentityService } from '@shared/services/identity.service';


import { NzModalService } from 'ng-zorro-antd/modal';
import { Subscription, forkJoin } from 'rxjs';

@Component({
  selector: 'app-my-reservations',
  templateUrl: './my-reservations.component.html',
  styleUrls: ['./my-reservations.component.scss']
})
export class MyReservationsComponent implements OnInit {

  chkHairSize: boolean = true;
  sltHairSize: any;
  hairSizeList: Array<any> = [];
  rdFilter: number = 2;
  avatarUrl: string = CONSTANTS.IMAGE.FALLBACK;
  reservationList: Array<any> = [];

  private userServiceSubscription: Subscription | undefined;

  constructor(
    private modalService: NzModalService,

    private identityService: IdentityService,
  ) {

  }

  ngOnInit(): void {
    this.loadOptions();
  }

  isAuthLoad(): void{

  }

  public loadOptions(): void{

  }

  public onSearch(): void{

  }

  public onChangeTypeHair(ev: any){
    this.onSearch();
  }

}
