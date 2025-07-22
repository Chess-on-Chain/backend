import { Router } from "express";
import { Room } from "../models/Room";
import { User } from "../models/User";
import { auth } from "../middlewares/auth";
import { randomBytes, randomUUID } from "node:crypto";
import { getActor } from "../helpers/icp";
import { Principal } from "@dfinity/principal";

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

  const openRoom = await Room.findOne({ where: { userB: null } });
  if (openRoom) {
    await openRoom.update({ userB: user.id });

    const actor = await getActor();
    const userAPubkey = Buffer.from(openRoom.userA, "hex").toBase64();
    const userBPubkey = Buffer.from(user.id, "hex").toBase64();

    const expired = Math.floor(Date.now() / 1000) + 300;

    // TODO: simpan signature yang valid pada saat masuk room dan oper signature
    const match = await actor.add_match(
      {
        pubkey: userAPubkey,
        signature: randomBytes(12).toBase64(), // belum ada cek signature jadi random saja
        expired,
      },
      {
        pubkey: userBPubkey,
        signature: randomBytes(12).toBase64(), // belum ada cek signature jadi random saja
        expired,
      },
      true
    );

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
