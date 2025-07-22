// models/Room.ts
import {
  Table,
  Column,
  Model,
  PrimaryKey,
  AutoIncrement,
  DataType,
  AllowNull,
} from "sequelize-typescript";

@Table
export class Room extends Model {
  @PrimaryKey
  @AutoIncrement
  @Column(DataType.BIGINT)
  declare id: number;

  @AllowNull(true)
  @Column(DataType.STRING)
  match_id?: string;

  @Column(DataType.STRING)
  userA!: string;

  @AllowNull(true)
  @Column(DataType.STRING)
  userB?: string;
}
