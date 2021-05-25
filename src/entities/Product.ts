import { Entity, PrimaryKey, Property } from "@mikro-orm/core";
import { Field, Int, ObjectType } from "type-graphql";

@ObjectType()
@Entity()
export class Product {
  @Field(() => Int)
  @PrimaryKey()
  id!: number;

  @Field(() => String)
  @Property({ type: "date" })
  createdAt = new Date();

  @Field(() => String)
  @Property({ type: "date", onUpdate: () => new Date() })
  updatedAt = new Date();

  @Field()
  @Property({ type: "text" })
  title!: string;

  @Field( { nullable: true })
  @Property({ type: "text", nullable: true })
  description?: string;

  @Field(() => String, { nullable: true })
  @Property({ type: "date", nullable: true })
  productAvailabileTo?: Date;

  @Field(() => String, { nullable: true })
  @Property({ type: "date", nullable: true })
  productAvailabileFrom?: Date;

  @Field(() => Int, { nullable: true })
  @Property({ nullable: true })
  basePrice!: number;

  @Field( { nullable: true })
  @Property({ nullable: true })
  barcode?: string;

  @Field({ nullable: true })
  @Property({ nullable: true })
  packSize: string;

  @Field(() => Int , { nullable: true })
  @Property({ nullable: true })
  discount?: number;

  @Field({ nullable: true })
  @Property({ length: 255, nullable: true })
  image?: string;

  @Field({ nullable: true })
  @Property({ nullable: true })
  category?: string;

  @Field()
  @Property({ default: "Active" })
  status!: string;

  @Field({ nullable: true })
  @Property({ nullable: true })
  manufacturer?: string;

  @Field({ nullable: true })
  @Property({ type: "text", nullable: true })
  tags?: string;
}
