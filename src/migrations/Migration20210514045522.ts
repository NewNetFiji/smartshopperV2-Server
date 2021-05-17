import { Migration } from '@mikro-orm/migrations';

export class Migration20210514045522 extends Migration {

  async up(): Promise<void> {
    this.addSql('create table "user" ("id" serial primary key, "created_at" timestamptz(0) not null, "updated_at" timestamptz(0) not null, "username" text not null, "password" text not null, "user_role" text not null default \'nonAdmin\', "status" text not null default \'Active\');');
    this.addSql('alter table "user" add constraint "user_username_unique" unique ("username");');
  }

}
