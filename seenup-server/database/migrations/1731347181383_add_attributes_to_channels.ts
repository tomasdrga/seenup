import BaseSchema from '@ioc:Adonis/Lucid/Schema'

export default class extends BaseSchema {
  protected tableName = 'channels'

  public async up() {
    this.schema.alterTable(this.tableName, (table) => {

      table.integer('admin_id').unsigned().nullable()
      table
        .foreign('admin_id')
        .references('id')
        .inTable('users')
        .onDelete('SET NULL')

      table.boolean('is_private').notNullable()
    })
  }

  public async down() {
    this.schema.alterTable(this.tableName, (table) => {
      table.dropForeign(['admin_id'])
      table.dropColumn('admin_id')
      table.dropColumn('is_private')
    })
  }
}
