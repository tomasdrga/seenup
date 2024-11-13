import { DateTime } from "luxon";
import { BaseModel, column, HasMany, hasMany, belongsTo, BelongsTo, manyToMany, ManyToMany } from "@ioc:Adonis/Lucid/Orm";
import Message from "App/Models/Message";
import User from "App/Models/User";

export default class Channel extends BaseModel {
  @column({ isPrimary: true })
  public id: number;

  @column()
  public name: string;

  @column()
  public adminId: number | null

  @column()
  public isPrivate: boolean

  @column.dateTime({ autoCreate: true })
  public createdAt: DateTime;

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  public updatedAt: DateTime;

  @belongsTo(() => User, {
    foreignKey: 'adminId',
  })
  public admin: BelongsTo<typeof User>

  @hasMany(() => Message, {
    foreignKey: "channelId",
  })
  public messages: HasMany<typeof Message>;

  @manyToMany(() => User, {
    pivotTable: 'channel_users',
    pivotForeignKey: 'channel_id',
    pivotRelatedForeignKey: 'user_id',
    pivotTimestamps: true,
  })
  public users: ManyToMany<typeof User>
}