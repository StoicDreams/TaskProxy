// The keys and signatures of Remote Connections, as the Remote Connections Protocol page sets them out: ECDSA on
// P-256 with SHA-256, from the browser's own Web Crypto. A public key is the 65 byte uncompressed point and a
// signature the 64 bytes r || s, both as base64url without padding. What is signed is lines joined with "\n".
const KEY = { name: 'ECDSA', namedCurve: 'P-256' };
const SIGNATURE = { name: 'ECDSA', hash: 'SHA-256' };
const CODE_LETTERS = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
const encoder = new TextEncoder();

export const base64url = {
    encode(bytes) {
        let text = '';
        for (const byte of new Uint8Array(bytes)) text += String.fromCharCode(byte);
        return btoa(text).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
    },
    /** Throws when `text` isn't base64url without padding. */
    decode(text) {
        if (typeof text !== 'string' || !/^[A-Za-z0-9_-]*$/.test(text)) throw new Error('Not base64url.');
        return Uint8Array.from(atob(text.replace(/-/g, '+').replace(/_/g, '/')), char => char.charCodeAt(0));
    },
};

/** SHA-256 of a text's UTF-8, as 64 lowercase hex characters. */
export async function sha256Hex(text) {
    const hash = new Uint8Array(await crypto.subtle.digest('SHA-256', encoder.encode(text)));
    return Array.from(hash, byte => byte.toString(16).padStart(2, '0')).join('');
}

/** Whether `text` has the form of a public key: 65 bytes starting with 4, as 87 base64url characters. */
export function isPublicKey(text) {
    if (typeof text !== 'string' || !/^[A-Za-z0-9_-]{87}$/.test(text)) return false;
    try {
        const bytes = base64url.decode(text);
        return bytes.length === 65 && bytes[0] === 4;
    } catch {
        return false;
    }
}

/**
 * The code people compare across two screens, such as `ABC-DEF`, worked out here from a public key and never taken
 * from the other side: SHA-256 of the 65 key bytes, the first 6 bytes each modulo 32 into the code's letters.
 */
export async function browserCode(publicKey) {
    const hash = new Uint8Array(await crypto.subtle.digest('SHA-256', base64url.decode(publicKey)));
    const letters = Array.from(hash.subarray(0, 6), byte => CODE_LETTERS[byte % 32]).join('');
    return `${letters.substring(0, 3)}-${letters.substring(3)}`;
}

/** A new key pair whose private half can be used by this page but never read. */
export function generateKeys() {
    return crypto.subtle.generateKey(KEY, false, ['sign', 'verify']);
}

/** A key pair's public half in the protocol's form. */
export async function exportPublicKey(keys) {
    return base64url.encode(await crypto.subtle.exportKey('raw', keys.publicKey));
}

/** Signs `lines` with a private key. */
export async function sign(privateKey, lines) {
    return base64url.encode(await crypto.subtle.sign(SIGNATURE, privateKey, encoder.encode(lines.join('\n'))));
}

/** Whether `signature` is `publicKey`'s signature of `lines`. Anything malformed is simply not a signature. */
export async function verify(publicKey, signature, lines) {
    try {
        if (!isPublicKey(publicKey)) return false;
        const bytes = base64url.decode(signature);
        if (bytes.length !== 64) return false;
        const key = await crypto.subtle.importKey('raw', base64url.decode(publicKey), KEY, false, ['verify']);
        return await crypto.subtle.verify(SIGNATURE, key, bytes, encoder.encode(lines.join('\n')));
    } catch {
        return false;
    }
}

/** The lines a browser signs in its offer. */
export async function offerLines(desktopId, time, sdp) {
    return ['taskproxy-remote-offer-v1', `${desktopId}`, `${time}`, await sha256Hex(sdp)];
}

/** The lines a computer signs in its answer. An answer without an SDP has an empty last line. */
export async function answerLines(connectionId, status, offerSdp, answerSdp) {
    return [
        'taskproxy-remote-answer-v1', `${connectionId}`, `${status}`, await sha256Hex(offerSdp),
        typeof answerSdp === 'string' ? await sha256Hex(answerSdp) : '',
    ];
}
