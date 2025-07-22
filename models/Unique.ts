import {
  Table,
  Column,
  Model,
  PrimaryKey,
  DataType,
} from "sequelize-typescript";


@Table
export class Unique extends Model {
  @PrimaryKey
  @Column(DataType.TEXT)
  declare id: string;
}
