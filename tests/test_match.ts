import { Ed25519KeyIdentity } from "@dfinity/identity";
import { Principal } from "@dfinity/principal";
import axios from "axios";

// SISI CLIENT
async function client_side() {
  const data = {
    purpose: "login",
    expired: Math.floor(Date.now() / 1000) + 30,
  };
  const identity = await Ed25519KeyIdentity.generate();
  const data_json = JSON.stringify(data);
  const data_buffer = Buffer.from(data_json);
  //   const data_hex = data_buffer.toHex();

  const signature = await identity.sign(data_buffer.buffer);
  const signature_hex = Buffer.from(signature).toHex();

  const pubkey_der = identity.getPublicKey().toDer();
  const pubkey_hex = Buffer.from(pubkey_der).toHex();

  return {
    data: data,
    signature: signature_hex,
    pubkey: pubkey_hex,
  };
}

async function generate() {
  const { data, signature, pubkey } = await client_side();
  const principal = Principal.selfAuthenticating(Buffer.from(pubkey, "hex"));
  console.log(principal.toText());
  const res = await axios.post("http://127.0.0.1:3000/users/login", {
    expired: data.expired,
    signature,
    pubkey,
  });
  const token = res.data.token;
  const mantap = await axios.post(
    "http://127.0.0.1:3000/rooms",
    {},
    {
      headers: {
        Authorization: `Token ${token}`,
      },
    }
  );
  console.log(mantap);
}

await generate();
await generate();
