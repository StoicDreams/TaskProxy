// Connecting to a computer, and the connection once it is open, as the Remote Connections Protocol page sets them
// out (.taskproxy/pages in the Api repo, "Remote Connections Protocol").
//
// One signed offer goes to the computer through api.myfi.ws and one signed answer comes back. The answer is only
// believed when the key this browser remembers for the computer signed it. From then on the two talk directly over
// one WebRTC data channel, which WebRTC encrypts: each message is JSON, sent as frames of a flag byte and up to
// 16,383 bytes.
import { answerLines, offerLines, sign, verify } from './crypto.js';

/** The protocol version of the messages on the channel. */
export const VERSION = 2;
/** The most bytes a frame carries after its flag byte. */
export const FRAME_BYTES = 16383;
/** The largest message a browser may send. */
export const MESSAGE_BYTES = 16 * 1024 * 1024;
/** The largest offer the API takes. */
const OFFER_BYTES = 16 * 1024;
/** A browser pings this often, and the computer ends a connection it hasn't heard from in 45 seconds. */
export const PING_MS = 15000;
/** The computer is gone when nothing has come from it for this long. */
const SILENT_MS = 45000;
/** How long address gathering may take before the offer is sent with the addresses found so far. */
const GATHER_MS = 3000;
/** The browser gives up this long after sending the offer if the channel hasn't opened. */
const LIMIT_MS = 30000;
/** The answer is asked for this often. */
const ASK_MS = 1000;
/** Frames wait while this much is still queued on the channel, so a large message never overfills it. */
const QUEUED_BYTES = 1024 * 1024;

const encoder = new TextEncoder();
const decoder = new TextDecoder('utf-8', { fatal: true });

/**
 * Why a connection wasn't made. `kind` is one of:
 * - `off`: the computer isn't on the account, or Remote Connections is off on it;
 * - `busy`: too many requests are already waiting for it;
 * - `no-answer`: it didn't answer in time;
 * - `unsigned`: an answer came that the remembered key didn't sign, which counts as no answer;
 * - `refused`: it refused this browser;
 * - `unreachable`: it answered, but the two networks couldn't reach each other;
 * - `version`: it speaks another version of the protocol;
 * - `failed`: anything else, with the reason as the message.
 */
export class ConnectError extends Error {
    constructor(kind, message = '') {
        super(message || kind);
        this.kind = kind;
    }
}

function wait(ms, signal) {
    return new Promise((resolve, reject) => {
        if (signal?.aborted) return reject(signal.reason);
        const timer = setTimeout(resolve, ms);
        signal?.addEventListener('abort', () => { clearTimeout(timer); reject(signal.reason); }, { once: true });
    });
}

function gathered(peer, timeout) {
    if (peer.iceGatheringState === 'complete') return Promise.resolve();
    return new Promise(resolve => {
        peer.addEventListener('icegatheringstatechange', () => peer.iceGatheringState === 'complete' && resolve());
        // There is no later exchange of addresses, so wait for them, but not for long.
        setTimeout(resolve, timeout);
    });
}

function opened(peer, channel, until) {
    if (channel.readyState === 'open') return Promise.resolve();
    return new Promise((resolve, reject) => {
        const fail = () => { clearTimeout(timer); reject(new ConnectError('unreachable')); };
        const timer = setTimeout(fail, Math.max(0, until - Date.now()));
        channel.addEventListener('open', () => { clearTimeout(timer); resolve(); }, { once: true });
        channel.addEventListener('close', fail, { once: true });
        peer.addEventListener('connectionstatechange', () => peer.connectionState === 'failed' && fail());
    });
}

/** Asks for the computer's answer every second until it comes, the request ends, or `until` passes. */
async function answerFor(api, connectionId, until, signal) {
    while (Date.now() < until) {
        await wait(Math.min(ASK_MS, Math.max(0, until - Date.now())), signal);
        let answer;
        try {
            answer = await api.answer(connectionId);
        } catch (error) {
            if (error?.status === 404) break;
            throw error;
        }
        if (answer !== null) return answer;
    }
    throw new ConnectError('no-answer');
}

/** The answer as the protocol allows it, or null: version 1, a known status, and an SDP exactly when it is `ok`. */
function readAnswer(text) {
    try {
        const answer = JSON.parse(text);
        if (answer?.v !== 1 || !['ok', 'approval', 'refused'].includes(answer.status)) return null;
        if (typeof answer.sig !== 'string') return null;
        if (answer.status === 'ok' ? typeof answer.sdp !== 'string' || !answer.sdp : answer.sdp !== undefined && typeof answer.sdp !== 'string') return null;
        return answer;
    } catch {
        return null;
    }
}

/**
 * Asks a computer to connect, once. Returns `{status: 'ok', connection}` with an open `Connection` that has said
 * hello, or `{status: 'approval'}` when the computer is keeping the request for someone to approve. Throws a
 * `ConnectError` otherwise.
 *
 * - `desktop` is the computer from the list, and `computerKey` the public key remembered for it, which is the only
 *   key its answer is checked against.
 * - `own` is this browser's `{privateKey, publicKey}`, and `browserName` what it calls itself.
 * - `onAsked({active})` hears that the offer was left, and whether the computer has checked in lately.
 * - `createPeer` makes the RTCPeerConnection, so tests can give it their own settings.
 */
export async function connect(desktop, computerKey, own, api, { browserName, signal, onAsked = () => { }, createPeer = settings => new RTCPeerConnection(settings) } = {}) {
    const iceServers = await api.servers();
    signal?.throwIfAborted();
    const peer = createPeer({ iceServers });
    try {
        const data = peer.createDataChannel('taskproxy');
        data.binaryType = 'arraybuffer';
        await peer.setLocalDescription(await peer.createOffer());
        await gathered(peer, GATHER_MS);
        signal?.throwIfAborted();
        const sdp = peer.localDescription.sdp;
        const time = Date.now();
        const offer = JSON.stringify({
            v: 1, sdp, browserKey: own.publicKey, browserName, time,
            sig: await sign(own.privateKey, await offerLines(desktop.desktopId, time, sdp)),
        });
        if (encoder.encode(offer).length > OFFER_BYTES) {
            throw new ConnectError('failed', 'This device has too many network addresses to send. Turn off a VPN or an unused network, and try again.');
        }
        let asked;
        try {
            asked = await api.connect(desktop.desktopId, offer);
        } catch (error) {
            if (error?.status === 404) throw new ConnectError('off', error.message);
            if (error?.status === 429) throw new ConnectError('busy', error.message);
            throw error;
        }
        const until = Date.now() + LIMIT_MS;
        onAsked({ active: !!asked.active });
        const answer = readAnswer(await answerFor(api, asked.connectionId, until, signal));
        // An answer that doesn't verify is no answer, whatever its status.
        if (!answer || !await verify(computerKey, answer.sig, await answerLines(asked.connectionId, answer.status, sdp, answer.sdp))) {
            throw new ConnectError('unsigned');
        }
        if (answer.status === 'refused') throw new ConnectError('refused');
        if (answer.status === 'approval') {
            peer.close();
            return { status: 'approval' };
        }
        await peer.setRemoteDescription({ type: 'answer', sdp: answer.sdp });
        await opened(peer, data, until);
        signal?.throwIfAborted();
        const connection = new Connection(peer, data);
        await connection.hello();
        return { status: 'ok', connection };
    } catch (error) {
        peer.close();
        throw error;
    }
}

/** A message as the frames that carry it: a flag byte, 0 for more to come or 1 for the last, then its bytes. */
export function frames(bytes) {
    const list = [];
    for (let start = 0; start === 0 || start < bytes.length; start += FRAME_BYTES) {
        const part = bytes.subarray(start, start + FRAME_BYTES);
        const frame = new Uint8Array(part.length + 1);
        frame[0] = start + FRAME_BYTES >= bytes.length ? 1 : 0;
        frame.set(part, 1);
        list.push(frame);
    }
    return list;
}

/**
 * An open connection to the computer: `request(cmd, args)` runs a command, `listen(event, handler)` hears events,
 * and `onClose(handler)` hears why it ended.
 */
export class Connection {
    constructor(peer, data) {
        this.peer = peer;
        this.data = data;
        this.next = 1;
        this.pending = new Map();
        this.listeners = new Map();
        this.closers = [];
        this.missers = [];
        this.closed = null;
        this.parts = [];
        this.partBytes = 0;
        this.seq = 0;
        this.pings = 0;
        this.queue = Promise.resolve();
        this.heard = Date.now();
        data.bufferedAmountLowThreshold = QUEUED_BYTES / 4;
        data.addEventListener('message', event => this.receive(event.data));
        data.addEventListener('close', () => this.close('The computer closed the connection.'));
        peer.addEventListener('connectionstatechange', () => {
            if (['failed', 'closed'].includes(peer.connectionState)) this.close('The connection to the computer was lost.');
        });
        this.timer = setInterval(() => {
            if (Date.now() - this.heard > SILENT_MS) return this.close('The computer stopped answering.');
            this.send({ ping: ++this.pings });
        }, PING_MS);
    }
    /** Sends a message, after any still being sent, so the frames of two messages never mix. */
    send(message) {
        if (this.closed) throw new Error(this.closed);
        const bytes = encoder.encode(JSON.stringify(message));
        if (bytes.length > MESSAGE_BYTES) throw new Error('That is more than can be sent to the computer at once (16 MB).');
        this.queue = this.queue.then(async () => {
            for (const frame of frames(bytes)) {
                if (this.data.bufferedAmount > QUEUED_BYTES) {
                    await new Promise(resolve => {
                        this.drained = resolve;
                        this.data.addEventListener('bufferedamountlow', resolve, { once: true });
                    });
                }
                if (this.closed) return;
                this.data.send(frame);
            }
        }).catch(() => this.close('The connection to the computer was lost.'));
    }
    receive(packet) {
        this.heard = Date.now();
        const frame = new Uint8Array(packet);
        if (typeof packet === 'string' || frame.length < 1 || frame.length > FRAME_BYTES + 1 || frame[0] > 1) {
            return this.close('The computer sent something that couldn\'t be read.');
        }
        this.parts.push(frame.subarray(1));
        this.partBytes += frame.length - 1;
        if (frame[0] === 0) return;
        let message;
        try {
            const bytes = new Uint8Array(this.partBytes);
            let at = 0;
            for (const part of this.parts) { bytes.set(part, at); at += part.length; }
            message = JSON.parse(decoder.decode(bytes));
        } catch {
            return this.close('The computer sent something that couldn\'t be read.');
        } finally {
            this.parts = [];
            this.partBytes = 0;
        }
        if (message === null || typeof message !== 'object') return this.close('The computer sent something that couldn\'t be read.');
        if (message.hello || message.reload) return this.greeted?.(message);
        if ('pong' in message) return;
        if (message.event) {
            // seq counts from 1 on each connection, so a gap is an event this browser never got.
            const missed = typeof message.seq === 'number' && message.seq !== this.seq + 1;
            if (typeof message.seq === 'number') this.seq = message.seq;
            if (missed) for (const handler of this.missers) handler();
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
    /** Says hello with this page's protocol version. Throws when the computer speaks another. */
    hello() {
        return new Promise((resolve, reject) => {
            const timer = setTimeout(() => {
                reject(new ConnectError('no-answer'));
                this.close('The computer didn\'t answer.');
            }, 15000);
            this.onClose(() => { clearTimeout(timer); reject(new ConnectError('unreachable')); });
            this.greeted = message => {
                clearTimeout(timer);
                this.greeted = null;
                if (message.reload || message.hello?.version !== VERSION) {
                    this.closers = [];
                    this.close('This page and Task Proxy on the computer are different versions.');
                    return reject(new ConnectError('version'));
                }
                this.closers = [];
                resolve();
            };
            this.send({ hello: { version: VERSION } });
        });
    }
    /** Runs a command on the computer. Rejects with the computer's reason, as Tauri's invoke does. */
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
    /** Hears that an event from the computer never arrived, so what is shown may be out of date. */
    onMissed(handler) {
        this.missers.push(handler);
    }
    onClose(handler) {
        if (this.closed) handler(this.closed);
        else this.closers.push(handler);
    }
    close(reason = 'Disconnected.') {
        if (this.closed) return;
        this.closed = reason;
        clearInterval(this.timer);
        this.drained?.();
        for (const { reject } of this.pending.values()) reject(reason);
        this.pending.clear();
        try { this.data.close(); } catch { }
        try { this.peer.close(); } catch { }
        for (const handler of this.closers) handler(reason);
    }
}
