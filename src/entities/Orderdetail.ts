import { Field, Int, ObjectType } from "type-graphql";
import {
  BaseEntity,
  Column,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
} from "typeorm";
import { Order } from "./Order";

@ObjectType()
@Entity()
export class Orderdetail extends BaseEntity {
  @Field(() => Int)
  @PrimaryGeneratedColumn()
  id: number;

  @Field(() => Int)
  @Column({ type: "int" })
  qty: number;

  //price should be stored in cents
  @Field(()=>Int)
  @Column({ type: "int", default: 0 })
  price!: number;

  @Field(() => Int)
  @Column({ type: "int" })
  productId: number;

  @Field({ nullable: true })
  @Column({ type: "int" })
  orderId: number;

  
  @ManyToOne(() => Order, (order) => order.items, {
    onDelete: 'CASCADE',
})
  order: Order;
}
