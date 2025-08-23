import { Component, Input, OnInit } from '@angular/core';
import { environment } from '@env/environment';
import { CONSTANTS } from '@shared/constants/constants';
import { IECONode } from '@shared/interfaces/econode.type';

@Component({
  selector: 'app-user-tree-detail',
  templateUrl: './user-tree-detail.component.html',
  styleUrls: ['./user-tree-detail.component.scss']
})
export class UserTreeDetailComponent implements OnInit {

  @Input() userModel: any;
  @Input() listPoints: any;
  @Input() paymentOrder: any;
  @Input() pointTotal: number = 0;

  avatarUrl: string;
  usuarioDirectos: number = 0;
  usuarioActivos: number = 0;
  usuarioTotal: number = 0;

  emailUser: string = "";

  packTitle: string = "";
  isActive: boolean = false;

  constructor() {

  }

  ngOnInit(): void {

    let image = CONSTANTS.IMAGE.FALLBACK;

    if( this.userModel.file != null ) image = environment.hostUrl + '/storage/'  + this.userModel.file.path;

    this.avatarUrl = image;
    this.emailUser = this.userModel?.email ?? "";
    this.packTitle  = this.paymentOrder?.payment_order?.pack?.title ?? "SIN PLAN";
    this.nodeTreeParse( this.userModel.uuid );
    this.usuarioDirectos = this.listPoints.filter( p => p.sponsor_code.toLowerCase() == this.userModel.uuid.toLowerCase() && p.payment == 1 ).length;

  }


  private nodeTreeParse(  code: string): Array<IECONode>{
    let tree = [];
    let pointsSponsor = this.listPoints.filter( p => p.sponsor_code.toLowerCase() == code.toLowerCase() && p.payment == 1 && p.type != "G");
    this.usuarioTotal += pointsSponsor.length;


    pointsSponsor.forEach( (point) => {
      let activeUser = point?.payment_order?.payment_log.length == 0 ? false : point?.payment_order?.payment_log[0]?.state == 2? true : false;
      if( activeUser ) this.usuarioActivos++;
      let data: IECONode = {
        data: { id: point.user_code , photo: point.user?.file?.path ?? "", email: point.user?.email ?? ""},
        selected: true,
        active: activeUser,
        children : this.nodeTreeParse( point.user_code )
      }
      tree.push( data );
    })

    return tree;
  }

}
