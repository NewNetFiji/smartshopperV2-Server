import { Field, ObjectType } from "type-graphql";
import { BaseEntity, Column, Entity, ManyToOne, PrimaryColumn } from "typeorm";
import { Product } from "./Product";
import { User } from "./User";

@ObjectType()
@Entity()
export class Upboat extends BaseEntity {
  @Field()
  @Column()
  value: boolean;

  @Field()
  @PrimaryColumn()
  userId: number;

  @Field()
  @PrimaryColumn()
  productId: number;

  @Field(()=>User)
  @ManyToOne(() => User, (user) => user.upboats)
  user: User;

  @Field(()=>Product)
  @ManyToOne(() => Product, (product) => product.upboats)
  product: Product;
}
