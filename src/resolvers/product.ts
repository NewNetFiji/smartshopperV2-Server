import { Arg, Int, Mutation, Query, Resolver } from "type-graphql";
import { Product } from "../entities/Product";

@Resolver()
export class ProductResolver {
  @Query(() => [Product])
  async products(): Promise<Product[]> {
    return Product.find();
  }

  @Query(() => Product, { nullable: true }) //graphql type
  product(
    @Arg("id", () => Int) id: number,    
  ): Promise<Product | undefined> {
    // return type
    return Product.findOne( id);
  }

  @Mutation(() => Product) //graphql type
  async createProduct(
    @Arg("title") title: string    
  ): Promise<Product> {
    
    return Product.create({title}).save();
  }

  @Mutation(() => Product, { nullable: true }) //graphql type
  async updateProduct(
    @Arg("id") id: number,
    @Arg("product") product: Product
    
    
  ): Promise<Product | null> {
    // return type typescript
    const prod = await Product.findOne( id );
    if (!prod) {
      return null;
    }
    if (typeof product !== undefined) {      
      Product.update(id, product);
    } else {
      return null;
    }
    return product;
  }

  @Mutation(() => Boolean, { nullable: true }) //graphql type
  async deleteProduct(
    @Arg("id") id: number,    
  ): Promise<Boolean> {
    // return type typescript
    const prod = await Product.findOne( id );
    if (!prod) {
      return false;
    } else {
      prod.status = "Deleted";
      await Product.update(id, prod)
      return true;
    }
  }
}
