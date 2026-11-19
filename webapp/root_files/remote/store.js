// What this browser keeps for Remote Connections, in IndexedDB on this device only:
// - its own key pair, made the first time the page is used. The private half is a non-extractable CryptoKey, so the
//   page can sign with it but nothing can read it;
// - the public key remembered for each computer the first time this browser connected to it.
import { exportPublicKey, generateKeys } from './crypto.js';

const DB = 'taskproxy-remote';
const KEYS = 'keys';
const COMPUTERS = 'computers';

function open() {
    return new Promise((resolve, reject) => {
        const request = indexedDB.open(DB, 2);
        request.onupgradeneeded = () => {
            const db = request.result;
            // Version 1 held the pairings of Remote Access, which this replaced.
            if (db.objectStoreNames.contains('pairings')) db.deleteObjectStore('pairings');
            db.createObjectStore(KEYS, { keyPath: 'id' });
            db.createObjectStore(COMPUTERS, { keyPath: 'desktopId' });
        };
        request.onsuccess = () => resolve(request.result);
        request.onerror = () => reject(request.error);
    });
}

async function run(store, mode, work) {
    const db = await open();
    try {
        return await new Promise((resolve, reject) => {
            const transaction = db.transaction(store, mode);
            let result;
            work(transaction.objectStore(store), value => { result = value; });
            transaction.oncomplete = () => resolve(result);
            transaction.onerror = () => reject(transaction.error);
            transaction.onabort = () => reject(transaction.error);
        });
    } finally {
        db.close();
    }
}

const read = (store, key) => run(store, 'readonly', (items, done) => {
    const request = items.get(key);
    request.onsuccess = () => done(request.result);
});

let own = null;

async function loadIdentity() {
    let kept;
    try {
        kept = await read(KEYS, 'browser');
        if (!kept) {
            const keys = await generateKeys();
            const made = { id: 'browser', privateKey: keys.privateKey, publicKey: await exportPublicKey(keys) };
            // Another tab may have made the key meanwhile, and the first one kept is the one every tab uses.
            kept = await run(KEYS, 'readwrite', (items, done) => {
                const request = items.get('browser');
                request.onsuccess = () => {
                    if (request.result) return done(request.result);
                    items.put(made);
                    done(made);
                };
            });
        }
    } catch {
        // No storage, as in some private windows: a key for this visit, approved again next time.
        const keys = await generateKeys();
        kept = { privateKey: keys.privateKey, publicKey: await exportPublicKey(keys) };
    }
    return { privateKey: kept.privateKey, publicKey: kept.publicKey };
}

/** This browser's key pair, made on first use: `{privateKey, publicKey}`. */
export function identity() {
    own ||= loadIdentity();
    return own;
}

const id = desktopId => `${desktopId}`.toLowerCase();
/** Remembered keys when there is no storage, for this visit. */
const unkept = new Map();

/** The public key remembered for each computer. */
export const computers = {
    async get(desktopId) {
        try {
            return (await read(COMPUTERS, id(desktopId)))?.publicKey || unkept.get(id(desktopId)) || null;
        } catch {
            return unkept.get(id(desktopId)) || null;
        }
    },
    async remember(desktopId, publicKey) {
        try {
            await run(COMPUTERS, 'readwrite', items => { items.put({ desktopId: id(desktopId), publicKey }); });
        } catch {
            unkept.set(id(desktopId), publicKey);
        }
    },
    async forget(desktopId) {
        unkept.delete(id(desktopId));
        try {
            await run(COMPUTERS, 'readwrite', items => { items.delete(id(desktopId)); });
        } catch { }
    },
};
