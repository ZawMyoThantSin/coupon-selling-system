import { Component } from '@angular/core';
import { Business } from '../../../models/business';
import { UserResponse } from '../../../models/user-response.models';
import { ActivatedRoute, Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { StorageService } from '../../../services/storage.service';
import { BusinessService } from '../../../services/business/business.service';
import { JwtService } from '../../../services/jwt.service';
import { UserService } from '../../../services/user/user.service';
import { CommonModule } from '@angular/common';
import { MdbCollapseModule } from 'mdb-angular-ui-kit/collapse';
import { MdbDropdownModule } from 'mdb-angular-ui-kit/dropdown';
import { CreateShopComponent } from '../shop/create-shop/create-shop.component';
import { MdbModalRef, MdbModalService } from 'mdb-angular-ui-kit/modal';
import { ToastrService } from 'ngx-toastr';
import { MdbTooltipModule } from 'mdb-angular-ui-kit/tooltip';

@Component({
  selector: 'app-owner-dashboard',
  standalone: true,
  imports: [CommonModule,RouterLink,RouterLinkActive,RouterOutlet,MdbCollapseModule,MdbDropdownModule,MdbTooltipModule],
  templateUrl: './owner-dashboard.component.html',
  styleUrl: './owner-dashboard.component.css'
})
export class OwnerDashboardComponent {

  modalRef: MdbModalRef<CreateShopComponent> | null = null;//

  businessId!:number;
  shopExist: boolean =false;
  sidebarOpen: boolean = false;
  activeRoute: any = '';
  isLoggedIn: boolean = false;
  businessData!: Business;
  isBusinessCollapsed: boolean = true; // Tracks if the business section is collapsed
  token!: any;
  loading: boolean = false; // Flag to track if data is being fetched
  seeAll = false;
  userInfo!:UserResponse;
  userId:any;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private storageService: StorageService,
    private tokenService: JwtService,
    private toastr: ToastrService,
    private businessService: BusinessService,
    private userService: UserService,
    private modalService: MdbModalService
  ) {
    this.router.events.subscribe(() => {
      this.activeRoute = this.router.url; // Get the active URL
    });
  }

  ngOnInit(): void {
    this.token = this.storageService.getItem('token');
    this.userService.getUserInfo().subscribe((response)=>{
      this.userInfo = response;
      this.userId = this.userInfo.id;
      this.fetchBusinessInfo(this.userId);
    },error => console.log('Error in Fetching UserInfo', error));
    if (this.token == '' || this.token == null) {
      // console.log('Token is not defined or is invalid.');
      this.isLoggedIn = false;
    } else {
      this.isLoggedIn = true;
    }

  }

  private fetchBusinessInfo(userId: number){
    this.loading =true;
    this.businessService.getByUserId(userId).subscribe(
      (response) => {
        this.businessData = response;
        this.businessId = this.businessData.id;
        this.shopExist = this.businessData.id != null ? true : false;
        if(this.shopExist){
          this.businessService.updateBusinessId(this.businessId);
        }

        this.loading = false; // Stop loading spinner
      },
      (error) => {
        console.error('Error fetching businesses:', error);
        this.loading = false; // Stop loading spinner even if there is an error
      }
    );
  }

  setupShop(){
    this.loading  = true;
    setTimeout(() => {
      this.openModal();
    }, 1500);
  }

  openQrScanner(): void{
    this.router.navigate(['/o/qr-scanner']);
  }

  openModal() {
    this.loading = false
    this.modalRef = this.modalService.open(CreateShopComponent, {
      modalClass: 'modal-fullscreen',
    });

    this.modalRef.onClose.subscribe((data) => {
      if (data) {
        const token = this.storageService.getItem('token');
        let user_id;
        if (token != null) {
          var decodeToken: any = this.tokenService.decodeToken(token);
          user_id = decodeToken.id;
        }

        const formData = new FormData();

        // Append all fields from the data object
        formData.append('name', data.get('name') || '');
        formData.append('location', data.get('location') || '');
        formData.append('description', data.get('description') || '');
        formData.append('contactNumber', data.get('contactNumber') || '');
        formData.append('categoryId', data.get('categoryId') || '');
        formData.append('userId', user_id);

        // Append the image file if present
        const image = data.get('image');
        if (image) {
          formData.append('image', image, image.name || 'uploaded_image');
        }

        // Debugging: Log FormData contents
        // console.log('FormData Contents:');
        // formData.forEach((value, key) => {
        //   console.log(`${key}:`, value);
        // });

        this.businessService.createBusiness(formData).subscribe(
          (response) => {
            this.businessId = response.id;
            console.log("ID: ",this.businessId)
            this.toastr.success("Business Create Successfully!","Success")
            this.fetchBusinessInfo(this.userId);
            this.router.navigate(['/o/shop',this.businessId]);

          },
          (error) => {
            console.error('Error In Business Create: ', error);
          }
        );
      }
    });
  }



  logoutButton(): void{
    this.storageService.removeItem("token");
    this.router.navigate(['login']);
  }
  getUserProfile(imagePath: string): string {
    return this.userService.getImageUrl(imagePath);
  }
  getImageUrl(imagePath: string): string {
    return this.businessService.getImageUrl(imagePath);
  }
isSidebarCollapsed = false;

  metrics = [
    {
      title: 'EARNINGS (MONTHLY)',
      value: '$40,000',
      color: '#4e73df',
      icon: 'fas fa-dollar-sign'
    },
    {
      title: 'EARNINGS (ANNUAL)',
      value: '$215,000',
      color: '#1cc88a',
      icon: 'fas fa-dollar-sign'
    },
    {
      title: 'TASKS',
      value: '50%',
      color: '#36b9cc',
      icon: 'fas fa-list',
      showProgress: true,
      progress: 50
    },
    {
      title: 'PENDING REQUESTS',
      value: '18',
      color: '#f6c23e',
      icon: 'fas fa-comments'
    }
  ];

  toggleSidebar() {
    this.isSidebarCollapsed = !this.isSidebarCollapsed;
  }
}
