import { CommonModule, isPlatformBrowser } from '@angular/common';
import { Component, HostListener, Inject, Input, OnDestroy, OnInit, PLATFORM_ID } from '@angular/core';
import SwiperCore from 'swiper';
import Navigation from 'swiper/modules';
import Pagination from 'swiper/modules';
import Autoplay from 'swiper/modules';

@Component({
  selector: 'app-home-carousel',
  standalone: true,
  imports: [CommonModule],
  template: `
 <div class="carousel">
  <div class="carousel-container">
    <img
      *ngFor="let image of images; let i = index"
      [src]="image"
      [class.active]="i === currentIndex"
      alt="Carousel Slide"
    />
  </div>
  <button class="prev" (click)="prevSlide()">&#9664;</button>
  <button class="next" (click)="nextSlide()">&#9654;</button>
</div>

  `,
  styleUrl: './home-carousel.component.scss'
})
export class HomeCarouselComponent implements OnInit{
  images: string[] = [];
  currentIndex = 0;
  constructor(@Inject(PLATFORM_ID) private platformId: any) {}
  ngOnInit() {
    if (isPlatformBrowser(this.platformId)) {
    this.fetchImages().then(() => {
      this.startAutoSlide();
    });}
  }

  async fetchImages() {
    this.images = await new Promise(resolve => {
      setTimeout(() => {
        resolve([
          'https://mdbcdn.b-cdn.net/img/new/slides/042.webp',
          'https://mdbcdn.b-cdn.net/img/new/slides/041.webp',
          'https://mdbcdn.b-cdn.net/img/new/slides/043.webp',
        ]);
      }, 1000); // Simulates network delay
    });
  }

  prevSlide() {
    this.currentIndex = (this.currentIndex - 1 + this.images.length) % this.images.length;
  }

  nextSlide() {
    this.currentIndex = (this.currentIndex + 1) % this.images.length;
  }

  startAutoSlide() {
    setInterval(() => {
      this.nextSlide();
    }, 5000);
  }
}
