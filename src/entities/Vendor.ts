import {
    UpdateDateColumn,
    CreateDateColumn,
    Entity,
    PrimaryGeneratedColumn,
    Column,
    BaseEntity,
    OneToMany
  } from "typeorm";
  import { Field, ObjectType } from "type-graphql";
  import {User} from "./User"
import { Product } from "./Product";

  @ObjectType()
  @Entity()
  export class Vendor extends BaseEntity{
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
  
    @Field()
    @Column({ default: "Active" })
    status?: string;

    //vendor type "Admin" can create sub-users through protal page addUser. 
    //Users created through the Register front end page will be set to vendorType="Public" 
    @Field()
    @Column({ default: "Admin" })
    vendorType?: string;

    @OneToMany(() => User, (user) => user.vendor)
    users: User[];

    @OneToMany(() => Product, (product) => product.vendor)
    products: Product[];

    @Field(() => String)
    @CreateDateColumn()
    createdAt: Date;
  
    @Field(() => String)
    @UpdateDateColumn()
    updatedAt: Date;   
  }
  