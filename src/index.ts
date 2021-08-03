import { ApolloServer } from "apollo-server-express";
import connectRedis from "connect-redis";
import cors from "cors";
import express from "express";
import session from "express-session";
import Redis from "ioredis";
import "reflect-metadata";
import "dotenv-safe/config"
import { buildSchema } from "type-graphql";
import { createConnection } from "typeorm";
import { COOKIE_NAME, __prod__ } from "./constants";
import { createUpboatLoader } from "./dataLoader/createUpboatLoader";
import { createUserLoader } from "./dataLoader/createUserLoader";
import { Image } from "./entities/Image";
import { Order } from "./entities/Order";
import { Orderdetail } from "./entities/Orderdetail";
import { Product } from "./entities/Product";
import { Upboat } from "./entities/Upboat";
import { User } from "./entities/User";
import { Vendor } from "./entities/Vendor";
import { ErrorInterceptor } from "./middleware/ErrorInterceptor";
import { HelloResolver } from "./resolvers/hello";
import { ImageResolver } from "./resolvers/image";
import { OrderResolver } from "./resolvers/order";
import { ProductResolver } from "./resolvers/product";
import { UserResolver } from "./resolvers/user";
import { VendorResolver } from "./resolvers/vendor";
import { authChecker } from "./utils/authChecker";

const main = async () => {  
  const conn = await createConnection({
    type: "postgres",    
    url: process.env.DATABASE_URL,
    logging: true,
    //synchronize: true,
    entities: [Product, User, Vendor, Image, Upboat, Order, Orderdetail],
  });
  await conn.runMigrations();

  const app = express();

  const RedisStore = connectRedis(session);
  const redis = new Redis(process.env.REDIS_URL);

  app.set("trust proxy", 1);
  app.use(
    cors({
      origin: process.env.CORS_ORIGIN,
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
      secret: process.env.SESSION_SECRET,
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
        OrderResolver
      ]
      ,globalMiddlewares: [ErrorInterceptor]
      ,authChecker
      ,validate: false,
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

  app.listen(parseInt(process.env.PORT), () => {
    console.log("Server listening on localhost: ", process.env.PORT);
  });
};

main().catch((err) => {
  console.log(err);
});
