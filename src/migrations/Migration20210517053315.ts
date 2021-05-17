import { Migration } from '@mikro-orm/migrations';

export class Migration20210517053315 extends Migration {

  async up(): Promise<void> {
    this.addSql('alter table "user" rename column "asdf" to "first_name";');
  }

}
