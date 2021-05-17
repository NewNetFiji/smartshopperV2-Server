import { Arg, Ctx, Int, Mutation, Query, Resolver } from "type-graphql";
import { Product } from "../entities/Product";
import { MyContext } from "../types";

@Resolver()
export class ProductResolver {
  @Query(() => [Product])
  products(@Ctx() { em }: MyContext): Promise<Product[]> {
    return em.find(Product, {});
  }

  @Query(() => Product, { nullable: true }) //graphql type
  product(
    @Arg("id", () => Int) id: number,
    @Ctx() { em }: MyContext
  ): Promise<Product | null> {
    // return type
    return em.findOne(Product, { id });
  }

  @Mutation(() => Product) //graphql type
  async createProduct(
    @Arg("title") title: string,
    @Ctx() { em }: MyContext
  ): Promise<Product> {
    // return type
    const product = em.create(Product, { title });
    await em.persistAndFlush(product);
    return product;
  }

  @Mutation(() => Product, { nullable: true }) //graphql type
  async updateProduct(
    @Arg("id") id: number,
    @Arg("title") title: string,
    //@Arg('price', () => Number, {nullable: true} ) price: number
    @Ctx() { em }: MyContext
  ): Promise<Product | null> {
    // return type typescript
    const prod = await em.findOne(Product, { id });
    if (!prod) {
      return null;
    }
    if (typeof title !== undefined) {
      prod.title = title;
      await em.persistAndFlush(prod);
    } else {
      return null;
    }
    return prod;
  }

  @Mutation(() => Boolean, { nullable: true }) //graphql type
  async deleteProduct(
    @Arg("id") id: number,
    @Ctx() { em }: MyContext
  ): Promise<Boolean> {
    // return type typescript
    const prod = await em.findOne(Product, { id });
    if (!prod) {
      return false;
    } else {
      prod.status = "Deleted";
      await em.persistAndFlush(prod);
      return true;
    }
  }
}
