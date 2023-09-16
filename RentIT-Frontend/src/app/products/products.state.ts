import {Product} from "src/model/product";
import {Action, State, StateContext} from "@ngxs/store";
import {Injectable} from "@angular/core";
import {NbToastrService} from "@nebular/theme";
import {ProductsFetch, ProductsReset} from "src/app/products/products.actions";
import {produce} from "immer";
import {environment} from "src/environment/environment.dev-local";
import {ICONS} from "src/app/constants";
import {mockedProducts} from "src/mocks/products.mock";

export interface ProductsStateModel {
  isFetching: boolean;
  products: Product[];
}

export const defaultsState: ProductsStateModel = {
  isFetching: false,
  products: [],
}

@State<ProductsStateModel>({
  name: 'productsPage',
  defaults: defaultsState,
})

@Injectable()
export class ProductsState {
  constructor(
    private toastrService: NbToastrService,
  ) {
  }

  @Action(ProductsFetch)
  async moviesFetchNextPage(
    {getState, setState}: StateContext<ProductsStateModel>) {

    let newState = produce(getState(), draft => {
      draft.isFetching = true;
    })
    setState(newState);

    // TODO here the service api will be called and fetch the actual products, for now mock

    let products = [];
    if(environment.mocked) {
      const delay = ms => new Promise(res => setTimeout(res, ms));
      await delay(2000);
      products = mockedProducts;
    }

    try {
      // mock
      // products = await productsService.getProducts();
    } catch (error) {
      this.toastrService.danger(
        environment.production ? 'Please contact the administration' : error,
        'Something went wrong',
        {icon: ICONS.ALERT_CIRCLE_OUTLINE}
      );
      console.error('error');
    }

    newState = produce(getState(), draft => {
      draft.products = products;
      draft.isFetching = false;
    })
    setState(newState);
  }

  @Action(ProductsReset)
  async productsReset(
    { setState }: StateContext<ProductsStateModel>) {
   setState(defaultsState);
  };
}
