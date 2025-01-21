import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, FormsModule, NgForm, ReactiveFormsModule } from '@angular/forms';
import { StorageService } from '../../../../../services/storage.service';
import { JwtService } from '../../../../../services/jwt.service';
import { BusinessReview } from '../../../../../models/business-review';
import { BusinessReviewService } from '../../../../../services/business-review/business-review.service';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-business-review',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule,FormsModule],
  templateUrl: './business-review.component.html',
  styleUrls: ['./business-review.component.css'],
})
export class BusinessReviewComponent implements OnInit {
  business_id!: number;
  user_id!: number;
  rating:BusinessReview[]=[];
  token:any;
  ratingValue: number = 0;
  hasRated: boolean = false;
  stars: number[] = [1, 2, 3, 4, 5];  // Array for 5 stars
  message: string = '';
  overviewCount: number = 0;  // Store the overview count value
  errorMessage: string | null = null;
  constructor(
    private route: ActivatedRoute,
    private businessReviewService: BusinessReviewService,
    private fb: FormBuilder,
    private router: Router,
    private storageService:StorageService,
    private tokenService:JwtService,
    private snackBar: MatSnackBar, // Inject Snackbar
    private toastr: ToastrService
  ) {}
  ngOnInit(): void {
    // Get businessId from route parameters
    this.route.paramMap.subscribe((params) => {
      this.business_id = Number(params.get('id'));
      this.token = this.storageService.getItem('token');

      if (this.token) {
        this.user_id = this.tokenService.getUserId(this.token);
        this.businessReviewService.hasUserRated(this.business_id, this.user_id).subscribe((res) => {
          this.hasRated = res;
        });
      }

      // Fetch all ratings and then sort
      this.businessReviewService.getAllRating(this.business_id).subscribe(
        (response) => {
          this.rating = response;
          this.sortReviews(); // Sort reviews after fetching
        },
        (error) => {
          console.error('ERROR IN FETCHING: ', error);
        }
      );
    });
  }

  sortReviews() {
    this.rating = this.rating.sort((a, b) => {
      if (a.user_id === this.user_id) return -1;
      if (b.user_id === this.user_id) return 1;
      return 0;
    });
  }

   // Rate the business by clicking stars
   rate(star: number) {
    this.ratingValue = star;
  }


  onSubmit(form: NgForm) {
    if (form.valid) {
        const reviewData: BusinessReview = {
            business_id: this.business_id,
            user_id: this.user_id,
            count: this.ratingValue,
            message: this.message,

        };

        this.businessReviewService.ratebusiness(reviewData).subscribe(
            (response) => {

              this.toastr.success('Thank you for your rating!');
                this.hasRated=true;
                this.businessReviewService.getAllRating(this.business_id).subscribe(
                  (response) => {
                this.rating = response;
                this.sortReviews(); 
                },
                  (error) => {
                console.error('Error fetching ratings after submission:', error);
                }
              );
            },
            (error) => {
                console.error('Error submitting review:', error);
                if (error.status === 400) {
                  this.toastr.clear(error.error || 'You have already rated this business.');
                } else {
                    alert('An error occurred. Please try again later.');
                }
            }
        );
    } else {
        console.log('Form is invalid');


    }
}

}







