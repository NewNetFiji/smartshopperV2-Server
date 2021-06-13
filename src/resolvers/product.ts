import {
  Arg,
  Field,
  InputType,
  Int,
  Mutation,
  ObjectType,
  Query,
  Resolver,
  UseMiddleware,
} from "type-graphql";
import { getConnection, getRepository } from "typeorm";
import { Image } from "../entities/Image";
import { Product } from "../entities/Product";
import { isAuth } from "../middleware/isAuth";
import { FieldError } from "./FieldError";

@InputType()
class ProductInput {
  @Field({ nullable: true })
  id?: number;

  @Field({ nullable: true })
  title!: string;

  @Field({ nullable: true })
  description?: string;

  @Field(() => [String], { nullable: true })
  imageUrl?: [string];

  @Field(() => String, { nullable: true })
  productAvailableTo?: Date;

  @Field(() => String, { nullable: true })
  productAvailableFrom?: Date;

  @Field({ nullable: true })
  basePrice?: number;

  @Field({ nullable: true })
  barcode?: string;

  @Field({ nullable: true })
  packSize?: string;

  @Field({ nullable: true })
  discount?: number;

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

  @Field(() => String, { nullable: true })
  createdAt: Date;

  @Field(() => String, { nullable: true })
  updatedAt: Date;
}

@ObjectType()
class ProductResponse {
  @Field(() => [FieldError], { nullable: true })
  errors?: FieldError[];

  @Field(() => Product, { nullable: true })
  product?: Product;

  @Field(() => [Image], { nullable: true })
  images?: Image[];
}

@Resolver()
export class ProductResolver {
  @Query(() => Int)
  async countProducts(): Promise<Number> {
    const {count} = await getConnection()
      .getRepository(Product)
      .createQueryBuilder("products")
      .select("count(*)", "count")
      .getRawOne();      

      if (count){
        return count
      }

    return 0;
  }

  @Query(() => [Product])
  async fullProducts(
    @Arg("limit", () => Int) limit: number,
    @Arg("cursor", () => String, { nullable: true }) cursor: string | null,
    @Arg("vendorId", () => Int, { nullable: true }) vendorId?: number
  ): Promise<Product[]> {
    const realLimit = Math.min(50, limit);

    const qb = getConnection()
      .getRepository(Product)
      .createQueryBuilder("p")
      .leftJoinAndSelect("p.images", "image")
      .leftJoinAndSelect("p.vendor", "vendor")
      .orderBy("p.\"createdAt\"", "DESC")
      .limit(realLimit)
      .where("p.status = 'Active'");
    if (vendorId && cursor) {
      qb.where('p."vendorId" = :vendorId', { vendorId: vendorId });
      qb.andWhere('p."createdAt" < :cursor', {
        cursor: new Date(parseInt(cursor)),
      });
    } else if (cursor) {
      qb.where('p."createdAt" < :cursor', {
        cursor: new Date(parseInt(cursor)),
      });
    } else if (vendorId) {
      qb.where('p."vendorId" = :vendorId', { vendorId: vendorId });
    }

    return qb.getMany();
  }

  @Query(() => [Product])
  async products(
    @Arg("limit", () => Int) limit: number,
    @Arg("cursor", () => String, { nullable: true }) cursor: string | null,
    @Arg("vendorId", () => Int, { nullable: true }) vendorId?: number
  ): Promise<Product[]> {
    const realLimit = Math.min(50, limit);

    const qb = getConnection()
      .getRepository(Product)
      .createQueryBuilder("products")
      .orderBy('"createdAt"', "DESC")
      .take(realLimit);
    if (vendorId && cursor) {
      qb.where('"vendorId" = :vendorId', { vendorId: vendorId });
      qb.andWhere('"createdAt" < :cursor', {
        cursor: new Date(parseInt(cursor)),
      });
    } else if (cursor) {
      qb.where('"createdAt" < :cursor', { cursor: new Date(parseInt(cursor)) });
    } else if (vendorId) {
      qb.where('"vendorId" = :vendorId', { vendorId: vendorId });
    }

    return qb.getMany();
  }

  @Query(() => Product, { nullable: true }) //graphql type
  product(@Arg("id", () => Int) id: number): Promise<Product | undefined> {
    return Product.findOne(id);
  }

  @Mutation(() => ProductResponse) //graphql type
  @UseMiddleware(isAuth)
  async createProduct(
    @Arg("options", () => ProductInput) options: ProductInput
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
      productAvailableTo: options.productAvailableTo,
      productAvailableFrom: options.productAvailableFrom,
      basePrice: options.basePrice,
      barcode: options.barcode,
      packSize: options.packSize,
      discount: options.discount,
      category: options.category,
      status: options.status,
      manufacturer: options.manufacturer,
      tags: options.tags,
      vendorId: options.vendorId,
    }).save();

    console.log(product);

    if (!product) {
      return {
        errors: [
          {
            field: "title",
            message: "Error Creating Product. Error Code: 420",
          },
        ],
      };
    }

    if (options.imageUrl && options.imageUrl?.length > 0) {
      const saveImages = async () => {
        return Promise.all(
          options.imageUrl!.map((url) => {
            Image.create({ productId: product.id, url: url }).save();
          })
        );
      };
      saveImages().then((images) => {
        return { product, images };
      });
    }

    return { product };

    //return { product };
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
    product.productAvailableTo =
      options.productAvailableTo || product.productAvailableTo;
    product.productAvailableFrom =
      options.productAvailableFrom || product.productAvailableFrom;
    product.basePrice = options.basePrice || product.basePrice;
    product.barcode = options.barcode || product.barcode;
    product.packSize = options.packSize || product.packSize;
    product.discount = options.discount || product.discount;

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
