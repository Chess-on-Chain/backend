import { Ed25519PublicKey } from "@dfinity/agent";
import { randomUUID } from "node:crypto";
import { Ed25519KeyIdentity } from "@dfinity/identity";
import { Router } from "express";
import { User } from "../models/User";
import { auth } from "../middlewares/auth";
import { Token } from "../models/Token";
import { Principal } from "@dfinity/principal";

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
  const {
    pubkey,
    signature,
    username,
    first_name,
    last_name,
    country,
    expired,
  } = req.body;

  if (!pubkey || !signature || !expired) {
    return res.status(400).json({
      status: "bad",
      detail: "pubkey and signature and expired required",
    });
  }

  let id = pubkey;
  let isValid = false;
  const pubkeyBuff = Ed25519PublicKey.fromDer(
    Buffer.from(pubkey, "hex").buffer
  ).toRaw();

  try {
    // console.log(pubkeyBuff)
    const dataJSON = {
      purpose: "login",
      expired: parseInt(expired.toString()),
    };

    const dataBuff = Buffer.from(JSON.stringify(dataJSON)).buffer;
    const signatureBuff = Buffer.from(signature, "hex").buffer;

    if (
      Ed25519KeyIdentity.verify(signatureBuff, dataBuff, pubkeyBuff) &&
      dataJSON.expired > Math.floor(Date.now() / 1000)
    ) {
      // id = Principal.selfAuthenticating(pubkey as any).toText();
      isValid = true;
    }
  } catch {
    // pass
  }

  if (!isValid || !id) {
    return res.status(403).json({ status: "bad", detail: "bad signature" });
  }

  const principal = Principal.selfAuthenticating(Buffer.from(pubkeyBuff));

  // Check user existence
  let user = await User.findByPk(id);
  if (!user) {
    try {
      user = await User.create({
        id,
        pricipalId: principal.toText(),
        username: username ?? null,
        first_name: first_name ?? undefined,
        last_name: last_name ?? undefined,
        country: country ?? undefined,
      });
    } catch (e: any) {
      if (e.name === "SequelizeUniqueConstraintError") {
        return res
          .status(400)
          .json({ status: "bad", detail: "username exists" });
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
