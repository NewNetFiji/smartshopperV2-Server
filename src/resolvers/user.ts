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
import { COOKIE_NAME, FORGET_PASSWORD_PREFIX } from "../constants";
import { sendEmail } from "../utils/sendEmail";
import { v4 } from "uuid";

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
  @Mutation(() => UserResponse)
  async changePassword(
    @Arg("newPassword") newPassword: string,
    @Arg("confirmPassword") confirmPassword: string,
    @Arg("token") token: string,
    @Ctx() { em, redis, req }: MyContext
  ): Promise<UserResponse> {
    if (newPassword != confirmPassword) {
      return {
        errors: [
          {
            field: "confirmPassword",
            message: "Entered Passwords do not match.",
          },
        ],
      };
    }
    if (passwordStrength(newPassword).id < 2) {
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
    const key = FORGET_PASSWORD_PREFIX + token;
    const userId = await redis.get(key);

    if (!userId) {
      return {
        errors: [
          {
            field: "token",
            message: "Token Expired",
          },
        ],
      };
    }

    const user = await em.findOne(User, { id: parseInt(userId) });

    if (!user) {
      return {
        errors: [
          {
            field: "token",
            message: "User no longer Exists",
          },
        ],
      };
    }

    user.password = await argon2id.hash(newPassword);
    await em.persistAndFlush(user);

    await redis.del(key);

    //log in the user after succesful password change
    req.session!.userId = user.id;

    return { user };
  }

  @Mutation(() => Boolean)
  async forgotPassword(
    @Arg("email") email: string,
    @Ctx() { em, redis }: MyContext
  ) {
    const user = await em.findOne(User, { email });
    if (!user) {
      return true;
    }

    const token = v4();

    await redis.set(
      FORGET_PASSWORD_PREFIX + token,
      user.id,
      "ex",
      1000 * 60 * 60 * 24 * 3
    ); //token is valid for 3 days

    await sendEmail(
      email,
      "SmartShopperFj: Password Reset",
      `Click the link below to reset your password: <br/><br/>` +
        `<a href="http://localhost:3000/change-password/${token}">Reset Password</a>` +
        `<br/><br/>Note that this is a one time use token, and that this token will expire after 72hrs if not used. ` +
        `<br/>Regards, <br/>Admin@SmartShopperFj`
    );
    return true;
  }

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
      if (err.detail.includes("already exists")) {
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

  @Mutation(() => Boolean)
  logout(@Ctx() { req, res }: MyContext) {
    return new Promise((resolve) =>
      req.session.destroy((err: any) => {
        res.clearCookie(COOKIE_NAME);
        if (err) {
          console.log(err);
          resolve(false);
          return;
        }
        resolve(true);
      })
    );
  }
}
