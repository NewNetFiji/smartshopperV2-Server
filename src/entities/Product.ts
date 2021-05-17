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

  @Field()
  @Property({ type: "text", nullable: true })
  description?: string;

  @Field(() => String)
  @Property({ type: "date", nullable: true })
  productAvailabileTo?: Date;

  @Field(() => String)
  @Property({ type: "date", nullable: true })
  productAvailabileFrom?: Date;

  @Field(() => Int)
  @Property({ nullable: true })
  basePrice!: number;

  @Field(() => Int)
  @Property({ nullable: true })
  discount?: number;

  @Field()
  @Property({ length: 255, nullable: true })
  image?: string;

  @Field()
  @Property({ nullable: true })
  category?: string;

  @Field()
  @Property({ default: "Active" })
  status!: string;

  @Field()
  @Property({ nullable: true })
  manufacturer?: string;

  @Field()
  @Property({ type: "text", nullable: true })
  tags?: string;
}
