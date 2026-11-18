// A test stand-in for Task Proxy on a desktop: the desktop's side of pairing (pairing.rs), connecting (connect.rs)
// and the connection (webrtc.rs, protocol.rs) in TaskProxyApp, through the tests' mock of api.myfi.ws. Commands are
// answered from `commands`, and remote_app_file from the fixture app in tests/fixtures/remote/app.
import { Handshake, generateKeys, prologue, base64url, hex } from '/remote/noise.js';
import { KIND, encode, decode } from '/remote/connection.js';

const encoder = new TextEncoder();
const decoder = new TextDecoder();
const json = value => encoder.encode(JSON.stringify(value));
const parse = bytes => JSON.parse(decoder.decode(bytes));
const call = (path, body) => fetch(`https://api.myfi.ws/${path}`, {
    method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify(body),
}).then(response => response.json());
const refuse = reason => { const bytes = encoder.encode(reason); return encode(KIND.Refused, bytes); };

const desktop = window.desktop = {
    id: crypto.randomUUID(),
    name: 'Test Desktop',
    account: 1,
    version: 1,
    keys: generateKeys(),
    invite: null,
    pending: new Map(),
    devices: [],
    connections: [],
    log: [],
    commands: {
        get_projects: () => [{ name: 'Storefront' }, { name: 'Docs' }],
        desktop_only_command: () => { throw 'Only the desktop can do that.'; },
    },
    get publicKey() { return hex.encode(this.keys.publicKey); },
    /** Opens a QR code, and returns the link it shows. */
    openInvite({ level = 'work', days = 30, name = 'Phone', expires = Date.now() + 600000, secret } = {}) {
        const psk = secret ? base64url.decode(secret) : crypto.getRandomValues(new Uint8Array(32));
        this.invite = { psk, level, days, name };
        const payload = { v: 1, desktopId: this.id, desktopKey: this.publicKey, secret: base64url.encode(psk), expires, name: this.name };
        return `/remote/#pair=${base64url.encode(json(payload))}`;
    },
    async answer(inbound) {
        const { kind, data } = decode(inbound.message);
        const send = message => call('remote/reply/send', { desktopId: this.id, reply: inbound.reply, message });
        if (`${inbound.from}` !== `${this.account}`) {
            return send(refuse('This desktop is signed in to another account. Sign in to the same account on both.'));
        }
        if (kind === KIND.Pair1) {
            if (!this.invite) return send(refuse('This pairing code has expired or was used. Show a new QR code on the desktop.'));
            const handshake = new Handshake({ pattern: 'XXpsk3', initiator: false, prologue: prologue(this.id, inbound.reply), s: this.keys, psk: this.invite.psk });
            handshake.read(data);
            this.pending.set(inbound.reply, handshake);
            return send(encode(KIND.Pair2, handshake.write(json({ name: this.name }))));
        }
        if (kind === KIND.Pair3) {
            const handshake = this.pending.get(inbound.reply);
            this.pending.delete(inbound.reply);
            let payload;
            try {
                payload = parse(handshake.read(data));
            } catch {
                return send(refuse('The pairing code didn\'t match. Scan the QR code on the desktop again.'));
            }
            const invite = this.invite;
            this.invite = null;
            const device = { id: crypto.randomUUID(), key: hex.encode(handshake.rs), name: payload.name || invite.name, level: invite.level, days: invite.days };
            this.devices.push(device);
            const [packet] = handshake.finish().seal(JSON.stringify({ ok: true, deviceId: device.id, name: device.name, level: device.level, days: device.days, desktopName: this.name }));
            return send(encode(KIND.Paired, packet));
        }
        if (kind === KIND.Connect1) {
            const handshake = new Handshake({ pattern: 'IK', initiator: false, prologue: prologue(this.id, inbound.reply), s: this.keys });
            const { offer } = parse(handshake.read(data));
            const device = this.devices.find(item => item.key === hex.encode(handshake.rs));
            if (!device) return send(refuse('This device isn\'t paired with this desktop. Scan the QR code on the desktop to pair it.'));
            const peer = new RTCPeerConnection({ iceServers: [] });
            const opened = new Promise(resolve => { peer.ondatachannel = event => resolve(event.channel); });
            await peer.setRemoteDescription({ type: 'offer', sdp: offer });
            await peer.setLocalDescription(await peer.createAnswer());
            await new Promise(resolve => {
                if (peer.iceGatheringState === 'complete') return resolve();
                peer.onicegatheringstatechange = () => peer.iceGatheringState === 'complete' && resolve();
            });
            await send(encode(KIND.Connect2, handshake.write(json({ answer: peer.localDescription.sdp }))));
            this.serve(peer, await opened, handshake.finish(), device);
        }
    },
    serve(peer, data, channel, device) {
        data.binaryType = 'arraybuffer';
        const connection = { peer, data, device, seq: 0, ready: false };
        const sendMessage = message => { for (const packet of channel.seal(JSON.stringify(message))) data.send(packet); };
        connection.send = sendMessage;
        this.connections.push(connection);
        data.onmessage = async event => {
            const bytes = channel.open(new Uint8Array(event.data));
            if (!bytes) return;
            const message = parse(bytes);
            if (message.hello) {
                connection.ready = message.hello.version === this.version;
                return sendMessage({ welcome: { version: this.version, reload: !connection.ready } });
            }
            if ('ping' in message) return sendMessage({ pong: message.ping });
            this.log.push(message.cmd);
            try {
                const value = message.cmd === 'remote_app_file' ? await appFile(message.args.path) : await this.commands[message.cmd](message.args);
                sendMessage({ id: message.id, ok: true, value });
            } catch (error) {
                sendMessage({ id: message.id, ok: false, error: `${error?.message || error}` });
            }
        };
        data.onclose = () => { this.connections = this.connections.filter(item => item !== connection); };
    },
    /** Sends an event to every connected device. */
    emit(event, payload) {
        for (const connection of this.connections) connection.send({ event, payload, seq: ++connection.seq });
    },
    /** Ends every connection, as unpairing or disconnecting a device does. */
    dropAll() {
        for (const connection of this.connections) connection.peer.close();
        this.connections = [];
    },
    /** Reads the mailbox until stopped, as service.rs does while a QR code is open. */
    async run() {
        this.running = true;
        while (this.running) {
            const { messages } = await call('remote/messages', { desktopId: this.id });
            for (const inbound of messages) await this.answer(inbound).catch(error => console.error(error));
            await new Promise(resolve => setTimeout(resolve, 50));
        }
    },
};

async function appFile(path) {
    const name = path.split('?')[0].replace(/^\/+/, '') || 'index.html';
    const response = await fetch(`/__fixtures/app/${name}`);
    if (!response.ok) throw `Task Proxy has no file '${name}'.`;
    const bytes = new Uint8Array(await response.arrayBuffer());
    let text = '';
    for (const byte of bytes) text += String.fromCharCode(byte);
    return { mime: response.headers.get('content-type') || 'application/octet-stream', data: btoa(text) };
}
window.desktopReady = true;
