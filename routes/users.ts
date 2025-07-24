import { Ed25519PublicKey } from "@dfinity/agent";
import { createHash, randomUUID } from "node:crypto";
import { Ed25519KeyIdentity } from "@dfinity/identity";
import { Router } from "express";
import { User } from "../models/User";
import { auth } from "../middlewares/auth";
import { Token } from "../models/Token";
import { Principal } from "@dfinity/principal";
import * as sigVerifier from "@dfinity/standalone-sig-verifier-web";
import { getActor, getAgent } from "../helpers/icp";

const router = Router();

router.get("/me", auth, async (req, res) => {
  const user = await User.findByPk(req.userId);
  if (!user)
    return res.status(401).json({ status: "bad", detail: "unauthorized" });
  res.json({ status: "ok", data: user });
});

router.get("/:id", async (req, res) => {
  const user = await User.findByPk(req.params.id);
  if (!user)
    return res.status(404).json({ status: "bad", detail: "not found" });
  res.json({ status: "ok", data: user });
});

router.post("/login", async (req, res) => {
  const { token: loginToken } = req.body;

  const tokenHashed = createHash("sha1")
    .update(Buffer.from(loginToken, "hex"))
    .digest("hex");

  const actor = await getActor();
  let id: any = await actor.get_login(tokenHashed);

  if (id.length == 0) {
    return res
      .status(400)
      .json({ status: "bad", detail: "login token not found" });
  }

  id = id[0];

  let user = await User.findByPk(id);
  if (!user) {
    try {
      user = await User.create({
        id,
      });
    } catch (e: any) {
      if (e.name === "SequelizeUniqueConstraintError") {
        return res.status(400).json({ status: "bad", detail: "id exists" });
      }
      return res.status(400).json({ status: "bad", detail: "field not valid" });
    }
  }

  // Buat token baru
  const token = randomUUID();
  await Token.create({ token, user: id });

  return res.status(200).json({ status: "ok", token });
});

router.patch("/:id", auth, async (req, res) => {
  if (req.params.id !== req.userId) {
    return res.status(403).json({ status: "bad", detail: "not yours" });
  }

  const user = await User.findByPk(req.params.id);
  if (!user)
    return res.status(404).json({ status: "bad", detail: "not found" });

  await user.update(req.body);
  res.status(204).send();
});

export default router;
