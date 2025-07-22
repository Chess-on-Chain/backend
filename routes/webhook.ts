import { Router } from "express";
import { getActor } from "../helpers/icp";
import { User } from "../models/User";
import { sequelize } from "../models/database";
import { Unique } from "../models/Unique";
import { getSingletonClient } from "../helpers/redis";
import Redlock from "redlock";

const router = Router();

type Winner = "white" | "black" | "draw";

function calculateElo(
  eloA: number,
  eloB: number,
  winner: Winner,
  k: number = 32
): { newEloA: number; newEloB: number } {
  const expectedA = 1 / (1 + Math.pow(10, (eloB - eloA) / 400));
  const expectedB = 1 / (1 + Math.pow(10, (eloA - eloB) / 400));

  let scoreA: number;
  let scoreB: number;

  if (winner === "white") {
    scoreA = 1;
    scoreB = 0;
  } else if (winner === "black") {
    scoreA = 0;
    scoreB = 1;
  } else {
    scoreA = 0.5;
    scoreB = 0.5;
  }

  const newEloA = eloA + k * (scoreA - expectedA);
  const newEloB = eloB + k * (scoreB - expectedB);

  return {
    newEloA: Math.round(newEloA),
    newEloB: Math.round(newEloB),
  };
}

router.post("/", async (req, res) => {
  const { purpose }: { purpose: string } = req.body;

  if (purpose == "match_end") {
    setTimeout(async () => {
      const { match_id }: { match_id: string } = req.body;

      const redisClient = await getSingletonClient();

      const redlock = new Redlock([redisClient as any], {
        retryCount: 5,
        retryDelay: 200, // ms
      });

      const lock = await redlock.acquire([`lock_match_${match_id}`], 10000);

      const exists =
        (await Unique.count({
          where: {
            id: match_id,
          },
        })) >= 1;

      if (exists) return;

      const transaction = await sequelize.transaction();

      try {
        const actor = await getActor();
        const match = await actor.get_match(match_id);

        const white_player_id = match["white_player"]["id"];
        const black_player_id = match["black_player"]["id"];

        const white_player = await User.findOne({
          where: {
            principalId: white_player_id,
          },
          transaction,
        });
        const black_player = await User.findOne({
          where: {
            principalId: black_player_id,
          },
          transaction,
        });

        if (white_player && black_player) {
          const {
            newEloA: white_player_new_elo,
            newEloB: black_player_new_elo,
          } = calculateElo(
            white_player.score,
            black_player.score,
            match["winner"]
          );

          await white_player.update({
            score: white_player_new_elo,
          });
          await black_player.update({
            score: black_player_new_elo,
          });
        }

        await transaction.commit();

        await Unique.create({
          id: match_id,
        });
      } catch (e) {
        await transaction.rollback();
        console.log(e);
      } finally {
        await redlock.release(lock);
      }
    }, 0);
  }

  res.send("!");
});

export default router;
