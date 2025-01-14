export class Product {
  imageFile?: File | null;
  discountEdited: boolean | undefined;
    constructor(
      public id: number ,
      public businessId: number,
      public name: string,
      public category: string,
      public price: number,
      public description: string,
      public status: boolean,
      public discount: number,
      public createdAt: Date,
      public updatedAt: Date,
      public imagePath:   string,

    ) {}
  }
