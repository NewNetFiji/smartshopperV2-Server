import {
  UpdateDateColumn,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  Column,
  BaseEntity,
  ManyToOne,
  OneToMany
} from "typeorm";
import { Field, ObjectType } from "type-graphql";
import { Vendor } from "./Vendor";
import { Product } from "./Product";
import { Upboat } from "./Upboat";

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

  
  @OneToMany(() => Upboat, (upboat) => upboat.user )
  upboats?: Upboat[];
}
