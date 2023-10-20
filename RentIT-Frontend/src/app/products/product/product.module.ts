import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {NgxsModule} from '@ngxs/store';
import {ProductService} from "src/api/product.service";
import {SharedModule} from "src/core/share.module";
import {ProductRoutingModule} from "src/app/products/product/product-routing.module";
import {ProductModulePage} from "src/app/products/product/product.module.page";
import {ProductComponent} from "src/app/products/product/product/product.component";

export const PRODUCTS_PROVIDERS = [
  ProductService,
]

export const PRODUCTS_STATES = [

];

export const PRODUCTS_COMPONENTS = [
  ProductModulePage,
  ProductComponent,
];

@NgModule({
  declarations: [
    PRODUCTS_COMPONENTS,
  ],
  imports: [
    CommonModule,
    ProductRoutingModule,
    SharedModule,
    NgxsModule.forFeature(PRODUCTS_STATES),
  ],
  providers: [PRODUCTS_PROVIDERS],
})
export class ProductModule {
}
