import {Component, OnDestroy, OnInit, TemplateRef, ViewChild} from '@angular/core';
import {Select, Store} from "@ngxs/store";
import {ICONS} from "src/app/constants";
import {ActivatedRoute, Router} from "@angular/router";
import {Observable} from "rxjs";
import {ProductSelector} from "src/app/products/product/product/product.selector";
import {
  ProductAddReview,
  ProductAverageRatingReviewFetch,
  ProductFetch,
  ProductReset,
  ProductReviewsFetch
} from "src/app/products/product/product/product.actions";
import {ProductOverview} from "src/model/product-overview";
import {ProductStatus} from "src/model/productStatus";
import {HumanizeDuration, HumanizeDurationLanguage} from 'humanize-duration-ts';
import {NbDialogRef, NbDialogService} from "@nebular/theme";
import {Review} from "src/model/review";
import {UserService} from "src/api/user.service";
import {ReviewSummary} from "src/model/reviewSummary";
import {TYPE_REPORT} from "src/app/products/product/product/constants/constants";

@Component({
  selector: 'app-product-overview',
  templateUrl: './product.component.html',
  styleUrls: ['./product.component.scss']
})
export class ProductComponent implements OnInit, OnDestroy {
  @Select(ProductSelector.isFetchingProduct)
  isFetchingProduct$: Observable<boolean>;
  @Select(ProductSelector.isFetchingReviewsOverview)
  isFetchingReviewsOverview$: Observable<boolean>;
  @Select(ProductSelector.product)
  product$: Observable<ProductOverview>;
  @Select(ProductSelector.reviews)
  reviews$: Observable<Review[]>;
  @Select(ProductSelector.reviewSummary)
  reviewSummary$: Observable<ReviewSummary>;
  @Select(ProductSelector.endOfListReviews)
  endOfListReviews$: Observable<boolean>;

  // dialog adding review
  @ViewChild('addRatingDialog') addRatingDialog: TemplateRef<any>;
  private dialogRef: NbDialogRef<any>;
  reviewToAdd: Review = {
    rating: 0,
    message: '',
  } as Review;

  productId: number;
  // constants
  protected readonly ICONS = ICONS;
  protected readonly TYPE_REPORT = TYPE_REPORT;

  alive: boolean = true;

  constructor(
    private store: Store,
    private activatedRoute: ActivatedRoute,
    private nbDialogService: NbDialogService,
    private router: Router,
    public userService: UserService,
  ) {
  }

  ngOnInit(): void {
    let actionsInParallel = [];
    this.productId = this.activatedRoute.snapshot.params['productId'];
    actionsInParallel.push(
      new ProductFetch(this.productId),
      new ProductReviewsFetch(this.productId),
      new ProductAverageRatingReviewFetch(this.productId));
    this.store.dispatch([...actionsInParallel]);
  }

  getProductInfoStatusBadge(productStatus: ProductStatus) {
    switch (productStatus) {
      case ProductStatus.AVAILABLE:
        return 'Available';
      case ProductStatus.UNAVAILABLE:
        return 'Unavailable';
      case ProductStatus.PAUSED:
        return 'Paused';
      case ProductStatus.RENTED:
        return 'Rented';
    }
  }

  getProductStatusColorBadge(productStatus: ProductStatus) {
    switch (productStatus) {
      case ProductStatus.AVAILABLE:
        return 'success';
      case ProductStatus.RENTED:
      case ProductStatus.UNAVAILABLE:
        return 'danger';
      case ProductStatus.PAUSED:
        return 'warning';
    }
  }

  clickOnStarEvent() {
    // goes to add review button page
    let addReviewButtonElement = document.getElementById('addReviewButton');
    addReviewButtonElement.scrollIntoView({behavior: "smooth", block: "start", inline: "nearest"});
  }

  onAddingReviewClickOnStar(starsNumber: number) {
    this.reviewToAdd.rating = starsNumber;
  }

  openReportDialog(typeReport: TYPE_REPORT) {
    alert(typeReport);
  }

  getReportBadgeTooltip(typeReport: TYPE_REPORT) {
    return `Report this ${typeReport}? Click here!`;
  }

  openAddReviewDialog() {
    this.dialogRef = this.nbDialogService.open(this.addRatingDialog, {});
  }

  onSubmitAddingReview() {
    this.store.dispatch(new ProductAddReview(this.productId, this.reviewToAdd));
    this.dialogRef.close();
  }

  isOnSubmitButtonDisabled(): boolean {
    return this.reviewToAdd.rating === 0 || this.reviewToAdd.message === '';
  }

  humanizeDurationMinLeasePeriod(minLeasePeriod: number) {
    const humanizer = new HumanizeDuration(new HumanizeDurationLanguage());
    return humanizer.humanize(minLeasePeriod * 24 * 60 * 60 * 1000);
  }

  loadNextReviews() {
    this.store.dispatch(new ProductReviewsFetch(this.productId));
  }

  ngOnDestroy(): void {
    this.alive = false;
    this.store.dispatch(new ProductReset());
  }
}
