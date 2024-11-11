import BaseSchema from '@ioc:Adonis/Lucid/Schema'

export default class extends BaseSchema {
  protected tableName = 'channel_users'

  public async up() {
    this.schema.alterTable(this.tableName, (table) => {
      table.boolean('is_banned').defaultTo(false)
    })
  }

  public async down() {
    this.schema.alterTable(this.tableName, (table) => {
      table.dropColumn('is_banned')
    })
  }
}
