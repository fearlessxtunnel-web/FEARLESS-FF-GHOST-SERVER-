export default function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ valid: false, error: "Method not allowed" });
  }

  const { key } = req.body || {};
  if (!key || typeof key !== "string") {
    return res.status(400).json({ valid: false, error: "Key is required" });
  }

  // Prototype only. Use a database for production.
  const keys = {
    "FG-8KQ4-7PXM-2N6R": {
      expiresAt: "2026-09-22T00:00:00Z",
      active: true
    },
    "FG-M91D-X5Q8-L2TA": {
      expiresAt: "2026-10-01T00:00:00Z",
      active: true
    }
  };

  const record = keys[key];

  if (!record)
    return res.status(200).json({ valid: false, error: "Invalid key" });

  if (!record.active)
    return res.status(200).json({ valid: false, error: "Key revoked" });

  if (Date.now() >= new Date(record.expiresAt).getTime())
    return res.status(200).json({ valid: false, error: "Key expired" });

  return res.status(200).json({
    valid: true,
    expiresAt: record.expiresAt
  });
}
