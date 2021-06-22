import {
  UpdateDateColumn,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  Column,
  BaseEntity,
  ManyToOne,
  OneToMany,
} from "typeorm";
import { Field, Int, ObjectType, registerEnumType } from "type-graphql";
import { Vendor } from "./Vendor";
import { Upboat } from "./Upboat";
import { Order } from "./Order";


export enum UserStatus {
  NEW = "New",
  ACTIVE = "Active",
  INACTIVE = "In-Active",
  SUSPENDED = "Suspended",
  DELETED = "Deleted",
}

export enum UserRole {
  GENERAL = "General",
  ADMIN = "Admin",
  GHOST = "Ghost",
  SUPER = "Supervisor",
  DATA = "Data Entry",
}

registerEnumType(UserStatus, {
  name: "UserStatus",
  description: "General Status Enum.",
});

registerEnumType(UserRole, {
  name: "UserRole",
  description: "User Role. duhh.",
});

@ObjectType()
@Entity()
export class User extends BaseEntity {
  @Field()
  @PrimaryGeneratedColumn()
  id!: number;

  @Field(() => String)
  @CreateDateColumn()
  createdAt: Date;

  @Field(() => String)
  @UpdateDateColumn()
  updatedAt: Date;

  @Field()
  @Column({ unique: true })
  email!: string;

  @Column()
  password!: string;

  @Field()
  @Column({ nullable: true })
  firstName?: string;

  @Field()
  @Column({ nullable: true })
  lastName?: string;

  @Field(() => [UserRole])
  @Column({
    array: true,
    type: "enum",
    enum: UserRole,
    default: [UserRole.GENERAL],
  })
  roles: UserRole[];

  @Field(() => UserStatus)
  @Column({
    
    type: "enum",
    enum: UserStatus,
    default: UserStatus.NEW,
  })
  status: UserStatus;

  @Field(()=>Int)
  @Column({ type: "int"})
  vendorId: number;

  @Field(() => [Order])
  @OneToMany(() => Order, (order) => order.customer)
  ordersPlaced: Order[];

  @Field(() => [Order])
  @OneToMany(() => Order, (order) => order.creator)
  ordersMade: Order[];

  @Field(() => [Order])
  @OneToMany(() => Order, (order) => order.updater)
  ordersUpdated: Order[];

  @Field(() => Vendor)
  @ManyToOne(() => Vendor, (vendor) => vendor.users)
  vendor: Vendor;

  @Field(() => [Upboat])
  @OneToMany(() => Upboat, (upboat) => upboat.user)
  upboats?: Upboat[];
}
