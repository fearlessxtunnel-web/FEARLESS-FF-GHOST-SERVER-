const { Redis } = require("@upstash/redis");

module.exports = async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({
      valid: false,
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
        valid: false,
        error: "Redis environment variables are missing"
      });
    }

    const redis = new Redis({ url, token });

    const key = String(req.body?.key || "")
      .trim()
      .toUpperCase();

    if (!/^GST-[A-F0-9]{6}-[A-F0-9]{6}-[A-F0-9]{6}$/.test(key)) {
      return res.status(200).json({
        valid: false,
        error: "Invalid key format"
      });
    }

    const record = await redis.get(`license:${key}`);

    if (!record) {
      return res.status(200).json({
        valid: false,
        error: "Invalid or expired key"
      });
    }

    const expiresAt = Number(record.expiresAt);

    if (
      record.active !== true ||
      !expiresAt ||
      Date.now() >= expiresAt
    ) {
      await redis.del(`license:${key}`);

      return res.status(200).json({
        valid: false,
        error: "Key expired"
      });
    }

    return res.status(200).json({
      valid: true,
      key,
      expiresAt,
      remainingSeconds: Math.floor(
        (expiresAt - Date.now()) / 1000
      )
    });

  } catch (error) {
    console.error("VALIDATE_ERROR:", error);

    return res.status(500).json({
      valid: false,
      error: "Validation service unavailable"
    });
  }
};
