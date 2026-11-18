// Pairing with a desktop and connecting to it (Docs/RemoteAccess.md in TaskProxyApp, 2.2 to 2.4), matching the
// desktop's src-tauri/src/remote/ pairing.rs, connect.rs and protocol.rs.
//
// Both go through api.myfi.ws's mailbox: each message is a kind byte and a Noise message, as base64url. The device
// sends to the desktop's mailbox, and reads the desktop's answers from a reply mailbox it names with a new UUID for
// each attempt. Once connected, messages go straight to the desktop over a WebRTC data channel, each a frame of the
// Noise channel the handshake finished.
import { Handshake, VERSION, base64url, generateKeys, hex, keysFrom, prologue } from './noise.js';

export const KIND = { Pair1: 1, Pair2: 2, Pair3: 3, Paired: 4, Refused: 5, Connect1: 6, Connect2: 7 };
const encoder = new TextEncoder();
const decoder = new TextDecoder();
/** A device pings this often, and the desktop drops one it hasn't heard from for 45 seconds. */
export const PING_MS = 15000;
/** The desktop is gone when nothing has come from it for this long. */
const SILENT_MS = 45000;

/** A refusal from the desktop, with its reason, as opposed to a network failure. */
export class Refused extends Error { }

export function encode(kind, data) {
    const bytes = new Uint8Array(data.length + 1);
    bytes[0] = kind;
    bytes.set(data, 1);
    return base64url.encode(bytes);
}

export function decode(message) {
    const bytes = base64url.decode(message);
    return { kind: bytes[0], data: bytes.subarray(1) };
}

const json = value => encoder.encode(JSON.stringify(value));
const parse = bytes => JSON.parse(decoder.decode(bytes));
const wait = ms => new Promise(resolve => setTimeout(resolve, ms));

/**
 * The QR code's payload from a `#pair=` link: `{v, desktopId, desktopKey, secret, expires, name}`, or null when it
 * isn't one.
 */
export function readPairPayload(text) {
    try {
        const payload = parse(base64url.decode(text));
        if (payload?.v !== 1 || !payload.desktopId || !/^[0-9a-f]{64}$/i.test(payload.desktopKey || '') || !payload.secret) return null;
        return payload;
    } catch {
        return null;
    }
}

/**
 * Waits for the desktop's answer in the reply mailbox. A desktop that is setting up a connection answers within a
 * moment, so the mailbox is read soon after sending, then less often, up to every `interval` ms. A refusal throws
 * `Refused`. Gives up after `timeout` ms.
 */
async function answerFor(api, desktopId, reply, kinds, { interval, timeout, signal }) {
    const until = Date.now() + timeout;
    let delay = Math.min(150, interval);
    while (Date.now() < until) {
        await wait(delay);
        delay = Math.min(delay * 2, interval);
        signal?.throwIfAborted();
        const messages = await api.replies(reply);
        for (const message of messages) {
            if (message.desktopId?.toLowerCase() !== desktopId.toLowerCase()) continue;
            const { kind, data } = decode(message.message);
            if (kind === KIND.Refused) throw new Refused(decoder.decode(data));
            if (kinds.includes(kind)) return { kind, data };
        }
    }
    throw new Error('The desktop didn\'t answer. Check that Task Proxy is open on it, with Remote Access on.');
}

/**
 * Pairs this device with the desktop whose QR code gave `payload`. Returns what to keep: the desktop's id, key and
 * name, this device's id, level and keys. `onStatus` hears each step.
 */
export async function pair(payload, api, { interval = 1000, timeout = 120000, onStatus = () => { }, signal } = {}) {
    if (payload.expires && payload.expires <= Date.now()) {
        throw new Refused('This pairing code has expired. Show a new QR code on the desktop.');
    }
    const keys = generateKeys();
    const reply = crypto.randomUUID();
    const handshake = new Handshake({
        pattern: 'XXpsk3', initiator: true, prologue: prologue(payload.desktopId, reply), s: keys,
        psk: base64url.decode(payload.secret),
    });
    onStatus('Reaching the desktop');
    const { online } = await api.send(payload.desktopId, reply, encode(KIND.Pair1, handshake.write()));
    if (!online) onStatus('Waiting for the desktop. Check that Task Proxy is open on it, with Remote Access on.');
    const second = await answerFor(api, payload.desktopId, reply, [KIND.Pair2], { interval, timeout, signal });
    const desktop = parse(handshake.read(second.data));
    // The desktop keeps the name chosen with the QR code, so this device doesn't name itself.
    await api.send(payload.desktopId, reply, encode(KIND.Pair3, handshake.write(json({}))));
    onStatus('Pairing');
    const done = await answerFor(api, payload.desktopId, reply, [KIND.Paired], { interval, timeout, signal });
    const result = parse(handshake.finish().open(done.data));
    if (!result.ok) throw new Refused('The desktop didn\'t pair this device.');
    if (hex.encode(handshake.rs) !== payload.desktopKey.toLowerCase()) {
        throw new Refused('The desktop that answered isn\'t the one the QR code is for.');
    }
    return {
        desktopId: payload.desktopId,
        desktopKey: payload.desktopKey.toLowerCase(),
        desktopName: result.desktopName || desktop.name || payload.name || 'Desktop',
        deviceId: result.deviceId,
        name: result.name,
        level: result.level,
        days: result.days,
        privateKey: hex.encode(keys.privateKey),
        pairedAt: Date.now(),
    };
}

function gathered(peer, timeout) {
    if (peer.iceGatheringState === 'complete') return Promise.resolve();
    return new Promise(resolve => {
        const done = () => peer.iceGatheringState === 'complete' && resolve();
        peer.addEventListener('icegatheringstatechange', done);
        // Each address is sent at once rather than trickled, so wait for them, but not forever.
        setTimeout(resolve, timeout);
    });
}

function opened(channel, timeout) {
    if (channel.readyState === 'open') return Promise.resolve();
    return new Promise((resolve, reject) => {
        const timer = setTimeout(() => reject(new Error('The desktop didn\'t accept the connection. Check that this device is on the same network or VPN as the desktop.')), timeout);
        channel.addEventListener('open', () => { clearTimeout(timer); resolve(); }, { once: true });
        channel.addEventListener('close', () => { clearTimeout(timer); reject(new Error('The desktop closed the connection.')); }, { once: true });
    });
}

/**
 * Connects to a paired desktop. Returns an open `Connection` that has said hello. `options.createPeer` makes the
 * RTCPeerConnection, so tests can give it their own settings.
 */
export async function connect(pairing, api, { interval = 1000, timeout = 60000, signal, createPeer = () => new RTCPeerConnection({ iceServers: [] }) } = {}) {
    const peer = createPeer();
    try {
        const data = peer.createDataChannel('taskproxy');
        data.binaryType = 'arraybuffer';
        await peer.setLocalDescription(await peer.createOffer());
        await gathered(peer, 5000);
        const reply = crypto.randomUUID();
        const handshake = new Handshake({
            pattern: 'IK', initiator: true, prologue: prologue(pairing.desktopId, reply),
            s: keysFrom(hex.decode(pairing.privateKey)), rs: hex.decode(pairing.desktopKey),
        });
        await api.send(pairing.desktopId, reply, encode(KIND.Connect1, handshake.write(json({ offer: peer.localDescription.sdp }))));
        const second = await answerFor(api, pairing.desktopId, reply, [KIND.Connect2], { interval, timeout, signal });
        const { answer } = parse(handshake.read(second.data));
        await peer.setRemoteDescription({ type: 'answer', sdp: answer });
        await opened(data, 30000);
        const connection = new Connection(peer, data, handshake.finish());
        await connection.hello();
        return connection;
    } catch (error) {
        peer.close();
        throw error;
    }
}

/**
 * An open connection to the desktop: `request(cmd, args)` runs a command, `listen(event, handler)` hears events,
 * and `onClose(handler)` hears why it ended.
 */
export class Connection {
    constructor(peer, data, channel) {
        this.peer = peer;
        this.data = data;
        this.channel = channel;
        this.next = 1;
        this.pending = new Map();
        this.listeners = new Map();
        this.closers = [];
        this.closed = null;
        this.heard = Date.now();
        data.addEventListener('message', event => this.receive(event.data));
        data.addEventListener('close', () => this.close('The desktop closed the connection.'));
        peer.addEventListener('connectionstatechange', () => {
            if (['failed', 'closed', 'disconnected'].includes(peer.connectionState)) this.close('The connection to the desktop was lost.');
        });
        this.timer = setInterval(() => {
            if (Date.now() - this.heard > SILENT_MS) return this.close('The desktop stopped answering.');
            this.send({ ping: Date.now() });
        }, PING_MS);
    }
    send(message) {
        if (this.closed) throw new Error(this.closed);
        for (const packet of this.channel.seal(JSON.stringify(message))) this.data.send(packet);
    }
    receive(packet) {
        this.heard = Date.now();
        let message;
        try {
            const bytes = this.channel.open(new Uint8Array(packet));
            if (!bytes) return;
            message = parse(bytes);
        } catch {
            return this.close('The desktop sent something that couldn\'t be read.');
        }
        if (message.welcome) return this.welcomed?.(message.welcome);
        if ('pong' in message) return;
        if (message.event) {
            for (const handler of this.listeners.get(message.event) || []) {
                try { handler(message.payload); } catch (error) { console.error(error); }
            }
            return;
        }
        const waiting = this.pending.get(message.id);
        if (!waiting) return;
        this.pending.delete(message.id);
        if (message.ok) waiting.resolve(message.value);
        else waiting.reject(message.error);
    }
    /** Says hello with this page's protocol version. Throws when the desktop speaks another. */
    hello() {
        return new Promise((resolve, reject) => {
            const timer = setTimeout(() => reject(new Error('The desktop didn\'t answer.')), 15000);
            this.welcomed = welcome => {
                clearTimeout(timer);
                this.welcomed = null;
                if (welcome.reload) {
                    this.close('This page and Task Proxy on the desktop are different versions.');
                    return reject(new Refused('This page and Task Proxy on the desktop are different versions. Update Task Proxy on the desktop, or reload this page.'));
                }
                resolve(welcome);
            };
            this.send({ hello: { version: VERSION } });
        });
    }
    /** Runs a command on the desktop. Rejects with the desktop's reason, as Tauri's invoke does. */
    request(cmd, args = {}) {
        if (this.closed) return Promise.reject(this.closed);
        const id = this.next++;
        return new Promise((resolve, reject) => {
            this.pending.set(id, { resolve, reject });
            try {
                this.send({ id, cmd, args });
            } catch (error) {
                this.pending.delete(id);
                reject(`${error.message || error}`);
            }
        });
    }
    /** Hears an event's payloads until the returned function is called. */
    listen(event, handler) {
        if (!this.listeners.has(event)) this.listeners.set(event, new Set());
        this.listeners.get(event).add(handler);
        return () => this.listeners.get(event)?.delete(handler);
    }
    onClose(handler) {
        if (this.closed) handler(this.closed);
        else this.closers.push(handler);
    }
    close(reason = 'Disconnected.') {
        if (this.closed) return;
        this.closed = reason;
        clearInterval(this.timer);
        for (const { reject } of this.pending.values()) reject(reason);
        this.pending.clear();
        try { this.data.close(); } catch { }
        try { this.peer.close(); } catch { }
        for (const handler of this.closers) handler(reason);
    }
}
