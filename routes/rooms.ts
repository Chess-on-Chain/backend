import { Router } from "express";
import { Room } from "../models/Room";
import { User } from "../models/User";
import { auth } from "../middlewares/auth";
import { randomBytes, randomUUID } from "node:crypto";
import { getActor } from "../helpers/icp";
import { Principal } from "@dfinity/principal";
import { Op } from "sequelize";

const router = Router();

router.get("/:id", async (req, res) => {
  const room = await Room.findByPk(req.params.id);
  if (!room)
    return res.status(404).json({ status: "bad", detail: "not found" });

  const playerA = await User.findByPk(room.userA);
  const playerB = room.userB ? await User.findByPk(room.userB) : null;

  res.json({
    status: "ok",
    data: {
      match_id: room.match_id,
      playerA,
      playerB,
    },
  });
});

router.post("/", auth, async (req, res) => {
  const user = await User.findByPk(req.userId!);
  if (!user)
    return res.status(401).json({ status: "bad", detail: "unauthorized" });

  const tenMinutesAgo = new Date(Date.now() - 10 * 60 * 1000);

  const openRoom = await Room.findOne({
    where: {
      userB: null,
      userA: { [Op.ne]: user.id },
      createdAt: { [Op.gte]: tenMinutesAgo },
    },
  });
  if (openRoom) {
    await openRoom.update({ userB: user.id });

    const actor = await getActor();
    const userA = Principal.fromText(openRoom.userA);
    const userB = Principal.fromText(user.id);

    if (userA.isAnonymous() || userB.isAnonymous()) {
      return res
        .status(403)
        .json({ status: "bad", detail: "Problem with client wallet" });
    }

    console.log(userA.toText(), userB.toText());

    let match;
    try {
      match = await actor.add_match(userA, userB, true);
    } catch (e: any) {
      return res.status(400).json({ status: "bad", detail: e.toString() });
    }

    await openRoom.update({
      match_id: match["id"],
    });

    return res.json({
      status: "ok",
      data: {
        match_id: openRoom.match_id,
        playerA: await User.findByPk(openRoom.userA),
        playerB: user,
      },
    });
  } else {
    // const match_id = randomUUID();

    const userA = Principal.fromText(user.id);

    if (userA.isAnonymous()) {
      return res
        .status(403)
        .json({ status: "bad", detail: "Problem with client wallet" });
    }

    const newRoom = await Room.create({ userA: user.id });
    return res.json({
      status: "ok",
      data: {
        match_id: null,
        playerA: user,
        playerB: null,
      },
    });
  }
});

router.delete("/", auth, async (req, res) => {
  const userId = req.userId!;

  const waitingRoom = await Room.findOne({
    where: { userA: userId, userB: null },
  });

  if (!waitingRoom) {
    return res
      .status(404)
      .json({ status: "bad", detail: "no cancelable room found" });
  }

  await waitingRoom.destroy();

  return res.status(204).send(); // sukses tanpa body
});

export default router;
