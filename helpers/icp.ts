import { Actor, HttpAgent } from "@dfinity/agent";
import { Ed25519KeyIdentity } from "@dfinity/identity";
import { idlFactory } from "./idlFactory";
import hdkey from "hdkey";
import bip39 from "bip39";

let actor: any = undefined;

export async function getAgent() {
  const seed = process.env.SEED_PHRASE as string;

  const identityFromSeed = async (phrase: string) => {
    const seed = await bip39.mnemonicToSeed(phrase);
    const root = hdkey.fromMasterSeed(seed);
    const addrnode: any = root.derive("m/44'/223'/0'/0/0");

    return Ed25519KeyIdentity.fromSecretKey(addrnode.privateKey);
  };

  const identity = await identityFromSeed(seed);
  // console.log(identity.getPrincipal().toText())
  const agent = await HttpAgent.create({
    identity,
    host: process.env.ICP_HOST as string,
  });

  await agent.fetchRootKey();

  return agent;
}

export async function getActor() {
  if (!actor) {
    const seed = process.env.SEED_PHRASE as string;

    const identityFromSeed = async (phrase: string) => {
      const seed = await bip39.mnemonicToSeed(phrase);
      const root = hdkey.fromMasterSeed(seed);
      const addrnode: any = root.derive("m/44'/223'/0'/0/0");

      return Ed25519KeyIdentity.fromSecretKey(addrnode.privateKey);
    };

    const identity = await identityFromSeed(seed);
    // console.log(identity.getPrincipal().toText())
    const agent = await HttpAgent.create({
      identity,
      host: process.env.ICP_HOST as string,
    });
    await agent.fetchRootKey();

    const _actor: any = Actor.createActor(idlFactory, {
      canisterId: process.env.CANISTER_ID as string,
      agent,
    });

    actor = _actor;
  }

  return actor;
}
