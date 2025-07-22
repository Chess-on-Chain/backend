import { Sequelize } from "sequelize-typescript";
import { User } from "./User";
import { Room } from "./Room";
import { Token } from "./Token";
import { Unique } from "./Unique";

export const sequelize = new Sequelize(process.env.DATABASE_URL as string, {
  models: [User, Room, Token, Unique],
  logging: false,
});

sequelize.sync();
