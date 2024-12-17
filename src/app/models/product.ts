export class Product {
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
      public updatedAt: Date
    ) {}
  }