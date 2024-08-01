import { createClient } from "redis";

const client = createClient();

client.on("error", (err) => {
  console.error("Redis error:", err);
});

export default client;
