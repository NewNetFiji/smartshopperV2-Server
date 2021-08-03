import {MigrationInterface, QueryRunner} from "typeorm";

export class Initial1625861330693 implements MigrationInterface {
    name = 'Initial1625861330693'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "orderdetail" ("id" SERIAL NOT NULL, "qty" integer NOT NULL, "price" integer NOT NULL DEFAULT '0', "productId" integer NOT NULL, "orderId" integer NOT NULL, CONSTRAINT "PK_5502309b1a989428ac47eb9f6ad" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TYPE "order_status_enum" AS ENUM('New', 'Processing', 'Rejected', 'Delivery', 'Review', 'Completed', 'Deleted')`);
        await queryRunner.query(`CREATE TABLE "order" ("id" SERIAL NOT NULL, "customerId" integer NOT NULL, "creatorId" integer, "updaterId" integer, "vendorId" integer NOT NULL, "status" "order_status_enum" NOT NULL DEFAULT 'New', "deliveryAddress" character varying, "deliveryDate" TIMESTAMP, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_1031171c13130102495201e3e20" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TYPE "vendor_status_enum" AS ENUM('New', 'Active', 'In-Active', 'Suspended', 'Deleted')`);
        await queryRunner.query(`CREATE TYPE "vendor_vendortype_enum" AS ENUM('New', 'Admin', 'Display', 'Trader', 'Public')`);
        await queryRunner.query(`CREATE TABLE "vendor" ("id" SERIAL NOT NULL, "name" character varying NOT NULL, "address" character varying, "tin" character varying, "image" character varying, "status" "vendor_status_enum" NOT NULL DEFAULT 'New', "vendorType" "vendor_vendortype_enum" NOT NULL DEFAULT 'New', "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "UQ_f61018bdc439c6d1a941261b671" UNIQUE ("name"), CONSTRAINT "PK_931a23f6231a57604f5a0e32780" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TYPE "user_roles_enum" AS ENUM('General', 'Admin', 'Ghost', 'Supervisor', 'Data Entry')`);
        await queryRunner.query(`CREATE TYPE "user_status_enum" AS ENUM('New', 'Active', 'In-Active', 'Suspended', 'Deleted')`);
        await queryRunner.query(`CREATE TABLE "user" ("id" SERIAL NOT NULL, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "email" character varying NOT NULL, "password" character varying NOT NULL, "firstName" character varying, "lastName" character varying, "roles" "user_roles_enum" array NOT NULL DEFAULT '{General}', "status" "user_status_enum" NOT NULL DEFAULT 'New', "vendorId" integer NOT NULL, CONSTRAINT "UQ_e12875dfb3b1d92d7d7c5377e22" UNIQUE ("email"), CONSTRAINT "PK_cace4a159ff9f2512dd42373760" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "upboat" ("value" boolean NOT NULL, "userId" integer NOT NULL, "productId" integer NOT NULL, CONSTRAINT "PK_21505dd1aa44e1b53cfe9177d19" PRIMARY KEY ("userId", "productId"))`);
        await queryRunner.query(`CREATE TYPE "product_status_enum" AS ENUM('New', 'Active', 'In-Active', 'Suspended', 'Deleted')`);
        await queryRunner.query(`CREATE TABLE "product" ("id" SERIAL NOT NULL, "title" character varying NOT NULL, "points" integer NOT NULL DEFAULT '0', "downPoints" integer NOT NULL DEFAULT '0', "description" character varying, "productAvailableTo" TIMESTAMP, "productAvailableFrom" TIMESTAMP, "basePrice" numeric NOT NULL DEFAULT '0', "barcode" character varying, "packSize" character varying, "discount" numeric, "category" character varying, "status" "product_status_enum" NOT NULL DEFAULT 'New', "manufacturer" character varying, "tags" character varying, "vendorId" integer NOT NULL, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_bebc9158e480b949565b4dc7a82" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "image" ("id" SERIAL NOT NULL, "url" character varying NOT NULL, "productId" integer NOT NULL, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_d6db1ab4ee9ad9dbe86c64e4cc3" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TABLE "orderdetail" ADD CONSTRAINT "FK_c2354396f8361da558b647ed342" FOREIGN KEY ("orderId") REFERENCES "order"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "order" ADD CONSTRAINT "FK_124456e637cca7a415897dce659" FOREIGN KEY ("customerId") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "order" ADD CONSTRAINT "FK_b4a453bc5f19e415c3e62fa8122" FOREIGN KEY ("creatorId") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "order" ADD CONSTRAINT "FK_f96e356d0f53bc1d989d3d433ac" FOREIGN KEY ("updaterId") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "order" ADD CONSTRAINT "FK_ac1293b8024ff05e963d82df453" FOREIGN KEY ("vendorId") REFERENCES "vendor"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "user" ADD CONSTRAINT "FK_83a9ac1c3c2e4bce5d502849922" FOREIGN KEY ("vendorId") REFERENCES "vendor"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "upboat" ADD CONSTRAINT "FK_fdfca28ff2e8b7b3c474a055067" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "upboat" ADD CONSTRAINT "FK_dde9044b0839df9f63391be93e6" FOREIGN KEY ("productId") REFERENCES "product"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "product" ADD CONSTRAINT "FK_921582066aa70b502e78ea92012" FOREIGN KEY ("vendorId") REFERENCES "vendor"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "image" ADD CONSTRAINT "FK_c6eb61588205e25a848ba6105cd" FOREIGN KEY ("productId") REFERENCES "product"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "image" DROP CONSTRAINT "FK_c6eb61588205e25a848ba6105cd"`);
        await queryRunner.query(`ALTER TABLE "product" DROP CONSTRAINT "FK_921582066aa70b502e78ea92012"`);
        await queryRunner.query(`ALTER TABLE "upboat" DROP CONSTRAINT "FK_dde9044b0839df9f63391be93e6"`);
        await queryRunner.query(`ALTER TABLE "upboat" DROP CONSTRAINT "FK_fdfca28ff2e8b7b3c474a055067"`);
        await queryRunner.query(`ALTER TABLE "user" DROP CONSTRAINT "FK_83a9ac1c3c2e4bce5d502849922"`);
        await queryRunner.query(`ALTER TABLE "order" DROP CONSTRAINT "FK_ac1293b8024ff05e963d82df453"`);
        await queryRunner.query(`ALTER TABLE "order" DROP CONSTRAINT "FK_f96e356d0f53bc1d989d3d433ac"`);
        await queryRunner.query(`ALTER TABLE "order" DROP CONSTRAINT "FK_b4a453bc5f19e415c3e62fa8122"`);
        await queryRunner.query(`ALTER TABLE "order" DROP CONSTRAINT "FK_124456e637cca7a415897dce659"`);
        await queryRunner.query(`ALTER TABLE "orderdetail" DROP CONSTRAINT "FK_c2354396f8361da558b647ed342"`);
        await queryRunner.query(`DROP TABLE "image"`);
        await queryRunner.query(`DROP TABLE "product"`);
        await queryRunner.query(`DROP TYPE "product_status_enum"`);
        await queryRunner.query(`DROP TABLE "upboat"`);
        await queryRunner.query(`DROP TABLE "user"`);
        await queryRunner.query(`DROP TYPE "user_status_enum"`);
        await queryRunner.query(`DROP TYPE "user_roles_enum"`);
        await queryRunner.query(`DROP TABLE "vendor"`);
        await queryRunner.query(`DROP TYPE "vendor_vendortype_enum"`);
        await queryRunner.query(`DROP TYPE "vendor_status_enum"`);
        await queryRunner.query(`DROP TABLE "order"`);
        await queryRunner.query(`DROP TYPE "order_status_enum"`);
        await queryRunner.query(`DROP TABLE "orderdetail"`);
    }

}
