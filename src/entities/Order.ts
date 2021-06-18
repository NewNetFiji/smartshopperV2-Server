import { Field, Int, ObjectType } from "type-graphql";
import { BaseEntity, Column, CreateDateColumn, Entity, ManyToOne, PrimaryColumn, UpdateDateColumn } from "typeorm";
import { Product } from "./Product";
import { User } from "./User";

@ObjectType()
@Entity()
export class Order extends BaseEntity {
  @Field(()=>Int)
  @Column({type: "int"})
  qty: number;

  @Field()
  @Column({ type: "decimal", default: 0 })
  price!: number;

  @Field()
  @PrimaryColumn()
  userId: number;

  @Field()
  @PrimaryColumn()
  productId: number;

  @Field(()=>User)
  @ManyToOne(() => User, (user) => user.orders)
  user: User;

  @Field(()=>Product)
  @ManyToOne(() => Product, (product) => product.orders)
  product: Product;

  @Field(() => String)
  @CreateDateColumn()
  createdAt: Date;

  @Field(() => String)
  @UpdateDateColumn()
  updatedAt: Date;
}
