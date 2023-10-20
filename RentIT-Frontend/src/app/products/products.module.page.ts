import {Component, OnDestroy, OnInit} from "@angular/core";

@Component({
  template: `<router-outlet></router-outlet>`,
})
export class ProductsModulePage implements OnInit, OnDestroy {
  organizationId: number;

  alive = true;

  constructor() {
  }

  ngOnInit() {

  }

  ngOnDestroy() {
    this.alive = false;
  }
}
