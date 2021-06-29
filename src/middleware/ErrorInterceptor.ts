import { MiddlewareFn } from "type-graphql";
import { logger } from "../utils/logger";

export const ErrorInterceptor: MiddlewareFn<any> = async ({ context, info }, next) => {
    try {
      return await next();
    } catch (err) {
      // write error to file log
      logger.log('error', "Middle ware ErrorInterceptor Error: ", err);
      logger.log('error', "Middle ware ErrorInterceptor info: ", info);
      logger.log('error', "Middle ware ErrorInterceptor context: ", context);
      // rethrow the error
      throw err;
    }
  };