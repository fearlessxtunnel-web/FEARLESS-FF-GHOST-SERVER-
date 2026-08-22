const { Redis } = require("@upstash/redis");
const crypto = require("crypto");

module.exports = async function handler(req, res) {
  // Only allow POST
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");

    return res.status(405).json({
      ok: false,
      error: "Method not allowed"
    });
  }

  try {
    // Read Redis credentials from Vercel
    const url =
      process.env.KV_REST_API_URL ||
      process.env.UPSTASH_REDIS_REST_URL;

    const token =
      process.env.KV_REST_API_TOKEN ||
      process.env.UPSTASH_REDIS_REST_TOKEN;

    if (!url || !token) {
      console.error("Redis environment variables are missing");

      return res.status(500).json({
        ok: false,
        error: "Redis environment variables are missing"
      });
    }

    const redis = new Redis({
      url,
      token
    });

    // Generate exactly 4 hexadecimal characters
    const part = () =>
      crypto
        .randomBytes(2)
        .toString("hex")
        .toUpperCase();

    // GST-XXXX-XXXX-XXXX
    const key =
      `GST-${part()}-${part()}-${part()}`;

    // 39 minutes
    const ttl = 39 * 60;

    const now = Date.now();

    const license = {
      key: key,
      createdAt: now,
      expiresAt: now + ttl * 1000,
      active: true
    };

    // Store license with automatic expiration
    await redis.set(
      `license:${key}`,
      JSON.stringify(license),
      {
        ex: ttl
      }
    );

    console.log(
      `Generated key: ${key} | TTL: ${ttl}s`
    );

    return res.status(200).json({
      ok: true,
      key: key,
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
