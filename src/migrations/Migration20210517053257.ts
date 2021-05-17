import { Migration } from '@mikro-orm/migrations';

export class Migration20210517053257 extends Migration {

  async up(): Promise<void> {
    this.addSql('alter table "user" rename column "first_name" to "asdf";');
  }

}
