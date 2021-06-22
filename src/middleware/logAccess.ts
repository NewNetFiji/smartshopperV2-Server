import { MiddlewareFn } from "type-graphql";
import { MyContext } from "../types";

export const LogAccess: MiddlewareFn<MyContext> = ({ context, info }, next) => {
    const userId: number = context.req.session.userId || 0 ;
    console.log(`Logging access: ${userId} -> ${info.parentType.name}.${info.fieldName}`);
    return next();
  };