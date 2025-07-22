import { createClient, type RedisClientType } from "redis";

export const getClient = async () => {
  const client = createClient({
    url: process.env.REDIS_URL as string,
  });

  client.on("error", (err) => console.log("Redis Client Error", err));

  await client.connect();
  return client;
};

let _client: any;

export const getSingletonClient = async (): Promise<RedisClientType> => {
  if (!_client) {
    _client = await getClient();
  }

  return _client;
};
