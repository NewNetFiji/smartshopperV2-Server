import {
  UpdateDateColumn,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  Column,
  BaseEntity,
  OneToMany,
} from "typeorm";
import { Field, ObjectType } from "type-graphql";
import { User } from "./User";
import { Product } from "./Product";
import { Order } from "./Order";
import { registerEnumType } from "type-graphql";

export enum VendorStatus {
  NEW = "New",
  ACTIVE = "Active",
  INACTIVE = "In-Active",
  SUSPENDED = "Suspended",
  DELETED = "Deleted",
}

export enum TypeOfVendor {
  NEW = "New",
  ADMIN = "Admin",
  DISPLAY = "Display", //does not allow orders
  TRADER = "Trader", //allows Orders
  PUBLIC = "Public",
}

registerEnumType(VendorStatus, {
  name: "VendorStatus",
  description: "Tracks the status of an vendor",
});

registerEnumType(TypeOfVendor, {
  name: "TypeOfVendor",
  description: "Type of vendor",
});

@ObjectType()
@Entity()
export class Vendor extends BaseEntity {
  @Field()
  @PrimaryGeneratedColumn()
  id!: number;

  @Field()
  @Column({ unique: true })
  name!: string;

  @Field()
  @Column({ nullable: true })
  address?: string;

  @Field()
  @Column({ nullable: true })
  tin?: string;

  @Field()
  @Column({ nullable: true })
  image?: string;

  @Field(() => VendorStatus)
  @Column({
    type: "enum",
    enum: VendorStatus,
    default: VendorStatus.NEW,
  })
  status: VendorStatus;

  @Field(() => TypeOfVendor)
  @Column({
    type: "enum",
    enum: TypeOfVendor,
    default: TypeOfVendor.NEW,
  })
  vendorType: TypeOfVendor;

  @OneToMany(() => User, (user) => user.vendor)
  users: User[];

  @OneToMany(() => Product, (product) => product.vendor)
  products: Product[];

  @OneToMany(() => Order, (order) => order.vendor)
  orders: Order[];

  @Field(() => String)
  @CreateDateColumn()
  createdAt: Date;

  @Field(() => String)
  @UpdateDateColumn()
  updatedAt: Date;
}
