import { Field, Int, ObjectType, registerEnumType } from "type-graphql";
import {
  BaseEntity, Column, CreateDateColumn, Entity, ManyToOne,
  OneToMany, PrimaryGeneratedColumn, UpdateDateColumn
} from "typeorm";
import { Image } from "./Image";
import { Upboat } from "./Upboat";
import { Vendor } from "./Vendor";


export enum Status {
  NEW = "New",
  ACTIVE = "Active",
  INACTIVE = "In-Active",
  SUSPENDED = "Suspended",
  DELETED = "Deleted",
}

registerEnumType(Status, {
  name: "Status",
  description: "General Status Enum. Defined in Product entity.",
});
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

  @Field(() => Status)
  @Column({
    type: "enum",
    enum: Status,
    default: Status.NEW,
  })
  status!: Status;

  @Field({ nullable: true })
  @Column({ nullable: true })
  manufacturer?: string;

  @Field({ nullable: true })
  @Column({ nullable: true })
  tags?: string;

  @Field(()=>Int)
  @Column({ type: "int"})
  vendorId: number;

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

  @Field(() => String)
  @CreateDateColumn()
  createdAt: Date;

  @Field(() => String)
  @UpdateDateColumn()
  updatedAt: Date;
}
