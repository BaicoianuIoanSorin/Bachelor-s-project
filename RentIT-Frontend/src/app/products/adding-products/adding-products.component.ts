import {Component, OnDestroy, OnInit} from '@angular/core';
import {UserService} from "src/api/user.service";
import {NbTagComponent, NbTagInputAddEvent, NbToastrService} from "@nebular/theme";
import {ICONS, PRODUCTS_MENU_ITEM_URLS} from "src/app/constants";
import {Router} from "@angular/router";
import {
  ADDING_PRODUCTS_STEP,
  ADDING_PRODUCTS_TITLE,
  constructProductImagesFromImgurImages,
  defaultProduct,
  PERIOD
} from "src/app/products/adding-products/constants/constants";
import {NgxDropzoneChangeEvent} from "ngx-dropzone";
import {Select, Store} from "@ngxs/store";
import {AddProduct, ResetAddingProducts, UploadImage} from "src/app/products/adding-products/adding-products.actions";
import {Observable} from "rxjs";
import {AddingProductsSelectors} from "src/app/products/adding-products/adding-products.selectors";
import {ImgurImageResponse} from "src/model/imgurImageResponse";
import {Product} from "src/model/product";

@Component({
  selector: 'app-adding-products',
  templateUrl: './adding-products.component.html',
  styleUrls: ['./adding-products.component.scss']
})
export class AddingProductsComponent implements OnInit, OnDestroy {
  @Select(AddingProductsSelectors.isFetching)
  isFetching$: Observable<boolean>;
  @Select(AddingProductsSelectors.uploadedImages)
  uploadedImages$: Observable<ImgurImageResponse[]>

  protected readonly STEPS = ADDING_PRODUCTS_STEP;
  protected readonly TITLES = ADDING_PRODUCTS_TITLE;
  protected readonly ICONS = ICONS;
  protected readonly PERIOD = PERIOD;

  selectedImages: File[] = [];
  productDetails: Product = defaultProduct;
  minLeasePeriodSelectedPeriod: PERIOD = PERIOD.DEFAULT;

  constructor(private userService: UserService,
              private toastrService: NbToastrService,
              private router: Router,
              private store: Store) {
  }

  ngOnInit(): void {
    this.uploadedImages$.subscribe(images => {
      this.productDetails.images = constructProductImagesFromImgurImages(images);
    });

    if (!this.userService.isLoggedIn()) {
      this.toastrService.info(
        'You have been redirected to products page',
        'You need to be authenticated in order to add a product',
        {icon: ICONS.CHECKMARK_CIRCLE_OUTLINE}
      );
      this.router.navigate([PRODUCTS_MENU_ITEM_URLS.PRODUCTS]);
    }
  }

  onImageSelected(event: NgxDropzoneChangeEvent): void {
    this.selectedImages.push(...event.addedFiles);
  }

  async uploadImages(): Promise<void> {
    if (this.selectedImages.length === 0) {
      this.toastrService.warning(
        'Please select one or more images before saving.',
        'Error'
      );
      return;
    }

    for (const image of this.selectedImages) {
      this.store.dispatch(new UploadImage(image));
      this.toastrService.info(`Image '${image.name}' uploaded successfully!`, 'Success');
    }
    this.selectedImages = [];
  }

  onTagRemove(tagToRemove: NbTagComponent): void {
    this.productDetails.tags = this.productDetails.tags.filter(tag => tag !== tagToRemove.text);
  }

  onTagAdd({value, input}: NbTagInputAddEvent): void {
    if (value) {
      this.productDetails.tags.push(value)
    }
    input.nativeElement.value = '';
  }

  isSubmitButtonDisabled(): boolean {
    return this.productDetails.name === '' ||
      this.productDetails.description === '' ||
      this.productDetails.dayPrice === null ||
      this.productDetails.deposit === null ||
      this.productDetails.productValue === null ||
      this.productDetails.minLeasePeriod === null ||
      this.minLeasePeriodSelectedPeriod === PERIOD.DEFAULT ||
      // this.productDetails.images.length === 0 ||
      this.productDetails.tags.length === 0;
  }

  onSubmit(): void {
    console.log('Product details: ', this.productDetails);
    this.productDetails.minLeasePeriod = this.constructMinLeasePeriod();
    this.store.dispatch(new AddProduct(this.productDetails));
  }

  private constructMinLeasePeriod(): number {
    switch (this.minLeasePeriodSelectedPeriod) {
      case PERIOD.DAY:
        return this.productDetails.minLeasePeriod;
      case PERIOD.WEEK:
        return this.productDetails.minLeasePeriod * 7;
      case PERIOD.MONTH:
        return this.productDetails.minLeasePeriod * 30;
    }
  }

  ngOnDestroy(): void {
    this.store.dispatch(new ResetAddingProducts());
  }
}
