// A test stand-in for Task Proxy on a computer: the computer's side of the Remote Connections Protocol page, through
// the tests' mock of api.myfi.ws. It is written from that page with Web Crypto alone, sharing no code with the site,
// so the two only agree when both follow the page. Commands are answered from `commands`, and remote_app_file from the
// fixture app in tests/fixtures/remote/app.
const encoder = new TextEncoder();
const decoder = new TextDecoder();
const KEY = { name: 'ECDSA', namedCurve: 'P-256' };
const SIGNATURE = { name: 'ECDSA', hash: 'SHA-256' };
const FRAME_BYTES = 16383;
// The computer's fixed key, for these tests only.
const FIXED_KEY = {
    kty: 'EC', crv: 'P-256',
    x: 'NCSVIJBXY7-wPpDdLMb1bYwciyHW6PHotVcOJD8Ii7I',
    y: 'Qc5EFRX2eOd0P6WPbcA-apvXKZ0ZWyvOAS2NuCxn0yY',
    d: 'nwalgP8RCxNyKT03cWpwENG4f51KzAIVYb_-xrGjPvw',
};

const toBase64url = bytes => btoa(String.fromCharCode(...new Uint8Array(bytes))).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
const fromBase64url = text => Uint8Array.from(atob(text.replace(/-/g, '+').replace(/_/g, '/')), char => char.charCodeAt(0));
const sha256 = async text => Array.from(new Uint8Array(await crypto.subtle.digest('SHA-256', encoder.encode(text))), byte => byte.toString(16).padStart(2, '0')).join('');
const publicOf = jwk => toBase64url([4, ...fromBase64url(jwk.x), ...fromBase64url(jwk.y)]);
const call = (path, body) => fetch(`https://api.myfi.ws/${path}`, {
    method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify(body),
}).then(response => response.json());

/** The code people compare, worked out from a browser's key. */
async function codeOf(key) {
    const hash = new Uint8Array(await crypto.subtle.digest('SHA-256', fromBase64url(key)));
    const letters = Array.from(hash.subarray(0, 6), byte => 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'[byte % 32]).join('');
    return `${letters.substring(0, 3)}-${letters.substring(3)}`;
}

const desktop = window.desktop = {
    id: crypto.randomUUID(),
    name: 'Test Desktop',
    version: 2,
    privateKey: null,
    publicKey: publicOf(FIXED_KEY),
    /** Approves the first browser that asks, as when someone approved it on the computer. */
    approveFirst: false,
    /** 'wrong' signs answers with a key that isn't the computer's, and 'none' leaves the signature out. */
    signing: 'own',
    /** Answers `ok` and then never connects, as a computer on a network this browser can't reach. */
    unreachable: false,
    approved: [],
    waiting: [],
    refused: [],
    /** Each offer read, with why it was refused when it was: `{offer, problem}`. */
    offers: [],
    connections: [],
    log: [],
    commands: {
        get_projects: () => [{ name: 'Storefront' }, { name: 'Docs' }],
        desktop_only_command: () => { throw 'Only the desktop can do that.'; },
        echo: args => args,
    },
    /** Replaces the computer's key, as when Task Proxy's data was removed. Returns the new public key. */
    async newKey() {
        const keys = await crypto.subtle.generateKey(KEY, true, ['sign', 'verify']);
        this.privateKey = keys.privateKey;
        this.publicKey = toBase64url(await crypto.subtle.exportKey('raw', keys.publicKey));
        return this.publicKey;
    },
    /** Approves a waiting browser on the computer, by its key. */
    approve(key) {
        const asked = this.waiting.find(item => item.key === key);
        if (!asked) return false;
        this.waiting = this.waiting.filter(item => item !== asked);
        this.approved.push({ key, name: asked.name, added: Date.now() });
        return true;
    },
    /** Removes an approved browser, ending its connection, or refuses a waiting one. */
    remove(key) {
        if (this.waiting.some(item => item.key === key)) this.refused.push(key);
        this.waiting = this.waiting.filter(item => item.key !== key);
        this.approved = this.approved.filter(item => item.key !== key);
        for (const connection of this.connections.filter(item => item.key === key)) connection.peer.close();
        this.connections = this.connections.filter(item => item.key !== key);
    },
    async browsers(asking) {
        return {
            approved: await Promise.all(this.approved.map(async item => ({ ...item, code: await codeOf(item.key), current: item.key === asking }))),
            waiting: await Promise.all(this.waiting.map(async item => ({ ...item, code: await codeOf(item.key) }))),
        };
    },
    /** Why an offer isn't accepted, or '' (the protocol page's checks 1 to 3). */
    async problemWith(offer) {
        if (offer?.v !== 1) return 'version';
        if (typeof offer.sdp !== 'string' || typeof offer.browserKey !== 'string' || typeof offer.time !== 'number' || typeof offer.sig !== 'string') return 'fields';
        if (typeof offer.browserName !== 'string' || offer.browserName.length < 1 || offer.browserName.length > 60) return 'name';
        try {
            const key = await crypto.subtle.importKey('raw', fromBase64url(offer.browserKey), KEY, false, ['verify']);
            const lines = ['taskproxy-remote-offer-v1', this.id, `${offer.time}`, await sha256(offer.sdp)].join('\n');
            if (!await crypto.subtle.verify(SIGNATURE, key, fromBase64url(offer.sig), encoder.encode(lines))) return 'signature';
        } catch {
            return 'signature';
        }
        if (Math.abs(Date.now() - offer.time) > 120000) return 'time';
        return '';
    },
    async answer({ connectionId, offer: text }) {
        let offer = null;
        try { offer = JSON.parse(text); } catch { }
        const problem = await this.problemWith(offer);
        this.offers.push({ offer, problem });
        let status = 'refused';
        if (!problem && !this.refused.includes(offer.browserKey)) {
            if (this.approveFirst && !this.approved.length) this.approved.push({ key: offer.browserKey, name: offer.browserName, added: Date.now() });
            status = this.approved.some(item => item.key === offer.browserKey) ? 'ok' : 'approval';
        }
        if (status === 'approval') {
            const asked = this.waiting.find(item => item.key === offer.browserKey);
            if (asked) asked.asked = Date.now();
            else if (this.waiting.length < 10) this.waiting.push({ key: offer.browserKey, name: offer.browserName, asked: Date.now() });
        }
        let peer, opened, sdp;
        if (status === 'ok') {
            peer = new RTCPeerConnection({ iceServers: [] });
            opened = new Promise(resolve => { peer.ondatachannel = event => resolve(event.channel); });
            await peer.setRemoteDescription({ type: 'offer', sdp: offer.sdp });
            await peer.setLocalDescription(await peer.createAnswer());
            await new Promise(resolve => {
                if (peer.iceGatheringState === 'complete') return resolve();
                peer.onicegatheringstatechange = () => peer.iceGatheringState === 'complete' && resolve();
            });
            sdp = peer.localDescription.sdp;
            if (this.unreachable) peer.close();
        }
        const lines = ['taskproxy-remote-answer-v1', connectionId, status, await sha256(typeof offer?.sdp === 'string' ? offer.sdp : ''), sdp === undefined ? '' : await sha256(sdp)].join('\n');
        const signer = this.signing === 'wrong' ? (await crypto.subtle.generateKey(KEY, false, ['sign'])).privateKey : this.privateKey;
        const answer = { v: 1, status, sdp, sig: toBase64url(await crypto.subtle.sign(SIGNATURE, signer, encoder.encode(lines))) };
        if (this.signing === 'none') delete answer.sig;
        await call('remote/desktop/answer', { connectionId, answer: JSON.stringify(answer) });
        // Not waited for, since a browser that doesn't believe the answer never opens the channel.
        if (status === 'ok' && !this.unreachable) {
            opened.then(channel => channel.label === 'taskproxy' ? this.serve(peer, channel, offer.browserKey) : peer.close());
        }
    },
    serve(peer, data, key) {
        data.binaryType = 'arraybuffer';
        const connection = { peer, data, key, seq: 0, ready: false };
        const sendMessage = message => {
            const bytes = encoder.encode(JSON.stringify(message));
            for (let start = 0; start === 0 || start < bytes.length; start += FRAME_BYTES) {
                const part = bytes.subarray(start, start + FRAME_BYTES);
                const frame = new Uint8Array(part.length + 1);
                frame[0] = start + FRAME_BYTES >= bytes.length ? 1 : 0;
                frame.set(part, 1);
                data.send(frame);
            }
        };
        connection.send = sendMessage;
        this.connections.push(connection);
        let parts = [];
        const handle = async message => {
            if (message.hello) {
                connection.ready = message.hello.version === this.version;
                return sendMessage(connection.ready ? { hello: { version: this.version } } : { reload: true });
            }
            if ('ping' in message) return sendMessage({ pong: message.ping });
            this.log.push(message.cmd);
            try {
                let value;
                switch (message.cmd) {
                    case 'remote_app_file': value = await appFile(message.args.path); break;
                    case 'remote_browsers': value = await this.browsers(key); break;
                    case 'remote_browser_approve':
                        this.approve(message.args.key);
                        value = await this.browsers(key);
                        break;
                    case 'remote_browser_remove':
                        // Answered first, since removing the browser that asked ends its connection.
                        if (message.args.key === key) return this.remove(key);
                        this.remove(message.args.key);
                        value = await this.browsers(key);
                        break;
                    default: value = await this.commands[message.cmd](message.args);
                }
                sendMessage({ id: message.id, ok: true, value });
            } catch (error) {
                sendMessage({ id: message.id, ok: false, error: `${error?.message || error}` });
            }
        };
        data.onmessage = event => {
            const frame = new Uint8Array(event.data);
            if (frame.length < 1 || frame.length > FRAME_BYTES + 1 || frame[0] > 1) return peer.close();
            parts.push(...frame.subarray(1));
            if (frame[0] === 0) return;
            const message = JSON.parse(decoder.decode(new Uint8Array(parts)));
            parts = [];
            handle(message);
        };
        data.onclose = () => { this.connections = this.connections.filter(item => item !== connection); };
    },
    /** Sends an event to every connected browser. `skip` leaves a number out, as an event that was lost. */
    emit(event, payload, { skip = false } = {}) {
        for (const connection of this.connections) {
            if (skip) connection.seq++;
            connection.send({ event, payload, seq: ++connection.seq });
        }
    },
    /** Ends every connection, as closing Task Proxy does. */
    dropAll() {
        for (const connection of this.connections) connection.peer.close();
        this.connections = [];
    },
    /** Reads the connection requests until stopped, as Task Proxy does while Remote Connections is on. */
    async run() {
        this.running = true;
        while (this.running) {
            const { connections } = await call('remote/desktop/connections', { desktopId: this.id });
            for (const request of connections) await this.answer(request).catch(error => console.error(error));
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
desktop.privateKey = await crypto.subtle.importKey('jwk', FIXED_KEY, KEY, false, ['sign']);
window.desktopReady = true;
