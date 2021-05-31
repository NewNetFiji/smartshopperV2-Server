import {
  Arg,
  Ctx,
  Field,
  InputType,
  Int,
  Mutation,
  ObjectType,
  Query,
  Resolver,
  UseMiddleware,
} from "type-graphql";
import { getRepository } from "typeorm";
import { Product } from "../entities/Product";
import { isAuth } from "../middleware/isAuth";
import { MyContext } from "../types";
import { FieldError } from "./FieldError";

@InputType()
class ProductInput {
  @Field({ nullable: true })
  id?: number;

  @Field(() => String, { nullable: true })
  createdAt: Date;

  @Field(() => String, { nullable: true })
  updatedAt: Date;

  @Field({ nullable: true })
  title!: string;

  @Field({ nullable: true })
  description?: string;

  @Field(() => String, { nullable: true })
  productAvailabileTo?: Date;

  @Field(() => String, { nullable: true })
  productAvailabileFrom?: Date;

  @Field({ nullable: true })
  basePrice?: number;

  @Field({ nullable: true })
  barcode?: string;

  @Field({ nullable: true })
  packSize?: string;

  @Field({ nullable: true })
  discount?: number;

  @Field({ nullable: true })
  image?: string;

  @Field({ nullable: true })
  category?: string;

  @Field({ nullable: true })
  status?: string;

  @Field({ nullable: true })
  manufacturer?: string;

  @Field({ nullable: true })
  tags?: string;

  @Field({ nullable: true })
  vendorId: number;
}

@ObjectType()
class ProductResponse {
  @Field(() => [FieldError], { nullable: true })
  errors?: FieldError[];

  @Field(() => Product, { nullable: true })
  product?: Product;
}

@Resolver()
export class ProductResolver {
  @Query(() => [Product])
  async products(): Promise<Product[]> {
    return Product.find();
  }

  @Query(() => Product, { nullable: true }) //graphql type
  product(@Arg("id", () => Int) id: number): Promise<Product | undefined> {    
    return Product.findOne(id);
  }

  @Mutation(() => ProductResponse) //graphql type
  @UseMiddleware(isAuth)
  async createProduct(
    @Arg("options", () => ProductInput) options: ProductInput,
    @Ctx() { req }: MyContext
  ): Promise<ProductResponse> {

    

    if (!options.vendorId) {
      return {
        errors: [
          {
            field: "vendorId",
            message: "A valid vendor Id must be supplied",
          },
        ],
      };
    }

    const product = await Product.create({
      title: options.title,
      description: options.description,
      productAvailabileTo: options.productAvailabileTo,
      productAvailabileFrom: options.productAvailabileFrom,
      basePrice: options.basePrice,
      barcode: options.barcode,
      packSize: options.packSize,
      discount: options.discount,
      image: options.image,
      category: options.category,
      status: options.status,
      manufacturer: options.manufacturer,
      tags: options.tags,
    }).save();

    return { product };
  }

  @Mutation(() => ProductResponse, { nullable: true }) //graphql type
  async updateProduct(
    @Arg("options", () => ProductInput) options: ProductInput
  ): Promise<ProductResponse> {
    const prodRepository = getRepository(Product);
    const product = await prodRepository.findOne(options.id);
    if (!product) {
      return {
        errors: [
          {
            field: "id",
            message: "That product no longer exisits",
          },
        ],
      };
    }

    product.title = options.title || product.title;
    product.description = options.description || product.description;
    product.productAvailabileTo = options.productAvailabileTo || product.productAvailabileTo;
    product.productAvailabileFrom = options.productAvailabileFrom || product.productAvailabileFrom;
    product.basePrice = options.basePrice || product.basePrice;
    product.barcode = options.barcode || product.barcode;
    product.packSize = options.packSize || product.packSize;
    product.discount = options.discount || product.discount;
    product.image = options.image || product.image;
    product.category = options.category || product.category;
    product.status = options.status || product.status;
    product.manufacturer = options.manufacturer || product.manufacturer;
    product.tags = options.tags || product.tags;

    prodRepository.save(product);

    return { product };
  }

  @Mutation(() => Boolean, { nullable: true }) //graphql type
  async deleteProduct(@Arg("id") id: number): Promise<Boolean> {
    // return type typescript
    const prod = await Product.findOne(id);
    if (!prod) {
      return false;
    } else {
      prod.status = "Deleted";
      await Product.save(prod);
      return true;
    }
  }
}
