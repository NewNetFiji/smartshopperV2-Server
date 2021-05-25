import { Migration } from '@mikro-orm/migrations';

export class Migration20210524205554 extends Migration {

  async up(): Promise<void> {
    this.addSql('alter table "product" add column "barcode" varchar(255) null, add column "pack_size" varchar(255) null;');
  }

}
