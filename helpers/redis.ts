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

export async function lock(
  key: string,
  ttlSeconds: number
): Promise<string | null> {
  const lockKey = `lock:${key}`;
  const redis = await getSingletonClient();

  const value = crypto.randomUUID(); // nilai unik untuk verifikasi release

  const luaScript = `
    if redis.call("set", KEYS[1], ARGV[1], "NX", "EX", ARGV[2]) then
      return ARGV[1]
    else
      return nil
    end
  `;

  const result = await redis.eval(luaScript, {
    keys: [lockKey],
    arguments: [value, ttlSeconds.toString()],
  });

  return result as string | null;
}

export async function release(key: string, value: string): Promise<void> {
  const redis = await getSingletonClient();
  const lockKey = `lock:${key}`;

  const luaScript = `
    if redis.call("get", KEYS[1]) == ARGV[1] then
      return redis.call("del", KEYS[1])
    else
      return 0
    end
  `;

  await redis.eval(luaScript, {
    keys: [lockKey],
    arguments: [value],
  });
}
