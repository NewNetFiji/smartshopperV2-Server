import {
  CreateDateColumn,
  UpdateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  Column,
  BaseEntity,
  ManyToOne,
  OneToMany,
} from "typeorm";
import { Field, ObjectType } from "type-graphql";
import { Vendor } from "./Vendor";
import { Image } from "./Image";
import { Upboat } from "./Upboat";
import { Order } from "./Order";
@ObjectType()
@Entity()
export class Product extends BaseEntity {
  @Field()
  @PrimaryGeneratedColumn()
  id!: number;

  @Field()
  @Column()
  title!: string;

  @Field({ nullable: true })
  @Column({ type: "int", default: 0 })
  points!: number;

  @Field({ nullable: true })
  @Column({ type: "int", default: 0 })
  downPoints!: number;

  @Field(()=> Boolean, {nullable: true})
  voteStatus: boolean | null

  @Field({ nullable: true })
  @Column({ nullable: true })
  description?: string;

  @Field(() => String, { nullable: true })
  @Column({ nullable: true })
  productAvailableTo?: Date;

  @Field(() => String, { nullable: true })
  @Column({ nullable: true })
  productAvailableFrom?: Date;

  @Field()
  @Column({ type: "decimal", default: 0 })
  basePrice!: number;

  @Field({ nullable: true })
  @Column({ nullable: true })
  barcode?: string;

  @Field({ nullable: true })
  @Column({ nullable: true })
  packSize: string;

  @Field({ nullable: true })
  @Column({ type: "decimal", nullable: true })
  discount?: number;

  @Field({ nullable: true })
  @Column({ nullable: true })
  category?: string;

  @Field()
  @Column({ default: "Active" })
  status!: string;

  @Field({ nullable: true })
  @Column({ nullable: true })
  manufacturer?: string;

  @Field({ nullable: true })
  @Column({ nullable: true })
  tags?: string;

  @Field()
  @Column()
  vendorId?: number;

  @Field(() => Vendor)
  @ManyToOne(() => Vendor, (vendor) => vendor.products)
  vendor: Vendor;  

  @Field(() => [Image], {nullable: true})
  @OneToMany(() => Image, (image) => image.product, {
    cascade: true,
  })
  images?: Image[];

  @Field(() => [Upboat], {nullable: true})
  @OneToMany(() => Upboat, (upboat) => upboat.product )
  upboats?: Upboat[];

  @Field(() => [Order])
  @ManyToOne(() => Order, (order) => order.product)
  orders: Order[];

  @Field(() => String)
  @CreateDateColumn()
  createdAt: Date;

  @Field(() => String)
  @UpdateDateColumn()
  updatedAt: Date;
}
