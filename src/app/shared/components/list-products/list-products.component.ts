import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { ApiService } from '@shared/services/api.service';
import { PackModel } from '@shared/services/models/packs.interface';
import { IProductModel } from '@shared/services/models/product.interface';
import { UserModel } from '@shared/services/models/user.interface';
import { forkJoin } from 'rxjs';

@Component({
  selector: 'app-list-products',
  templateUrl: './list-products.component.html',
  styleUrls: ['./list-products.component.scss']
})
export class ListProductsComponent implements OnInit {

  @Input() userModel?: UserModel;
  @Input() planSelected!: PackModel;

  @Output() onCart: EventEmitter<Array<IProductModel>> = new EventEmitter();

  productsList: Array<IProductModel> = [];
  _cartList: Array<IProductModel> = [];

  plantInitId: string = "";
  plantInitProductId: string = "";

  _productsList: Array<IProductModel> = [];

  isInit: boolean = false;

  constructor(
    private apiService: ApiService,
  ) { }

  ngOnInit(): void {
    forkJoin(
      this.apiService.getProductSearch({}),
      this.apiService.getProductPointSearch({}),
      this.apiService.getOptionsSearch({key: 'plan_init_fast'}),
      this.apiService.getOptionsSearch({key: 'plan_init_fast_product'})
    ).subscribe(([products, pointsSearch, planInit, plantInitProduct]) => {
      if( products.success ){
        this.productsList = products.data.map( p => {

          if( this.userModel?.payment?.payment_order == null ){
            p.points = 0;
          }else{
            p.points = pointsSearch.data.find( x => x.pack_id == this.userModel?.payment?.payment_order.pack.id && x.product_id == p.id)?.point ?? 0;
          }
          return p;
        });

        this.plantInitId = planInit.data[0].option_value;
        this.plantInitProductId = plantInitProduct.data[0].option_value;
        if(  this.plantInitId == this.planSelected.id.toString() ){
          this._productsList = this.productsList.filter( p => p.id.toString() == this.plantInitProductId );
        }else{
          this._productsList = this.productsList;
        }
        this.isInit = true;
      }

    })
  }

  ngOnChanges() {
    if( this.isInit ){
      console.log("planSelected", this.planSelected);
      if(  this.plantInitId == this.planSelected.id.toString() ){
        console.log("entra");
        this._productsList = this.productsList.filter( p => p.id.toString() == this.plantInitProductId );
      }else{
        this._productsList = this.productsList;
      }
    }

  }

  public onAddQuantity( index: number , suma: number ): void{

    if( (this.productsList[index].quantity??0) >= 0 ) this.productsList[index].quantity = (this.productsList[index].quantity??0) + suma;
    this.productsList[index].quantity = this.productsList[index].quantity == -1 ? 0 : this.productsList[index].quantity;
    this._cartList =  this.productsList.filter( p => (p?.quantity ?? 0) > 0 );

    this.onCart.emit(this._cartList);

  }

}
