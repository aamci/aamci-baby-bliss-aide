/**
 * Web Push (RFC 8291 aes128gcm + RFC 8292 VAPID) avec WebCrypto uniquement.
 */

const b64urlToBytes = (s: string) =>
  Uint8Array.from(atob(s.replace(/-/g, "+").replace(/_/g, "/").padEnd(Math.ceil(s.length / 4) * 4, "=")), (c) =>
    c.charCodeAt(0)
  );

const bytesToB64url = (b: Uint8Array) =>
  btoa(String.fromCharCode(...b)).replace(/=/g, "").replace(/\+/g, "-").replace(/\//g, "_");

const concat = (...arrs: Uint8Array[]) => {
  const total = arrs.reduce((n, a) => n + a.length, 0);
  const out = new Uint8Array(total);
  let o = 0;
  for (const a of arrs) {
    out.set(a, o);
    o += a.length;
  }
  return out;
};

async function hkdf(salt: Uint8Array, ikm: Uint8Array, info: Uint8Array, length: number) {
  const key = await crypto.subtle.importKey("raw", ikm, "HKDF", false, ["deriveBits"]);
  const bits = await crypto.subtle.deriveBits({ name: "HKDF", hash: "SHA-256", salt, info }, key, length * 8);
  return new Uint8Array(bits);
}

/** Construit le JWT VAPID (ES256) à partir de la clé privée VAPID base64url (32 octets). */
export async function vapidAuthHeader(audience: string, subject: string, publicKey: string, privateKey: string) {
  const d = b64urlToBytes(privateKey);
  const pub = b64urlToBytes(publicKey); // 65 octets non compressés
  const jwk: JsonWebKey = {
    kty: "EC",
    crv: "P-256",
    d: bytesToB64url(d),
    x: bytesToB64url(pub.slice(1, 33)),
    y: bytesToB64url(pub.slice(33, 65)),
    ext: true,
  };
  const key = await crypto.subtle.importKey("jwk", jwk, { name: "ECDSA", namedCurve: "P-256" }, false, ["sign"]);
  const enc = new TextEncoder();
  const header = bytesToB64url(enc.encode(JSON.stringify({ typ: "JWT", alg: "ES256" })));
  const payload = bytesToB64url(
    enc.encode(JSON.stringify({ aud: audience, exp: Math.floor(Date.now() / 1000) + 12 * 3600, sub: subject }))
  );
  const sigBuf = await crypto.subtle.sign({ name: "ECDSA", hash: "SHA-256" }, key, enc.encode(`${header}.${payload}`));
  return `vapid t=${header}.${payload}.${bytesToB64url(new Uint8Array(sigBuf))}, k=${publicKey}`;
}

/** Chiffre le payload selon aes128gcm (RFC 8188/8291). */
export async function encryptPayload(payload: string, p256dh: string, authSecret: string) {
  const clientPub = b64urlToBytes(p256dh);
  const auth = b64urlToBytes(authSecret);

  const localKeys = await crypto.subtle.generateKey({ name: "ECDH", namedCurve: "P-256" }, true, ["deriveBits"]);
  const localPub = new Uint8Array(await crypto.subtle.exportKey("raw", localKeys.publicKey));
  const clientKey = await crypto.subtle.importKey("raw", clientPub, { name: "ECDH", namedCurve: "P-256" }, false, []);
  const sharedBits = await crypto.subtle.deriveBits({ name: "ECDH", public: clientKey }, localKeys.privateKey, 256);
  const shared = new Uint8Array(sharedBits);

  const enc = new TextEncoder();
  const prkInfo = concat(enc.encode("WebPush: info\0"), clientPub, localPub);
  const ikm = await hkdf(auth, shared, prkInfo, 32);

  const salt = crypto.getRandomValues(new Uint8Array(16));
  const cek = await hkdf(salt, ikm, enc.encode("Content-Encoding: aes128gcm\0"), 16);
  const nonce = await hkdf(salt, ikm, enc.encode("Content-Encoding: nonce\0"), 12);

  const aesKey = await crypto.subtle.importKey("raw", cek, "AES-GCM", false, ["encrypt"]);
  const record = concat(enc.encode(payload), new Uint8Array([0x02])); // délimiteur de dernier enregistrement
  const cipher = new Uint8Array(
    await crypto.subtle.encrypt({ name: "AES-GCM", iv: nonce, tagLength: 128 }, aesKey, record)
  );

  const rs = new Uint8Array(4);
  new DataView(rs.buffer).setUint32(0, 4096);
  return concat(salt, rs, new Uint8Array([localPub.length]), localPub, cipher);
}

export async function sendWebPush(
  sub: { endpoint: string; p256dh: string; auth: string },
  payload: string,
  vapid: { publicKey: string; privateKey: string; subject: string }
) {
  const url = new URL(sub.endpoint);
  const authHeader = await vapidAuthHeader(`${url.protocol}//${url.host}`, vapid.subject, vapid.publicKey, vapid.privateKey);
  const body = await encryptPayload(payload, sub.p256dh, sub.auth);
  return fetch(sub.endpoint, {
    method: "POST",
    headers: {
      Authorization: authHeader,
      "Content-Encoding": "aes128gcm",
      "Content-Type": "application/octet-stream",
      TTL: "86400",
      Urgency: "normal",
    },
    body,
  });
}
