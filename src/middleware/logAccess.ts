import { MiddlewareFn } from "type-graphql";
import { MyContext } from "../types";
import {logger} from "../utils/logger"

export const LogAccess: MiddlewareFn<MyContext> = ({ context, info }, next) => {
    const userId: number = context.req.session.userId || 0 ;
    logger.log('info', 'Logging access: %s', `User ID: ${userId} -> ${info.parentType.name}.${info.fieldName}`);    
    return next();
  };