import { __prod__ } from "./constants";
import { Product } from "./entities/Product";
import { MikroORM } from "@mikro-orm/core";
import path from "path";
import { User } from "./entities/User";

export default {
  migrations: {
    path: path.join(__dirname, "./migrations"),
    pattern: /^[\w-]+\d+\.[tj]s$/, // regex pattern for the migration files
  },
  entities: [Product, User],
  dbName: "smartshopperdb",
  type: "postgresql",
  user: "postgres",
  password: "sparhawk32",
  debug: !__prod__,
} as Parameters<typeof MikroORM.init>[0];
