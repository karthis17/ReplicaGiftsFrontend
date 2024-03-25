import { Component } from '@angular/core';
import { CategoryService } from '../service/category.service';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { ProductService } from '../service/product.service';
import { WishService } from '../service/wish.service';
import { StarRatingComponent } from '../star-rating/star-rating.component';
import { HeaderComponent } from '../partials/header/header.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { UserAuthService } from '../service/user-auth.service';

declare global {
  interface Window {
    imgGallery: () => void;
    productContainer: () => void;
    // Declare other functions here...
  }
}


@Component({
  selector: 'app-product-list',
  standalone: true,
  imports: [CommonModule, RouterLink, StarRatingComponent, HeaderComponent, FormsModule],
  templateUrl: './product-list.component.html',

  styleUrl: './product-list.component.css'
})
export class ProductListComponent {

  constructor(private category: CategoryService, private user: UserAuthService, private product: ProductService, private router: Router, private wish: WishService) { }

  categories: any[] = [];

  trending: any[] = [];
  newProduct: any[] = [];


  ngOnInit() {
    window.scrollTo({ top: 0, behavior: "instant" })

    this.category.getCategory().subscribe((category: any) => this.categories = category);
    this.product.getTrending().subscribe((trending: any) => this.trending = trending);
    this.product.getNew().subscribe((trending: any) => this.newProduct = trending);
  }

  ngAfterViewInit() {
    window.productContainer()

  }

  nav(id: any) {
    this.router.navigateByUrl(`/product/${id}`)
  }

  navToShop() {
    this.router.navigateByUrl(`/shop`)

  }

  addWish(id: any) {

    this.wish.addWish(id).subscribe((wish: any) => { console.log(wish); this.wish.checkWish() });

  }

  navToCategory(id: any) {
    this.router.navigateByUrl(`/shop?category=${id}`)

  }

  contact = {
    name: '',
    email: '',
    subject: '',
    message: ''
  }

  err!: string;

  check() {
    this.err = ''
  }

  contactAdmin() {

    if (this.contact.name === '' || this.contact.email === '' || this.contact.subject === '' || this.contact.message === '') {
      this.err = "please fill all the fields"
      return;
    }

    this.user.contact(this.contact).subscribe(contact => {
      console.log(contact)
      this.contact = {
        name: '',
        email: '',
        subject: '',
        message: ''
      }
    })

  }

}
