const { Redis } = require('@upstash/redis');

const redis = new Redis({
  url: process.env.KV_REST_API_URL,
  token: process.env.KV_REST_API_TOKEN
});

module.exports = async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({valid:false,error:'Method not allowed'});
  try {
    const key = String(req.body?.key || '').trim().toUpperCase();
    if (!/^GST-[A-F0-9]{6}-[A-F0-9]{6}-[A-F0-9]{6}$/.test(key)) {
      return res.status(400).json({valid:false,error:'Invalid key format'});
    }
    const raw = await redis.get(`license:${key}`);
    if (!raw) return res.status(200).json({valid:false,error:'Invalid or expired key'});
    const record = typeof raw === 'string' ? JSON.parse(raw) : raw;
    if (record.active !== true || Date.now() >= Number(record.expiresAt)) {
      await redis.del(`license:${key}`);
      return res.status(200).json({valid:false,error:'Key expired'});
    }
    return res.status(200).json({valid:true,key,expiresAt:Number(record.expiresAt),remainingSeconds:Math.max(0,Math.floor((Number(record.expiresAt)-Date.now())/1000))});
  } catch (e) {
    console.error(e);
    return res.status(500).json({valid:false,error:'Validation service unavailable'});
  }
};
