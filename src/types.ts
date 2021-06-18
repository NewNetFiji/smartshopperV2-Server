import { Request, Response } from "express";
import { Redis } from "ioredis";
import { createUserLoader } from "./utils/createUserLoader";
import { createUpboatLoader } from "./utils/createUpboatLoader";

export type MyContext = {  
  //@ts-ignore
  req: Request & { session: Express.Session };
  redis: Redis;
  res: Response;
  userLoader: ReturnType<typeof createUserLoader>;
  upboatLoader: ReturnType<typeof createUpboatLoader>;
};
