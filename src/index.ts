import { ApolloServer } from "apollo-server-express";
import connectRedis from "connect-redis";
import cors from "cors";
import express from "express";
import session from "express-session";
import Redis from "ioredis";
import "reflect-metadata";
import { buildSchema } from "type-graphql";
import { createConnection } from "typeorm";
import { Product } from "./entities/Product";
import { User } from "./entities/User";
import { COOKIE_NAME, __prod__ } from "./constants";
import { HelloResolver } from "./resolvers/hello";
import { ProductResolver } from "./resolvers/product";
import { VendorResolver } from "./resolvers/vendor";
import { UserResolver } from "./resolvers/user";
import { Vendor } from "./entities/Vendor";
import { Image } from "./entities/Image";
import { ImageResolver } from "./resolvers/image";
import { Upboat } from "./entities/Upboat";
import { createUserLoader } from "./utils/createUserLoader";
import { createUpboatLoader } from "./utils/createUpboatLoader";

const main = async () => {
  const conn = await createConnection({
    type: "postgres",
    database: "smartshopper2",
    username: "postgres",
    password: "sparhawk32",
    logging: true,
    synchronize: true,
    entities: [Product, User, Vendor, Image, Upboat],
  });

  const app = express();

  const RedisStore = connectRedis(session);
  const redis = new Redis();

  app.use(
    cors({
      origin: "http://localhost:3000",
      credentials: true,
    })
  );

  app.use(
    session({
      name: COOKIE_NAME,
      store: new RedisStore({
        client: redis,
        disableTouch: true,
      }),
      cookie: {
        maxAge: 1000 * 60 * 60 * 24 * 365 * 10, //10 years
        httpOnly: true,
        sameSite: "lax", //csrf
        secure: __prod__, //cookie only works in https
      },
      saveUninitialized: false,
      secret: "pajspdapoutljkdfsfvt34@",
      resave: false,
    })
  );

  const apolloServer = new ApolloServer({
    schema: await buildSchema({
      resolvers: [
        HelloResolver,
        ProductResolver,
        UserResolver,
        VendorResolver,
        ImageResolver,
      ],
      validate: false,
    }),
    context: ({ req, res }) => ({
      req,
      res,
      redis,
      userLoader: createUserLoader(),
      upboatLoader: createUpboatLoader(),
    }),
  });

  apolloServer.applyMiddleware({
    app,
    cors: false,
  });

  app.listen(4000, () => {
    console.log("Server listening on localhost:4000");
  });
};

main().catch((err) => {
  console.log(err);
});
