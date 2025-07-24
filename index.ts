import express, { type NextFunction, type Response, type Request } from "express";
import { sequelize } from "./models/database";
import usersRouter from "./routes/users";
import roomsRouter from "./routes/rooms";
import webhookRouter from "./routes/webhook";
import cors from "cors";
import bodyParser from "body-parser";

const app = express();

app.use((req: Request, res: Response, next: NextFunction) => {
  let data = "";
  req.setEncoding("utf8");

  req.on("data", (chunk) => {
    data += chunk;
  });

  req.on("end", () => {
    req.body = data; // req.body sekarang adalah string
    next();
  });

  req.on("error", (err) => {
    next(err);
  });
});

app.use(
  cors({
    origin: (process.env.CORS_ORIGIN as string).split(","),
  })
);

app.use("/users", usersRouter);
app.use("/rooms", roomsRouter);
app.use("/webhook", webhookRouter);

sequelize.sync().then(() => {
  const port = process.env.PORT || 3000;
  app.listen(port, () => console.log(`Listening on port ${port}`));
});
