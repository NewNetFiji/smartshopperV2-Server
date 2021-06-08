import {
  Arg,
  Field,
  InputType,
  Int,
  Mutation,
  ObjectType,
  Query,
  Resolver,
  UseMiddleware,
} from "type-graphql";
import { getRepository } from "typeorm";
import { Image } from "../entities/Image";
import { Product } from "../entities/Product";
import { isAuth } from "../middleware/isAuth";
import { FieldError } from "./FieldError";

@InputType()
class ImageInput {
  @Field()  
  id!: number;

  @Field()  
  url!: string;

  @Field()  
  productId?: number;
  
  @Field(() => String)
  createdAt: Date;

  @Field(() => String)
  updatedAt: Date;
}

@ObjectType()
class ImageResponse {
  @Field(() => [FieldError], { nullable: true })
  errors?: FieldError[];

  @Field(() => Image, { nullable: true })
  image?: Image;
}

@Resolver()
export class ImageResolver {
  @Query(() => Image, { nullable: true })
  async image(
    @Arg("id", () => Int) id: number    
  ): Promise<Image | undefined> {
    return await Image.findOne({ id:  id});    
  }


  @Query(() => [Image] , { nullable: true })
  async images(
    @Arg("productId", () => Int) productId: number    
  ): Promise<Image[] | undefined> {
    return await Image.find({ productId:  productId});    
  }

  @Mutation(() => ImageResponse)
  @UseMiddleware(isAuth)
  async createImage(
    @Arg("options", () => ImageInput) options: ImageInput
  ): Promise<ImageResponse> {
    const image = await Image.create({
      ...options,
    }).save();    
      
    return { image };
  }

  @Mutation(() => ImageResponse, { nullable: true }) //graphql type
  @UseMiddleware(isAuth)
  async updateImage(
    @Arg("options", () => ImageInput) options: ImageInput
  ): Promise<ImageResponse> {
    
    if (!Product.findOne({id: options.id})) {
      return {
        errors: [
          {
            field: "id",
            message: "Invalid Image ID!",
          },
        ],
      };
    }

    const imageRepository = getRepository(Image);
    const image = await imageRepository.findOne({ id: options.id });
    if (!image) {
      return {
        errors: [
          {
            field: "id",
            message: "A valid Image ID must be supplied",
          },
        ],
      };
    }

    image.url = options.url || image.url;
    image.productId = options.productId || image.productId;
    
    imageRepository.save(image);

    return { image: image };
  }

  @Mutation(() => Boolean, { nullable: true })
  @UseMiddleware(isAuth)
  async deleteImage(@Arg("id") id: number): Promise<Boolean> {
    try{
      Image.delete({id: id})
    }catch(err){
      console.log(err.message)
      return false
    }
    return true
  }
}
