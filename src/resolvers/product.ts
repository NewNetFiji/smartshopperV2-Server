import {
  Arg,
  Authorized,
  Ctx,
  Field,
  FieldResolver,
  InputType,
  Int,
  Mutation,
  ObjectType,
  Query,
  Resolver,
  Root,
  UseMiddleware,
} from "type-graphql";
import { getConnection, getRepository } from "typeorm";
import { Image } from "../entities/Image";
import { Product, Status } from "../entities/Product";
import { Upboat } from "../entities/Upboat";
import { UserRole } from "../entities/User";
import { isAuth } from "../middleware/isAuth";
import { MyContext } from "../types";
import {logger} from "../utils/logger"
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
  status?: Status;

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
class PaginatedProducts {
  @Field()
  hasMore: boolean;

  @Field(() => [Product])
  products: Product[];
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

@Resolver(Product)
export class ProductResolver {

  @FieldResolver(() => String, {nullable: true})
  descSnippet(@Root() product: Product) {    
    return product.description?.slice(0, 50);
  }

  @FieldResolver(() => Int, { nullable: true })
  async voteStatus(
    @Root() product: Product,
    @Ctx() { upboatLoader, req }: MyContext
  ) {
    if (!req.session.userId) {
      return null;
    }

    const upboat = await upboatLoader.load({
      productId: product.id,
      userId: req.session.userId,
    });

    return upboat ? upboat.value : null;
  }

  @Mutation(() => Boolean)
  @UseMiddleware(isAuth)
  async vote(
    @Arg("productId", () => Int) productId: number,
    @Arg("value", () => Boolean) value: boolean,
    @Ctx() { req }: MyContext
  ) {
    const { userId } = req.session;

    const voted = await Upboat.findOne({
      where: { productId: productId, userId },
    });

    // the user has voted on the post before
    // and they are changing their vote
    if (voted && voted.value !== value) {
      await getConnection().transaction(async (tm) => {
        await tm.query(
          `
    update upboat
    set value = $1
    where "productId" = $2 and "userId" = $3
        `,
          [value, productId, userId]
        );

        if (value) {
          await tm.query(
            `
          update product
          set points = points + 1,
          "downPoints" = "downPoints" - 1
          where id = $1
        `,
            [productId]
          );
        } else {
          await tm.query(
            `
            update product
            set points = points - 1,
            "downPoints" = "downPoints" + 1
            where id = $1
          `,
            [productId]
          );
        }
      });
    } else if (!voted) {
      // has never voted before
      await getConnection().transaction(async (tm) => {
        await tm.query(
          `
    insert into upboat ("userId", "productId", value)
    values ($1, $2, $3)
        `,
          [userId, productId, value]
        );

        if (value) {
          await tm.query(
            `
          update product
          set points = points + 1          
          where id = $1
        `,
            [productId]
          );
        } else {
          await tm.query(
            `
            update product
            set "downPoints" = "downPoints" + 1
            where id = $1
          `,
            [productId]
          );
        }
      });
    }
    return true;
  }

  @Query(() => Int)
  async countProducts(
    @Arg("vendorId", () => Int, {nullable: true}) vendorId: number,
  ): Promise<Number> {
    const qb = await getConnection()
      .getRepository(Product)
      .createQueryBuilder("p")
      .select("count(*)", "count")
      .where("p.status in ('New', 'Active')")
      {vendorId? qb.andWhere('"vendorId" = :vendorId', { vendorId: vendorId }): ''}
      
      const {count} = await qb.getRawOne();

      console.log("count: ", count)

    if (count) {
      return count;
    }

    return 0;
  }

  @Query(() => PaginatedProducts)
  async getProducts(
    @Arg("limit", () => Int) limit: number,
    @Arg("cursor", () => String, { nullable: true }) cursor: string | null,
    @Arg("vendorId", () => Int, { nullable: true }) vendorId?: number
  ): Promise<PaginatedProducts> {
    const realLimit = Math.min(50, limit);
    const realLimitPlusOne = realLimit + 1;

    let replacements: any[] = [realLimitPlusOne];
    if (vendorId && cursor) {
      replacements.push(new Date(parseInt(cursor)));
      replacements.push(vendorId);
    } else if (cursor) {
      replacements.push(new Date(parseInt(cursor)));
    } else if (vendorId) {
      replacements.push(vendorId);
    }

    const products = await getConnection().query(
      `
      select p.*,
        json_build_object(
          'id', v.id,
          'image', v.image,
          'name', v.name
        ) vendor,
        jsonb_agg (json_build_object(
          'id', i.id,
          'url', i.url,
          'productId', i."productId"
        )) images        
      from product p
        left join image i on i."productId" = p.id
        left join vendor v on v.id = p."vendorId"
        where p.status in ('New', 'Active') 
        ${cursor ? ` and  p."createdAt" < $2` : ""}
        ${vendorId && cursor ? ` and  p."vendorId" = $3` : ""}
        ${vendorId && !cursor ? ` and  p."vendorId" = $2` : ""}
        group by p.id, v.id
        order by p."createdAt" desc
        limit $1

      `,
      replacements
    );

    return {
      hasMore: products.length === realLimitPlusOne,
      products: products.slice(0, realLimit),
    };
  }

  @Query(() => [Product])
  async products(    
    @Arg("vendorId", () => Int, { nullable: true }) vendorId?: number
  ): Promise<Product[]> {
    

    const qb = getConnection()
      .getRepository(Product)
      .createQueryBuilder("p")
      .where("p.status in ('New', 'Active')")
      .orderBy('"createdAt"', "DESC")      
      {vendorId? qb.andWhere('"vendorId" = :vendorId', { vendorId: vendorId }): ''}

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
      logger.log('error', 'Mutation createProduct: %s', "A valid vendor Id must be supplied")
      return {
        errors: [
          {
            field: "vendorId",
            message: "A valid vendor Id must be supplied",
          },
        ],
      };
    }

    let product = new Product
    try {
     product = await Product.create({
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
  }catch(error){
    logger.log('error', 'Mutation createProduct: %s', error)
  }

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

  @Mutation(() => ProductResponse, { nullable: true }) 
  @Authorized(UserRole.ADMIN, UserRole.DATA, UserRole.SUPER)
  async updateProduct(
    @Arg("options", () => ProductInput) options: ProductInput,
    @Ctx() { req }: MyContext
  ): Promise<ProductResponse> {
    const prodRepository = getRepository(Product);
    const product = await prodRepository.findOne(options.id);
    
    if (!product) {
      logger.log('error', 'Mutation updateProduct: %s', "Product ID no longer exists")
      return {        
        errors: [
          {
            field: "id",
            message: "That product no longer exisits",
          },
        ],
      };
    }

    if (req.session.vendorId != product?.vendorId){
      logger.log('error', 'Mutation updateProduct: %s', "vendor ID's do not match")
      return {        
        errors: [
          {
            field: "vendorId",
            message: "You can only update your own companies products",
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
  @Authorized(UserRole.ADMIN, UserRole.DATA, UserRole.SUPER)
  async deleteProduct(
    @Arg("id") id: number,
    @Ctx() { req }: MyContext
    ): Promise<Boolean> {
      

    const prod = await Product.findOne(id);
    if (req.session.vendorId != prod?.vendorId){
      logger.log('error', 'Mutation deleteProduct: %s', "vendor ID's do not match")
      throw new Error ('Not Authorized!')
    }

    if (!prod) {
      return false;
    } else {
      prod.status = Status.DELETED;
      await Product.save(prod);
      return true;
    }
  }
}
