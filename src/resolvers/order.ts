import {
  Arg,
  Authorized,
  Ctx,
  Field,
  FieldResolver,
  Float,
  InputType,
  Int,
  Mutation,
  ObjectType,
  Query,
  Resolver,
  Root,
  UseMiddleware,
} from "type-graphql";
import { getConnection, getRepository } from "typeorm";
import { Order, OrderStatus } from "../entities/Order";
import { UserRole } from "../entities/User";
import { isAuth } from "../middleware/isAuth";
import { MyContext } from "../types";
import { FieldError } from "./FieldError";
import _ from "lodash";

@InputType()
class OrderDetailInput {
  @Field(() => Int, { nullable: true })
  qty?: number;

  @Field({ nullable: true })
  price?: number;

  @Field(() => Int, { nullable: true })
  productId?: number;

  @Field(() => Int, { nullable: true })
  vendorId?: number;
}

@InputType()
class OrderHeaderInput {
  @Field(() => Int)
  id: number;

  @Field(() => String, { nullable: true })
  deliveryDate: Date;

  @Field({ nullable: true })
  deliveryAddress: string;

  @Field({ nullable: true })
  status: OrderStatus;
}


@ObjectType()
class PaginatedOrders {
  @Field()
  hasMore: boolean;

  @Field(() => [Order])
  orders: Order[];
}

@ObjectType()
class OrderResponse {
  @Field(() => [FieldError], { nullable: true })
  errors?: FieldError[];

  @Field(() => [Order], { nullable: true })
  order?: Order[];
}

@Resolver(Order)
export class OrderResolver {


    @FieldResolver(() => Float)
    @UseMiddleware(isAuth)
    async orderTotal(
      @Root() order: Order      
    ) {         
        // note that price stored in the table is in cents
        let total ;
        try {
            total =  await getConnection().query(
              `
                select sum(o.price*o.qty/100) 
                from orderdetail o 
                    where "orderId" = $1
        
              `,
              [order.id]
            );
          } catch {
            return 0            
          }
          
      return total[0].sum ;
    }  

  @Query(() => PaginatedOrders, { nullable: true })
  @Authorized(UserRole.ADMIN, UserRole.DATA, UserRole.SUPER)
  async getVendorOrders(
    @Arg("limit", () => Int) limit: number,
    @Arg("cursor", () => String, { nullable: true }) cursor: string | null,        
    @Arg("vendorId", () => Int, { nullable: true }) vendorId?: number
  ): Promise<PaginatedOrders> {
    const realLimit = Math.min(50, limit);
    const realLimitPlusOne = realLimit + 1;

    let replacements: any[] = [realLimitPlusOne];
    if (vendorId && cursor) {
      replacements.push(new Date(parseInt(cursor)));
      replacements.push(vendorId);
    } else if (cursor) {
      replacements.push(new Date(parseInt(cursor)));
    } else if (vendorId) {
      replacements.push(vendorId);
    }

    const orders = await getConnection().query(
      `
      select o.*,
        jsonb_agg (json_build_object(
            'id', i.id,
            'orderId', i."orderId" ,           
            'productId', i."productId",
            'qty', i.qty,
            'price', i.price
          )) items,
          json_build_object(
            'id', v.id,            
            'name', v.name,
            'tin', v.tin,
            'address', v.address
          ) vendor           
        from "order" o 
        left join vendor v on v.id = o."vendorId"
          left join orderdetail i on i."orderId"  = o.id
        where o.status != 'Deleted' 
        ${cursor ? ` and  o."createdAt" < $2` : ""}
        ${vendorId && cursor ? ` and  o."vendorId" = $3` : ""}
        ${vendorId && !cursor ? ` and  o."vendorId" = $2` : ""}
        group by o.id, v.id
        order by o."createdAt" desc
        limit $1

      `,
      replacements
    );

    return {
      hasMore: orders.length === realLimitPlusOne,
      orders: orders.slice(0, realLimit),
    };

    
  }

  @Query(() => Order, { nullable: true })
  @UseMiddleware(isAuth)
  async order(@Arg("id", () => Int) id: number): Promise<Order | undefined> {
    
    const order = await getConnection().query(
        `
        select o.*,
        jsonb_agg (json_build_object(
            'id', i.id,
            'orderId', i."orderId" ,           
            'productId', i."productId",
            'qty', i.qty,
            'price', i.price
          )) items,
          json_build_object(
            'id', v.id,            
            'name', v.name,
            'tin', v.tin,
            'address', v.address
          ) vendor           
        from "order" o          
          left join vendor v on v.id = o."vendorId"
          left join orderdetail i on i."orderId"  = o.id
          where o.id = $1
          group by o.id, v.id          
          
        `,
        [id]
      );
      
      return order[0]

  }

  @Mutation(() => OrderResponse)
  @UseMiddleware(isAuth)
  async createOrder(
    @Arg("order", () => [OrderDetailInput]) orderList: OrderDetailInput[],
    @Ctx() { req }: MyContext
  ): Promise<OrderResponse> {
    const userId = req.session.userId;

    if (!orderList.length) {
      return {
        errors: [
          {
            field: "order",
            message: "invalid order list provided",
          },
        ],
      };
    }

    const groupedOrder = _.groupBy(orderList, "vendorId");    

    let orders: Order[] = [];
    let failFlag = false;
    for (const [key, list] of Object.entries(groupedOrder)) {
      //for (const line of orderList) {
      const vendorId = parseInt(key);

      //convert the prices to cents
      list.forEach(line=>{
          if (line.price) {
              line.price = line.price*100
            }else {
                line.price=0
            }
        })
      const strList = JSON.stringify(list.map(({ vendorId, ...rest }) => rest));
      
      
      if (orderList) {
        //insert the order header
        const newOrder = await Order.create({
          customerId: userId,
          vendorId: vendorId,
        }).save();

        //insert the order details
        try {
          await getConnection().query(
            `
            INSERT INTO orderdetail ("orderId",  qty, price, "productId")
                SELECT
                    $1,
                    (e->>'qty')::int,
                    (e->>'price')::decimal,                    
                    (e->>'productId')::int                    
                FROM jsonb_array_elements($2) AS t(e)    
      
            `,
            [newOrder.id, strList]
          );
        } catch {
          failFlag = true;
          break;
        }        
        orders.push(newOrder);
        
      }
    }
    if (failFlag) {
      //errors occured! delete all the orders that were created
      orders.map(async (o) => {
        await Order.delete(o.id);
      });
      return {
        errors: [
          {
            field: "order",
            message: "An error occured while creating your order",
          },
        ],
      };
    }
    //all good return all created orders
    return { order: orders };
  }

  @Mutation(() => OrderResponse, { nullable: true })
  @Authorized(UserRole.ADMIN, UserRole.DATA, UserRole.SUPER)
  async ackOrder(
    @Arg("options", () => OrderHeaderInput) options: OrderHeaderInput,
    @Ctx() { req }: MyContext
  ): Promise<OrderResponse> {
    if (!options.id) {
      return {
        errors: [
          {
            field: "order",
            message: "No Order ID provided!",
          },
        ],
      };
    }

    const orderRepository = getRepository(Order);
    const order = await orderRepository.findOne({ id: options.id });
    if (!order) {
      return {
        errors: [
          {
            field: "id",
            message: "A valid order ID must be supplied",
          },
        ],
      };
    }

    order.deliveryDate = options.deliveryDate || order.deliveryDate;
    order.deliveryAddress = options.deliveryAddress || order.deliveryAddress;
    order.status = options.status || order.status;
    order.creatorId = req.session.userId;

    orderRepository.save(order);

    return { order: [order] };
  }

  @Mutation(() => Boolean, { nullable: true })
  @UseMiddleware(isAuth)
  async deleteOrder(@Arg("id") id: number): Promise<Boolean> {
    try {
      await Order.delete(id);
    } catch (err) {
      console.log("Error Deleting Order: ", err.message);
      return false;
    }
    return true;
  }
}
