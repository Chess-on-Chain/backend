import express from "express";
import { sequelize } from "./models/database";
import usersRouter from "./routes/users";
import roomsRouter from "./routes/rooms";
import cors from "cors";

const app = express();
app.use(express.json());

app.use(
  cors({
    origin: process.env.CORS_ORIGIN as string,
  })
);

app.use("/users", usersRouter);
app.use("/rooms", roomsRouter);

sequelize.sync().then(() => {
  const port = process.env.PORT || 3000;
  app.listen(port, () => console.log(`Listening on port ${port}`));
});
