import { Migration } from '@mikro-orm/migrations';

export class Migration20210517052705 extends Migration {

  async up(): Promise<void> {
    this.addSql('alter table "user" rename column "username" to "email";');


    this.addSql('alter table "user" add column "first_name" text null, add column "last_name" text null;');

    this.addSql('alter table "user" drop constraint "user_username_unique";');

    this.addSql('alter table "user" add constraint "user_email_unique" unique ("email");');
  }

}
