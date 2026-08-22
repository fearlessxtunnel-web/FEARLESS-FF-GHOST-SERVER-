const { Redis } = require('@upstash/redis');
const crypto = require('crypto');

const redis = new Redis({
  url: process.env.KV_REST_API_URL,
  token: process.env.KV_REST_API_TOKEN
});

function makeKey() {
  const part = () => crypto.randomBytes(3).toString('hex').toUpperCase();
  return `GST-${part()}-${part()}-${part()}`;
}

module.exports = async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ok:false,error:'Method not allowed'});
  try {
    const key = makeKey();
    const ttl = 39 * 60;
    const now = Date.now();
    await redis.set(`license:${key}`, JSON.stringify({key,createdAt:now,expiresAt:now + ttl*1000,active:true}), {ex:ttl});
    return res.status(200).json({ok:true,key,expiresIn:ttl});
  } catch (e) {
    console.error(e);
    return res.status(500).json({ok:false,error:'Unable to generate key'});
  }
};
