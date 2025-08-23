import { Component, OnInit } from '@angular/core';
import { TreeViewComponent } from '@shared/components/tree-view/tree-view.component';
import { ECONode, IECONode, Orientation } from '@shared/interfaces/econode.type';
import { ApiService } from '@shared/services/api.service';
import { AuthModel, UserModel } from '@shared/services/models/user.interface';
import { getCodeUuid, getCurrentUser } from '@shared/utilities/functions';
import { environment } from '@env/environment';
import { CONSTANTS } from '@shared/constants/constants';
import { NzModalService } from 'ng-zorro-antd/modal';
import { UserTreeDetailComponent } from '@shared/components/user-tree-detail/user-tree-detail.component';
import { forkJoin } from 'rxjs';
@Component({
  selector: 'app-tree-users-page',
  templateUrl: './tree-users-page.component.html',
  styleUrls: ['./tree-users-page.component.scss']
})
export class TreeUsersPageComponent implements OnInit {


  Orientation = Orientation;
  nodeSelected: ECONode = null;
  isChart: boolean = false;
  data: IECONode;
  environment = environment;
  fallback = CONSTANTS.IMAGE.FALLBACK;

  usuarioDirectos: number = 0;
  usuarioActivos: number = 0;
  usuarioTotal: number = 0;

  userSponsor: string = "--";
  codeSponsor: string = "--";

  listPoints: Array<any> = [];

  constructor(
    private apiService: ApiService,
    private nzModalService: NzModalService
  ) { }

  ngOnInit(): void {
    this.isChart = false;

    forkJoin(
      this.apiService.getPointListUser()
    ).subscribe(
      ([ points]) => {

        // ================= points
        let userCurrent: UserModel = points.data.user;

        let pointsData = points.data.points;
        let children = this.nodeTreeParse( pointsData, getCodeUuid() );

        if( children.length == 0 ){

          for (let index = 0; index < 4; index++) {
            children.push(
              {
                data: { id: "" +(1*index) , photo: 'assets/images/Ellipse 4.png' , name: "Usuario "+(1*index) },
                active: false,
                selected: true,
                children: [],
                admin: false
              }
            );
          }
        }

        let image = userCurrent.file ? environment.hostUrl + '/storage/' + userCurrent.file.path : this.fallback;

        this.data = {
          data: { id: getCodeUuid() , photo:  image, admin: userCurrent?.is_admin ?? false, name: userCurrent?.name },
          active: userCurrent.payment?.state == CONSTANTS.PAYMENT_ORDER.PAGADO,
          selected: true,
          children: children
        }

        this.codeSponsor = pointsData.find( p => p.user_code.toLowerCase() == getCodeUuid().toLowerCase() && p.sponsor_code != "" && p.payment == 1)?.sponsor_code ?? "--";
        this.userSponsor = pointsData.find( p => p.user_code.toLowerCase() == getCodeUuid().toLowerCase() && p.sponsor_code != "" && p.payment == 1)?.sponsor?.name ?? "--";

        this.usuarioDirectos = pointsData.filter( p => p.sponsor_code.toLowerCase() == getCodeUuid().toLowerCase() && p.payment == 1 ).length;

        // getCodeUuid()
        this.listPoints = pointsData;
        this.isChart = true;
      }
    )

  }

  private nodeTreeParse( listPoints: any[] , code: string): Array<IECONode>{
    let tree = [];

    let pointsSponsor = listPoints.filter( p => p.sponsor_code.toLowerCase() == code.toLowerCase() && p.payment == 1 );

    this.usuarioTotal += pointsSponsor.length;

    pointsSponsor.forEach( (point) => {

      let activeUser = point?.user?.payment?.state == CONSTANTS.PAYMENT_ORDER.PAGADO ? true : false;

      if( activeUser ) this.usuarioActivos++;

      let image = this.fallback;
      if( point.user?.file != null ){
        image = environment.hostUrl + '/storage/' + (point.user?.file?.path ?? "")
      }
      let data: IECONode = {
        data: { id: point.user_code , photo: image, email: point.user?.email ?? "", name: point.user?.name},
        selected: true,
        active: activeUser,
        children : this.nodeTreeParse( listPoints , point.user_code ),
        admin: point.user?.is_admin ?? false
      }
      tree.push( data );
    })

    return tree;
  }

  selectSlibingNodes(treeView: TreeViewComponent, node: ECONode) {
    if (node == this.nodeSelected) {
      this.nodeSelected = null;
      treeView.nodes.forEach(x => {
        x.isSelected = false;
      });
    } else {
      this.nodeSelected = node;
      const nodes = treeView.getSlibingNodes(node).map(x => x.id);
      treeView.nodes.forEach(x => {
        x.isSelected = x.id == node.id || nodes.indexOf(x.id) >= 0;
      });
    }
  }

  public onSeletedUSer(usercode: string): void{

    if( usercode == "-1" ) return;

    let userModel = this.listPoints.find( p => p.user_code == usercode );

    this.nzModalService.create({
      nzTitle: 'Detalle',
      nzContent: UserTreeDetailComponent,
      nzFooter: null,
      nzComponentParams: {
        userModel: userModel.user,
        listPoints: this.listPoints,
        paymentOrder: userModel.user?.payment,
        pointTotal: userModel.pointTotal
      }
    })
  }
}
