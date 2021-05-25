import { CreateDateColumn, UpdateDateColumn, Entity, PrimaryGeneratedColumn, Column, BaseEntity } from "typeorm";
import { Field, ObjectType  } from "type-graphql";
@ObjectType()
@Entity()
export class Product extends BaseEntity {
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
  @Column()
  title!: string;

  @Field( { nullable: true })
  @Column({ nullable: true })
  description?: string;

  @Field(() => String, { nullable: true })
  @Column({ nullable: true })
  productAvailabileTo?: Date;

  @Field(() => String, { nullable: true })
  @Column({  nullable: true })
  productAvailabileFrom?: Date;

  @Field({ nullable: true })
  @Column({ type: "decimal", nullable: true })
  basePrice!: number;

  @Field( { nullable: true })
  @Column({ nullable: true })
  barcode?: string;

  @Field({ nullable: true })
  @Column({ nullable: true })
  packSize: string;

  @Field( { nullable: true })
  @Column({ type: "decimal", nullable: true })
  discount?: number;

  @Field({ nullable: true })
  @Column({ nullable: true })
  image?: string;

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
}
