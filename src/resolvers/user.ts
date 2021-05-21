import {
  Arg,
  Ctx,
  Field,
  InputType,
  Mutation,
  ObjectType,
  Query,
  Resolver,
} from "type-graphql";
import { User } from "../entities/User";
import { MyContext } from "../types";
import argon2id from "argon2";
import { passwordStrength } from "check-password-strength";

@InputType()
class UsernamePasswordInput {
  @Field()
  email: string;

  @Field({ nullable: true })
  firstName?: string;

  @Field({ nullable: true })
  lastName?: string;

  @Field()
  password: string;
}

@ObjectType()
class FieldError {
  @Field()
  field: string;

  @Field()
  message: string;
}

function validateEmail(email: string): boolean {
  const re =
    /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
  return re.test(email);
}

@ObjectType()
class UserResponse {
  @Field(() => [FieldError], { nullable: true })
  errors?: FieldError[];

  @Field(() => User, { nullable: true })
  user?: User;
}

@Resolver()
export class UserResolver {
  @Query(() => User, { nullable: true })
  async me(@Ctx() { em, req }: MyContext) {
    if (!req.session.userId) {
      return null;
    }

    const user = await em.findOne(User, {
      id: req.session.userId,
    });
    if (!user) {
      return null;
    }
    return user;
  }

  @Mutation(() => UserResponse)
  async register(
    @Arg("options", () => UsernamePasswordInput) options: UsernamePasswordInput,
    @Ctx() { em }: MyContext
  ): Promise<UserResponse> {
    if (!validateEmail(options.email)) {
      return {
        errors: [
          {
            field: "email",
            message: "Invalid Email",
          },
        ],
      };
    }

    if (passwordStrength(options.password).id < 2) {
      return {
        errors: [
          {
            field: "password",
            message:
              "Passwords must be at least 8 characters and contain lowercase, uppercase, symbol and/or number",
          },
        ],
      };
    }

    const hashedPassword = await argon2id.hash(options.password);
    const user = em.create(User, {
      email: options.email.toLowerCase(),
      firstName: options.firstName,
      lastName: options.lastName,
      password: hashedPassword,
    });

    try {
      await em.persistAndFlush(user);
    } catch (err) {
      if ( err.detail.includes("already exists")) {
        return {
          errors: [
            {
              field: "email",
              message: "That email is already registered.",
            },
          ],
        };
      }
      console.error("Error Message: ", err.message);
    }
    return { user };
  }

  @Mutation(() => UserResponse)
  async login(
    @Arg("options", () => UsernamePasswordInput) options: UsernamePasswordInput,
    @Ctx() { em, req }: MyContext
  ): Promise<UserResponse> {
    const user = await em.findOne(User, {
      email: options.email.toLowerCase(),
    });
    if (!user) {
      return {
        errors: [
          {
            field: "email",
            message: "That Email is not registered.",
          },
        ],
      };
    }

    const valid = await argon2id.verify(user.password, options.password);
    if (!valid) {
      return {
        errors: [
          {
            field: "password",
            message: "Invalid Login",
          },
        ],
      };
    }

    req.session!.userId = user.id;

    return { user };
  }
}
