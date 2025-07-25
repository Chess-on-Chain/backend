import { Router } from "express";
import { getActor } from "../helpers/icp";
import { User } from "../models/User";
import { sequelize } from "../models/database";
import { Unique } from "../models/Unique";
import { lock, release } from "../helpers/redis";

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
  const body = JSON.parse(req.body);
  console.log(body);

  const { purpose }: { purpose: string } = body;

  if (purpose == "match_end") {
    setTimeout(async () => {
      const { match_id }: { match_id: string } = body;

      if (
        await Unique.findOne({
          where: {
            id: match_id,
          },
        })
      ) {
        return;
      }

      try {
        await Unique.create({
          id: match_id,
        });
      } catch (e) {
        return;
      }

      // const transaction = await sequelize.transaction();

      try {
        const actor = await getActor();
        const match = await actor.get_match(match_id);

        const white_player_id = match["white_player"]["id"].toText();
        const black_player_id = match["black_player"]["id"].toText();

        const white_player = await User.findOne({
          where: {
            id: white_player_id,
          },
        });
        const black_player = await User.findOne({
          where: {
            id: black_player_id,
          },
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

          // console.log(white_player_new_elo, white_player_new_elo);
        }

        // await transaction.commit();
      } catch (e) {
        // await transaction.rollback();
        console.log(e);
      } finally {
        // if (lockKey) {
        //   await release(key, lockKey);
        // }
      }
    }, 0);
  }

  res.send("!");
});

export default router;
