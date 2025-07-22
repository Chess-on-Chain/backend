// models/User.ts
import { Table, Column, Model, PrimaryKey, DataType, Default, Unique, AllowNull } from 'sequelize-typescript';

@Table
export class User extends Model {
  @PrimaryKey
  @Column(DataType.STRING)
  declare id: string;

  @Column(DataType.STRING)
  @Unique
  principalId!: string;

  @Unique
  @AllowNull(true)
  @Column(DataType.STRING)
  username?: string;

  @Default("Anonymous")
  @Column(DataType.STRING)
  first_name!: string;

  @AllowNull(true)
  @Column(DataType.STRING)
  last_name?: string;

  @AllowNull(true)
  @Column(DataType.STRING)
  country?: string;

  @Default(300)
  @Column(DataType.INTEGER)
  score!: number;
}
