import {Action, State, StateContext} from "@ngxs/store";
import {Injectable} from "@angular/core";
import {produce} from "immer";
import {NbToastrService} from "@nebular/theme";
import {Product} from "src/model/product";
import {MyProductsFetch, MyProductsReset, RemoveProducts} from "src/app/my-products/my-products.actions";
import {ProductsService} from "src/api/products.service";
import {ProductService} from "src/api/product.service";
import {environment} from "src/environments/environment.dev";
import {ICONS} from "src/app/constants";

export interface MyProductsStateModel {
  isFetching: boolean;
  products: Product[];
}

export const defaultsState: MyProductsStateModel = {
  isFetching: false,
  products: [],
}

@State<MyProductsStateModel>({
  name: 'myProductsPage',
  defaults: defaultsState,
})

@Injectable()
export class MyProductsState {
  constructor(
    private toastrService: NbToastrService,
    private productsService: ProductsService,
    private productService: ProductService,
  ) {
  }

  @Action(MyProductsFetch)
  async myProductsFetch(
    {getState, setState}: StateContext<MyProductsStateModel>) {
    let newState = produce(getState(), draft => {
      draft.isFetching = true;
    })
    setState(newState);

    try {
      let products = await this.productsService.getUsersProducts();
      newState = produce(getState(), draft => {
        draft.products = products;
        draft.isFetching = false;
      });
      return setState(newState);
    } catch (e) {
      this.toastrService.danger(
        environment.production ? 'Please contact the administration' : e,
        'Something went wrong',
        {icon: ICONS.ALERT_CIRCLE_OUTLINE}
      );
      newState = produce(getState(), draft => {
        draft.isFetching = false;
      });
      return setState(newState);

    }
  }

  @Action(RemoveProducts)
  async removeProducts(
    {getState, setState}: StateContext<MyProductsStateModel>,
    action: RemoveProducts) {
    let newState = produce(getState(), draft => {
      draft.isFetching = true;
    })
    setState(newState);

    try {
      for (const product of action.products) {
        await this.productService.removeProductById(product.id);
      }
      newState = produce(getState(), draft => {
        draft.products = draft.products.filter(product => !action.products.includes(product));
        draft.isFetching = false;
      });
      setState(newState);
      window.location.reload();
    } catch (error) {
      newState = produce(getState(), draft => {
        draft.isFetching = false;
      })
      setState(newState);
      this.toastrService.danger(
        environment.production ? 'Please contact the administration' : error,
        'Something went wrong',
        {icon: ICONS.ALERT_CIRCLE_OUTLINE}
      );
    }
  }

  @Action(MyProductsReset)
  async myProductsReset(
    {setState}: StateContext<MyProductsStateModel>) {
    setState(defaultsState);
  }


}
