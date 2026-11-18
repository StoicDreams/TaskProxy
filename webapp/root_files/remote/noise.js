// The device's side of Task Proxy's encrypted connection, as Noise (noiseprotocol.org), matching the desktop's
// `src-tauri/src/remote/noise.rs` and `protocol.rs` in TaskProxyApp:
//
// - Pairing is Noise_XXpsk3_25519_ChaChaPoly_BLAKE2s, with the QR code's one-time secret as the pre-shared key.
// - Later connections are Noise_IK_25519_ChaChaPoly_BLAKE2s, to the desktop key kept when pairing.
// - Once a handshake finishes, each message is split into frames: a flag byte (0 more follow, 1 last) and up to
//   FRAME_DATA bytes, each frame one Noise transport message.
//
// Checked against the Noise test vectors in tests/remote-noise.spec.mjs.
import { x25519 } from '@noble/curves/ed25519.js';
import { chacha20poly1305 } from '@noble/ciphers/chacha.js';
import { blake2s } from '@noble/hashes/blake2.js';
import { hmac } from '@noble/hashes/hmac.js';

export const PAIR_PATTERN = 'Noise_XXpsk3_25519_ChaChaPoly_BLAKE2s';
export const CONNECT_PATTERN = 'Noise_IK_25519_ChaChaPoly_BLAKE2s';
/** The protocol version, which the desktop's protocol.rs must match. */
export const VERSION = 1;
/** The most a frame carries, as protocol.rs sets it. */
export const FRAME_DATA = 64 * 1024 - 32;
const HASHLEN = 32;
const DHLEN = 32;
const TAGLEN = 16;
const MAX_NONCE = 2n ** 64n - 1n;

const PATTERNS = {
    XXpsk3: { pre: { initiator: [], responder: [] }, messages: [['e'], ['e', 'ee', 's', 'es'], ['s', 'se', 'psk']], psk: true },
    IK: { pre: { initiator: [], responder: ['s'] }, messages: [['e', 'es', 's', 'ss'], ['e', 'ee', 'se']], psk: false },
};

const encoder = new TextEncoder();

function concat(...parts) {
    const out = new Uint8Array(parts.reduce((sum, part) => sum + part.length, 0));
    let at = 0;
    for (const part of parts) {
        out.set(part, at);
        at += part.length;
    }
    return out;
}

function hkdf(chainingKey, input, count) {
    const key = hmac(blake2s, chainingKey, input);
    const outputs = [];
    let previous = new Uint8Array(0);
    for (let n = 1; n <= count; n++) {
        previous = hmac(blake2s, key, concat(previous, Uint8Array.of(n)));
        outputs.push(previous);
    }
    return outputs;
}

function nonce(n) {
    const bytes = new Uint8Array(12);
    new DataView(bytes.buffer).setBigUint64(4, n, true);
    return bytes;
}

/** A key and its message counter: encrypts, or passes text through before there is a key. */
export class CipherState {
    constructor(key = null) {
        this.key = key;
        this.n = 0n;
    }
    hasKey() {
        return this.key !== null;
    }
    encrypt(ad, plaintext) {
        if (!this.key) return plaintext;
        if (this.n >= MAX_NONCE) throw new Error('The secure connection used up its keys.');
        return chacha20poly1305(this.key, nonce(this.n++), ad).encrypt(plaintext);
    }
    decrypt(ad, ciphertext) {
        if (!this.key) return ciphertext;
        if (this.n >= MAX_NONCE) throw new Error('The secure connection used up its keys.');
        const plaintext = chacha20poly1305(this.key, nonce(this.n), ad).decrypt(ciphertext);
        this.n++;
        return plaintext;
    }
}

class SymmetricState {
    constructor(protocolName) {
        const name = encoder.encode(protocolName);
        this.h = name.length <= HASHLEN ? concat(name, new Uint8Array(HASHLEN - name.length)) : blake2s(name);
        this.ck = this.h;
        this.cipher = new CipherState();
    }
    mixKey(input) {
        const [ck, key] = hkdf(this.ck, input, 2);
        this.ck = ck;
        this.cipher = new CipherState(key);
    }
    mixHash(data) {
        this.h = blake2s(concat(this.h, data));
    }
    mixKeyAndHash(input) {
        const [ck, hash, key] = hkdf(this.ck, input, 3);
        this.ck = ck;
        this.mixHash(hash);
        this.cipher = new CipherState(key);
    }
    encryptAndHash(plaintext) {
        const ciphertext = this.cipher.encrypt(this.h, plaintext);
        this.mixHash(ciphertext);
        return ciphertext;
    }
    decryptAndHash(ciphertext) {
        const plaintext = this.cipher.decrypt(this.h, ciphertext);
        this.mixHash(ciphertext);
        return plaintext;
    }
    split() {
        const [one, two] = hkdf(this.ck, new Uint8Array(0), 2);
        return [new CipherState(one), new CipherState(two)];
    }
}

/** A static or ephemeral key pair, as `{ privateKey, publicKey }`. */
export function generateKeys() {
    const privateKey = x25519.utils.randomSecretKey();
    return { privateKey, publicKey: x25519.getPublicKey(privateKey) };
}

export function keysFrom(privateKey) {
    return { privateKey, publicKey: x25519.getPublicKey(privateKey) };
}

/**
 * A handshake in progress. `options`: `pattern` ('XXpsk3' or 'IK'), `initiator`, `prologue` (bytes), `s` (this
 * side's static keys), `rs` (the other side's static public key, for IK's initiator), `psk`, and `e` for a fixed
 * ephemeral key, which only tests use.
 */
export class Handshake {
    constructor({ pattern, initiator, prologue = new Uint8Array(0), s, rs = null, psk = null, e = null }) {
        const shape = PATTERNS[pattern];
        if (!shape) throw new Error(`Unknown handshake ${pattern}.`);
        this.shape = shape;
        this.initiator = initiator;
        this.s = s;
        this.e = e;
        this.rs = rs;
        this.re = null;
        this.psk = psk;
        this.step = 0;
        this.state = new SymmetricState(`Noise_${pattern}_25519_ChaChaPoly_BLAKE2s`);
        this.state.mixHash(prologue);
        for (const side of ['initiator', 'responder']) {
            for (const token of shape.pre[side]) {
                if (token !== 's') continue;
                const ours = (side === 'initiator') === initiator;
                const key = ours ? s.publicKey : rs;
                if (!key) throw new Error('The other side\'s key is needed to start.');
                this.state.mixHash(key);
            }
        }
    }
    get isFinished() {
        return this.step >= this.shape.messages.length;
    }
    /** Whether it's this side's turn to write. */
    get isMyTurn() {
        return (this.step % 2 === 0) === this.initiator;
    }
    dh(ours, theirs) {
        return x25519.getSharedSecret(ours.privateKey, theirs);
    }
    mixDh(token) {
        // Which keys each token pairs, from the initiator's view; the responder uses the other half of each pair.
        const pick = {
            ee: () => this.dh(this.e, this.re),
            es: () => this.initiator ? this.dh(this.e, this.rs) : this.dh(this.s, this.re),
            se: () => this.initiator ? this.dh(this.s, this.re) : this.dh(this.e, this.rs),
            ss: () => this.dh(this.s, this.rs),
        }[token];
        this.state.mixKey(pick());
    }
    /** The next handshake message, carrying `payload`. */
    write(payload = new Uint8Array(0)) {
        if (this.isFinished || !this.isMyTurn) throw new Error('It isn\'t this side\'s turn in the handshake.');
        const parts = [];
        for (const token of this.shape.messages[this.step]) {
            if (token === 'e') {
                this.e ??= generateKeys();
                parts.push(this.e.publicKey);
                this.state.mixHash(this.e.publicKey);
                if (this.shape.psk) this.state.mixKey(this.e.publicKey);
            } else if (token === 's') {
                parts.push(this.state.encryptAndHash(this.s.publicKey));
            } else if (token === 'psk') {
                this.state.mixKeyAndHash(this.psk);
            } else {
                this.mixDh(token);
            }
        }
        parts.push(this.state.encryptAndHash(payload));
        this.step++;
        return concat(...parts);
    }
    /** Reads the other side's handshake message, and returns its payload. Throws when it doesn't decrypt. */
    read(message) {
        if (this.isFinished || this.isMyTurn) throw new Error('It isn\'t the other side\'s turn in the handshake.');
        let at = 0;
        const take = length => {
            if (at + length > message.length) throw new Error('A handshake message was too short.');
            const part = message.subarray(at, at + length);
            at += length;
            return part;
        };
        for (const token of this.shape.messages[this.step]) {
            if (token === 'e') {
                this.re = take(DHLEN).slice();
                this.state.mixHash(this.re);
                if (this.shape.psk) this.state.mixKey(this.re);
            } else if (token === 's') {
                this.rs = this.state.decryptAndHash(take(this.state.cipher.hasKey() ? DHLEN + TAGLEN : DHLEN));
            } else if (token === 'psk') {
                this.state.mixKeyAndHash(this.psk);
            } else {
                this.mixDh(token);
            }
        }
        const payload = this.state.decryptAndHash(message.subarray(at));
        this.step++;
        return payload;
    }
    /** The handshake's hash, the same on both sides once it finishes. */
    get hash() {
        return this.state.h;
    }
    /** The encrypted channel, once the handshake is finished. */
    finish() {
        if (!this.isFinished) throw new Error('The handshake isn\'t finished.');
        const [one, two] = this.state.split();
        return new Channel(this.initiator ? one : two, this.initiator ? two : one, this.rs);
    }
}

/** An encrypted channel. Each message is split into frames, and each frame is one Noise message. */
export class Channel {
    constructor(send, receive, remoteKey) {
        this.sending = send;
        this.receiving = receive;
        this.remoteKey = remoteKey;
        this.partial = [];
    }
    /** Encrypts a message, as the packets to send in order. */
    seal(message) {
        const bytes = typeof message === 'string' ? encoder.encode(message) : message;
        const frames = [];
        if (bytes.length === 0) frames.push(Uint8Array.of(1));
        for (let at = 0; at < bytes.length; at += FRAME_DATA) {
            const end = Math.min(at + FRAME_DATA, bytes.length);
            frames.push(concat(Uint8Array.of(end === bytes.length ? 1 : 0), bytes.subarray(at, end)));
        }
        return frames.map(frame => this.sending.encrypt(new Uint8Array(0), frame));
    }
    /** Decrypts a packet. Returns the message once its last frame arrives, or null until then. */
    open(packet) {
        const frame = this.receiving.decrypt(new Uint8Array(0), packet);
        if (frame.length === 0 || frame[0] > 1) throw new Error('A frame that isn\'t one.');
        this.partial.push(frame.subarray(1));
        if (frame[0] === 0) return null;
        const message = concat(...this.partial);
        this.partial = [];
        return message;
    }
}

/** What both sides bind into a handshake: the protocol version, the desktop's id, and the device's reply mailbox. */
export function prologue(desktopId, reply) {
    return encoder.encode(`TaskProxy remote ${VERSION}\ndesktop ${`${desktopId}`.trim().toUpperCase()}\ndevice ${`${reply}`.trim().toUpperCase()}`);
}

export const hex = {
    encode: bytes => [...bytes].map(byte => byte.toString(16).padStart(2, '0')).join(''),
    decode: text => Uint8Array.from(`${text}`.match(/.{2}/g) || [], pair => parseInt(pair, 16)),
};

export const base64url = {
    encode(bytes) {
        let text = '';
        for (const byte of bytes) text += String.fromCharCode(byte);
        return btoa(text).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
    },
    decode(text) {
        const plain = `${text}`.replace(/-/g, '+').replace(/_/g, '/');
        return Uint8Array.from(atob(plain + '='.repeat((4 - plain.length % 4) % 4)), char => char.charCodeAt(0));
    },
};
