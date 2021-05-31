import {
  UpdateDateColumn,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  Column,
  BaseEntity,
  ManyToOne
} from "typeorm";
import { Field, ObjectType } from "type-graphql";
import { Vendor } from "./Vendor";

@ObjectType()
@Entity()
export class User extends BaseEntity{
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

  @Field()
  @Column({ default: "nonAdmin" })
  userRole?: string;

  @Field()
  @Column({ default: "Active" })
  status?: string;

  @Field()
  @Column()
  vendorId?: number;

  @ManyToOne(() => Vendor, (vendor) => vendor.users)
  vendor: Vendor;
}
