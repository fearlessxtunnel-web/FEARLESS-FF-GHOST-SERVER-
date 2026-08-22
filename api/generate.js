const { Redis } = require("@upstash/redis");
const crypto = require("crypto");

module.exports = async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({
      ok: false,
      error: "Method not allowed"
    });
  }

  try {
    const url =
      process.env.KV_REST_API_URL ||
      process.env.UPSTASH_REDIS_REST_URL;

    const token =
      process.env.KV_REST_API_TOKEN ||
      process.env.UPSTASH_REDIS_REST_TOKEN;

    if (!url || !token) {
      return res.status(500).json({
        ok: false,
        error: "Redis environment variables are missing"
      });
    }

    const redis = new Redis({ url, token });

    const part = () =>
      crypto.randomBytes(3).toString("hex").toUpperCase();

    const key = `GST-${part()}-${part()}-${part()}`;

    const ttl = 39 * 60;
    const now = Date.now();

    await redis.set(
      `license:${key}`,
      JSON.stringify({
        key,
        createdAt: now,
        expiresAt: now + ttl * 1000,
        active: true
      }),
      { ex: ttl }
    );

    return res.status(200).json({
      ok: true,
      key,
      expiresIn: ttl
    });

  } catch (error) {
    console.error("GENERATE_ERROR:", error);

    return res.status(500).json({
      ok: false,
      error: "Server failed to generate key"
    });
  }
};
