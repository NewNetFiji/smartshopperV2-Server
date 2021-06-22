import { Request, Response } from "express";
import { Redis } from "ioredis";
import { createUserLoader } from "./dataLoader/createUserLoader";
import { createUpboatLoader } from "./dataLoader/createUpboatLoader";
import { Session, SessionData } from "express-session";
import { UserRole } from "./entities/User";

export type MyContext = {
  req: Request & {
    session: Session &
      Partial<SessionData> & {
        userId: number;
        vendorId: number ;
        userRole: UserRole[] ;
      };
  };
  redis: Redis;
  res: Response;
  userLoader: ReturnType<typeof createUserLoader>;
  upboatLoader: ReturnType<typeof createUpboatLoader>;
};
