import BaseSchema from '@ioc:Adonis/Lucid/Schema'

export default class extends BaseSchema {
  protected tableName = 'users'

  public async up () {
    this.schema.alterTable(this.tableName, (table) => {
      table.string("nickname").notNullable().unique();
      table.string("first_name").notNullable();
      table.string("last_name").notNullable();
      table.enum('status', ['active', 'offline', 'dnd']).notNullable().defaultTo('offline')
    })
  }

  public async down () {
    this.schema.alterTable(this.tableName, (table) => {
      table.dropColumn('nickname')
      table.dropColumn('first_name')
      table.dropColumn('last_name')
      table.dropColumn('status')
    })
  }
}
