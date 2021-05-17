import { Entity, PrimaryKey, Property } from "@mikro-orm/core";
import { Field, Int, ObjectType } from "type-graphql";

@ObjectType()
@Entity()
export class User {
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
  @Property({ type: "text", unique: true })
  email!: string;
  
  @Property({ type: "text" })
  password!: string;

  @Property({ type: "text", nullable: true })
  firstName?: string;

  @Property({ type: "text" , nullable: true})
  lastName?: string;

  @Field()
  @Property({ type: "text", default: 'nonAdmin' })
  userRole?: string;

  @Field()
  @Property({ type: "text", default: 'Active' })
  status?: string;

}
