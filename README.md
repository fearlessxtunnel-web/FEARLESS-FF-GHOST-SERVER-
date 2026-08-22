# FEARLESS Key Server

Generate -> store in Vercel Redis/KV -> validate -> expire after 39 minutes.

## Required Vercel environment variables
The connected database should provide these automatically:
- KV_REST_API_URL
- KV_REST_API_TOKEN

Do not put their values in source code or send them to anyone.

## Files
- public/index.html
- api/generate.js
- api/validate.js
- package.json
- vercel.json

## Key format
GST-XXXXXX-XXXXXX-XXXXXX

Important: this backend does not automatically change an Android app's native `validateKeyNative()` method. The Android app must be programmed to call `/api/validate` (or your existing authentication protocol) for these server-generated keys to be accepted.
