import { Component, OnInit } from '@angular/core';
import { CreateModalComponent } from './create-business/modals/create-modal/create-modal.component';
import { MdbModalRef, MdbModalService } from 'mdb-angular-ui-kit/modal';
import { MdbTooltipModule } from 'mdb-angular-ui-kit/tooltip';
import { MdbRippleModule } from 'mdb-angular-ui-kit/ripple';
import { BusinessService } from '../../../services/business/business.service';
import { JwtService } from '../../../services/jwt.service';
import { StorageService } from '../../../services/storage.service';
import { Business } from '../../../models/business';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { AddBusinessOwnerComponent } from './add-business-owner/add-business-owner.component';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-business',
  standalone: true,
  imports: [MdbTooltipModule, MdbRippleModule, CommonModule,RouterLink],
  templateUrl: './business.component.html',
  styleUrl: './business.component.css'
})
export class BusinessComponent implements OnInit {
    modalRef: MdbModalRef<CreateModalComponent> | null = null;//
    modalRef1: MdbModalRef<AddBusinessOwnerComponent> | null = null;
    businesses:Business[]  =[];
    userId:any;
    token:any;

    constructor(private modalService: MdbModalService,
                private toastr:ToastrService,
                private businessService:BusinessService,
                private tokenService:JwtService,
                private storageService:StorageService,
                private router: Router,
                private jwtService: JwtService
    ) {}
    ngOnInit(): void {
      this.token = this.storageService.getItem("token");
      this.userId = this.jwtService.getUserId(this.token);
      this.businessService.getAllBusiness(this.userId).subscribe(
        response =>{
          this.businesses = response
          console.log("RES: ",response)
        },
        error =>{
          console.error("ERROR IN FETCHING: ", error);
        }
      )
    }
      openUserModal(): void {
        this.modalRef1 = this.modalService.open(AddBusinessOwnerComponent, {
          modalClass: 'modal-md',// Optional: specify modal size (e.g., 'modal-sm', 'modal-lg')
        });

        this.modalRef1.onClose.subscribe((data) => {
          if (data) {
            const requestData = {
              ...data, // Spread existing form data
            };
            console.log('Form submitted:', requestData);
            this.businessService.addBusinessOwner(requestData).subscribe(
                response => {
                  console.log("Server Response: ", response);
                  // Toastr success alert
                  this.toastr.success('Business created successfully!', 'Success');
                  // location.reload();
                  // this.router.navigate(['d/business'])
                },
                error => {
                  console.error("Error In Owner Create: ",error)
                }
            )


          }
        });

      }


    openModal() {

      this.modalRef = this.modalService.open(CreateModalComponent, {
        modalClass: 'modal-lg',// Optional: specify modal size (e.g., 'modal-sm', 'modal-lg')
      });


      this.modalRef.onClose.subscribe((data) => {
        if (data) {
          const token = this.storageService.getItem("token");
          let user_id;
          if(token!= null){
            var decodeToken:any = this.tokenService.decodeToken(token);
            user_id = decodeToken.id;
          }

          const requestData = {
            ...data, // Spread existing form data
            userId: user_id, // Append userId
          };
          console.log('Form submitted:', requestData);
          this.businessService.createBusiness(requestData).subscribe(
              response => {
                console.log("Server Response: ", response)
                location.reload()
                this.router.navigate(['business'])
              },
              error => {
                console.error("Error In Business Create: ",error)
              }
          )


        }
      });
    }

}
