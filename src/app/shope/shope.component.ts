import { Component, SimpleChanges } from '@angular/core';
import { StarRatingComponent } from '../star-rating/star-rating.component';
import { CommonModule } from '@angular/common';
import { CategoryService } from '../service/category.service';
import { ProductService } from '../service/product.service';
import { WishService } from '../service/wish.service';
import { ActivatedRoute, Router } from '@angular/router';
import { BehaviorSubject, debounceTime } from 'rxjs';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-shope',
  standalone: true,
  imports: [StarRatingComponent, CommonModule, FormsModule],
  templateUrl: './shope.component.html',
  styleUrl: './shope.component.css'
})
export class ShopeComponent {

  constructor(private categoryService: CategoryService, private product: ProductService, private router: Router, private route: ActivatedRoute, private wish: WishService) { }
  selectedFilters: any = {
    search: '',
    page: 1,
    sort: "noOfPerchases",
    order: -1
  };
  categories: any[] = [];
  ranges: number[] = [];
  discounts: number[] = [];
  products: any[] = [];

  selectedSort: number = 0;

  sort = [{ name: "Papularity", order: -1, q: "noOfPerchases" }, { name: "What's new", order: -1, q: "createdAt" }, { name: "Price: low to high", order: 1, q: "amount" }, { name: "Price: high to low", order: -1, q: "amount" }, { name: "A to Z", order: 1, q: "title" }, { name: "Z to A", order: -1, q: "title" }, { name: "Customer Rating", order: -1, q: "totalrating" }]

  private filterSubject = new BehaviorSubject<any>(this.selectedFilters);

  check = false;
  pageNo: any[] = [];
  ngOnInit(): void {

    // Subscribe to filter changes and debounce the input
    this.filterSubject.pipe(
      debounceTime(300) // Debounce input to avoid rapid API requests
    ).subscribe((filters: any) => {
      this.getFilteredProduct(filters);
    });

    this.route.queryParams.subscribe(params => {
      let id = params['category'];

      if (id) {

        if (!Array.isArray(this.selectedFilters.category)) {
          this.selectedFilters.category = [];
        }
        this.check = id;
        this.selectedFilters.category.push(id);
      }

    });

    this.loadInitialData();

    this.product.priceRange().subscribe((price: any) => {
      if (price.success) {
        this.ranges = price.ranges;
        // Update discounts array based on fetched data
        this.updateDiscounts(price.minDiscount, price.maxDiscount);
      }
    });

    this.categoryService.getCategory().subscribe((category: any) => this.categories = category);
  }

  private updateDiscounts(minDiscount: number, maxDiscount: number) {
    for (let i = 0; i < 6; i++) {
      if (i === 0) {
        this.discounts[0] = minDiscount;
      } else {
        if (minDiscount === maxDiscount) {
          break;
        }

        let d = this.discounts[i - 1] + 10;
        if (d < maxDiscount) {
          this.discounts.push(d);
        } else {
          this.discounts.push(maxDiscount);
          break;
        }
      }
    }
  }


  filterCategory(e: any, category: any) {
    if (e.target.checked) {
      // Initialize selectedFilters.category as an array if it's not already
      if (!Array.isArray(this.selectedFilters.category)) {
        this.selectedFilters.category = [];
      }
      // Push the category to the array
      this.selectedFilters.category.push(category);
    } else {
      // If selectedFilters.category is not an array, set it to an empty array
      if (!Array.isArray(this.selectedFilters.category)) {
        this.selectedFilters.category = [];
      }
      // Remove the category from the array if it exists
      const index = this.selectedFilters.category.indexOf(category);
      if (index !== -1) {
        this.selectedFilters.category.splice(index, 1);
      }
    }

    this.filterSubject.next(this.selectedFilters); // Trigger filter update
  }

  applyPriceRange(e: any, minPrice: number, maxPrice: number) {
    if (e.target.checked) {
      this.selectedFilters.min = minPrice;
      this.selectedFilters.max = maxPrice;
    } else {
      this.selectedFilters.min = '';
      this.selectedFilters.max = '';
    }
    this.filterSubject.next(this.selectedFilters); // Trigger filter update
  }

  applyDiscount(e: any, discount: number) {
    if (e.target.checked) {
      this.selectedFilters.discount = discount;
    } else {
      this.selectedFilters.discount = '';
    }
    this.filterSubject.next(this.selectedFilters); // Trigger filter update
  }

  applyRating(e: any, rating: number) {
    if (e.target.checked) {
      this.selectedFilters.rating = rating;

    } else {
      this.selectedFilters.rating = '';
    }
    this.filterSubject.next(this.selectedFilters); // Trigger filter update
  }
  applySearch() {
    this.filterSubject.next(this.selectedFilters); // Trigger filter update
  }
  applySort(sort: any) {
    console.log(sort);
    this.selectedFilters.sort = this.sort[sort].q;
    this.selectedFilters.order = this.sort[sort].order;

    this.filterSubject.next(this.selectedFilters); // Trigger filter update
  }



  loadInitialData() {
    // Load initial data when the component initializes
    this.getFilteredProduct(this.selectedFilters);
  }


  nav(id: any) {

    this.router.navigateByUrl(`/product/${id}`)
  }

  addWish(id: any) {

    this.wish.addWish(id).subscribe((wish: any) => { console.log(wish); this.wish.checkWish() });

  }


  getFilteredProduct(selected: any) {
    this.product.limitedProduct(selected).subscribe((products: any) => {
      this.products = products.product;
      console.log(this.products);
      this.pageNo = [];
      for (let i = 0; i < products.total; i++) {
        this.pageNo[i] = i + 1;
      }
    });
  }

}
