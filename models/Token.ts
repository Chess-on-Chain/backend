// models/Token.ts
import {
  Table,
  Column,
  Model,
  PrimaryKey,
  AutoIncrement,
  DataType,
  Unique,
} from "sequelize-typescript";

@Table
export class Token extends Model {
  @PrimaryKey
  @AutoIncrement
  @Column(DataType.BIGINT)
  declare id: number;

  @Unique
  @Column(DataType.STRING)
  token!: string;

  @Column(DataType.STRING)
  user!: string;
}
