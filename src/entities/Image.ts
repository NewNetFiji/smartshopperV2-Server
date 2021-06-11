import { Field, ObjectType } from "type-graphql";
import {
  BaseEntity,
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from "typeorm";
import { Product } from "./Product";

@ObjectType()
@Entity()
export class Image extends BaseEntity {
  @Field({nullable: true})
  @PrimaryGeneratedColumn()
  id!: number;

  @Field({nullable: true})
  @Column({ unique: true })
  url!: string;

  @Field({nullable: true})
  @Column()
  productId?: number;

  @ManyToOne(() => Product, (product) => product.images , {
    onDelete: 'CASCADE',
})
  product: Product;

  @Field(() => String, {nullable: true})
  @CreateDateColumn()
  createdAt: Date;

  @Field(() => String, {nullable: true})
  @UpdateDateColumn()
  updatedAt: Date;
}
