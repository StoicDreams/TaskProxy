import { readFileSync } from 'node:fs';
import { test, expect } from './support/remote.mjs';

// The remote page's Noise implementation against the Noise test vectors that the desktop's library (snow) is
// tested with, for the two handshakes Task Proxy uses. Each side writes with fixed keys, so every message must
// match the vector byte for byte, and the other side must read back the payload.
const { vectors } = JSON.parse(readFileSync(new URL('./fixtures/remote/noise-vectors.json', import.meta.url), 'utf8'));

for (const vector of vectors) {
    test(`${vector.protocol_name} matches the Noise test vectors`, async ({ page, site }) => {
        await page.goto(`${site.origin}/__fixtures/blank.html`);
        const result = await page.evaluate(async vector => {
            const { Handshake, hex, keysFrom } = await import('/remote/noise.js');
            const pattern = vector.protocol_name.split('_')[1];
            const initiator = new Handshake({
                pattern, initiator: true, prologue: hex.decode(vector.init_prologue),
                s: keysFrom(hex.decode(vector.init_static)), e: keysFrom(hex.decode(vector.init_ephemeral)),
                rs: vector.init_remote_static ? hex.decode(vector.init_remote_static) : null,
                psk: vector.init_psks ? hex.decode(vector.init_psks[0]) : null,
            });
            const responder = new Handshake({
                pattern, initiator: false, prologue: hex.decode(vector.resp_prologue),
                s: keysFrom(hex.decode(vector.resp_static)), e: keysFrom(hex.decode(vector.resp_ephemeral)),
                psk: vector.resp_psks ? hex.decode(vector.resp_psks[0]) : null,
            });
            const out = { ciphertexts: [], payloads: [] };
            let channels = null;
            vector.messages.forEach((message, index) => {
                const fromInitiator = index % 2 === 0;
                const payload = hex.decode(message.payload);
                let ciphertext, read;
                if (!initiator.isFinished) {
                    const [writer, reader] = fromInitiator ? [initiator, responder] : [responder, initiator];
                    ciphertext = writer.write(payload);
                    read = reader.read(ciphertext);
                    if (initiator.isFinished) {
                        out.hashes = [hex.encode(initiator.hash), hex.encode(responder.hash)];
                        channels = { initiator: initiator.finish(), responder: responder.finish() };
                    }
                } else {
                    // After the handshake, each message is a transport message with no frame byte.
                    const [writer, reader] = fromInitiator ? [channels.initiator, channels.responder] : [channels.responder, channels.initiator];
                    ciphertext = writer.sending.encrypt(new Uint8Array(0), payload);
                    read = reader.receiving.decrypt(new Uint8Array(0), ciphertext);
                }
                out.ciphertexts.push(hex.encode(ciphertext));
                out.payloads.push(hex.encode(read));
            });
            return out;
        }, vector);
        expect(result.ciphertexts).toEqual(vector.messages.map(message => message.ciphertext));
        expect(result.payloads).toEqual(vector.messages.map(message => message.payload));
        expect(result.hashes).toEqual([vector.handshake_hash, vector.handshake_hash]);
    });
}

test('a message too large for one frame is split, and put back together on the other side', async ({ page, site }) => {
    await page.goto(`${site.origin}/__fixtures/blank.html`);
    const result = await page.evaluate(async () => {
        const { Handshake, FRAME_DATA, generateKeys } = await import('/remote/noise.js');
        const desktop = generateKeys();
        const device = new Handshake({ pattern: 'IK', initiator: true, s: generateKeys(), rs: desktop.publicKey });
        const answer = new Handshake({ pattern: 'IK', initiator: false, s: desktop });
        answer.read(device.write());
        device.read(answer.write());
        const [sending, receiving] = [device.finish(), answer.finish()];
        const message = 'x'.repeat(FRAME_DATA * 2 + 5);
        const packets = sending.seal(message);
        const opened = packets.map(packet => receiving.open(packet));
        return { packets: packets.length, partsBeforeLast: opened.slice(0, -1), last: new TextDecoder().decode(opened.at(-1)) === message };
    });
    expect(result).toEqual({ packets: 3, partsBeforeLast: [null, null], last: true });
});
