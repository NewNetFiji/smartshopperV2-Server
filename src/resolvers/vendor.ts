import {
  Arg,
  Field,
  InputType,
  Mutation,
  ObjectType,
  Query,
  Resolver,
  UseMiddleware,
} from "type-graphql";
import { getRepository } from "typeorm";
import { TypeOfVendor, Vendor, VendorStatus } from "../entities/Vendor";
import { isAuth } from "../middleware/isAuth";
import { FieldError } from "./FieldError";

@InputType()
class VendorInput {
  @Field({ nullable: true })
  id?: number;

  @Field({ nullable: true })
  name?: string;

  @Field({ nullable: true })
  address?: string;

  @Field({ nullable: true })
  tin?: string;

  @Field({ nullable: true })
  image?: string;

  @Field({ nullable: true })
  status?: VendorStatus;

  @Field({ nullable: true })
  vendorType?: TypeOfVendor;

  @Field(() => String, { nullable: true })
  createdAt?: Date;

  @Field(() => String, { nullable: true })
  updatedAt?: Date;
}

@ObjectType()
class VendorResponse {
  @Field(() => [FieldError], { nullable: true })
  errors?: FieldError[];

  @Field(() => Vendor, { nullable: true })
  vendor?: Vendor;
}

@Resolver()
export class VendorResolver {
  
  @Query(() => Vendor , { nullable: true })
  async getPublicVendor(): Promise<Vendor | undefined> {
    const vendor = await Vendor.findOne({ vendorType: TypeOfVendor.PUBLIC });
    if (!vendor) {
      return undefined
    }
    return vendor;
  }

  @Mutation(() => VendorResponse)
  @UseMiddleware(isAuth)
  async registerVendor(
    @Arg("options", () => VendorInput) options: VendorInput
  ): Promise<VendorResponse> {
    const vendor = await Vendor.create({
      ...options,
    });
    try {
      await vendor.save();
    } catch (err) {
      if (err.detail.includes("already exists")) {
        return {
          errors: [
            {
              field: "name",
              message: "A vendor with that name already exists",
            },
          ],
        };
      }
      console.error("Error Message: ", err.message);
    }
    return { vendor };
  }

  @Mutation(() => VendorResponse, { nullable: true }) //graphql type
  @UseMiddleware(isAuth)
  async updateVendor(
    @Arg("options", () => VendorInput) options: VendorInput
  ): Promise<VendorResponse> {
    if (!options.id) {
      return {
        errors: [
          {
            field: "id",
            message: "No vendor ID provided!",
          },
        ],
      };
    }

    const vendorRepository = getRepository(Vendor);
    const vendor = await vendorRepository.findOne({ id: options.id });
    if (!vendor) {
      return {
        errors: [
          {
            field: "id",
            message: "A valid vendor ID must be supplied",
          },
        ],
      };
    }

    vendor.name = options.name || vendor.name;
    vendor.address = options.address || vendor.address;
    vendor.tin = options.tin || vendor.tin;
    vendor.image = options.image || vendor.image;
    vendor.status = options.status || vendor.status;
    vendor.vendorType = options.vendorType || vendor.vendorType;

    vendorRepository.save(vendor);

    return { vendor };
  }

  @Mutation(() => Boolean, { nullable: true })
  @UseMiddleware(isAuth)
  async deleteVendor(@Arg("id") id: number): Promise<Boolean> {
    const vendor = await Vendor.findOne(id);
    if (!vendor) {
      return false;
    } else {
      vendor.status = VendorStatus.DELETED;
      await Vendor.save(vendor);
      return true;
    }
  }
}
