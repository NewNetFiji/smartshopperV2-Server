import { AuthChecker } from "type-graphql";
import { MyContext } from "../types";

export const authChecker: AuthChecker<MyContext> = ({ context: { req } }, roles) => {
    if (roles.length === 0) {
      // if `@Authorized()`, check only if user exists
      return req.session.userId !== undefined;
    }
    // there are some roles defined now
  
    if (!req.session.userId) {
      // and if no user, restrict access
      return false;
    }
    
    if (req.session.userRole.some(role => roles.includes(role))) {
      // grant access if the roles overlap
      return true;
    }
  
    // no roles matched, restrict access
    return false;
  };