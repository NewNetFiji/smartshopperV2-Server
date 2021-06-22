import { Field, Int, ObjectType } from "type-graphql";
import {
  BaseEntity,
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from "typeorm";
import { Orderdetail } from "./Orderdetail";
import { User } from "./User";
import { registerEnumType } from "type-graphql";
import { Vendor } from "./Vendor";

export enum OrderStatus {
  NEW = "New",
  PROCESSING = "Processing",
  REJECTED = "Rejected",
  DELIVERY = "Delivery",
  REVIEW = "Review",
  COMPLETED = "Completed",
  DELETED = "Deleted",
}

registerEnumType(OrderStatus, {
  name: "OrderStatus",
  description: "Tracks the status of an order",
});

@ObjectType()
@Entity()
export class Order extends BaseEntity {
  @Field()
  @PrimaryGeneratedColumn()
  id!: number;

  @Field()
  orderTotal: number;

  @Field({ nullable: true })
  tax?: number;

  @Field(() => Int)
  @Column({ type: "int" })
  customerId!: number;

  @Field(() => Int, { nullable: true })
  @Column({ type: "int", nullable: true })
  creatorId?: number;

  @Field(() => Int, { nullable: true })
  @Column({ type: "int", nullable: true })
  updaterId?: number;

  @Field(() => Int)
  @Column({ type: "int" })
  vendorId!: number;

  @Field(() => OrderStatus)
  @Column({
    type: "enum",
    enum: OrderStatus,
    default: OrderStatus.NEW,
  })
  status!: OrderStatus;

  @Field({ nullable: true })
  @Column({ nullable: true })
  deliveryAddress?: string;

  @Field(() => String, { nullable: true })
  @Column({ nullable: true })
  deliveryDate?: Date;

  @Field(() => User)
  @ManyToOne(() => User, (user) => user.ordersPlaced)
  customer: User;

  @Field(() => User, { nullable: true })
  @ManyToOne(() => User, (user) => user.ordersMade, { nullable: true })
  creator?: User;

  @Field(() => User, { nullable: true })
  @ManyToOne(() => User, (user) => user.ordersUpdated, { nullable: true })
  updater?: User;

  @Field(() => Vendor)
  @ManyToOne(() => Vendor, (vendor) => vendor.orders)
  vendor: Vendor;

  @Field(() => [Orderdetail], { nullable: true })
  @OneToMany(() => Orderdetail, (orderitems) => orderitems.order, {    
    cascade: true,
  })
  items?: Orderdetail[];

  
  @Field(() => String)
  @CreateDateColumn()
  createdAt: Date;

  @Field(() => String)
  @UpdateDateColumn()
  updatedAt: Date;
}
