// The desktops this device is paired with, kept in IndexedDB on this device only. Each holds the device's private
// key for that desktop, so it never leaves the browser.
const DB = 'taskproxy-remote';
const STORE = 'pairings';

function open() {
    return new Promise((resolve, reject) => {
        const request = indexedDB.open(DB, 1);
        request.onupgradeneeded = () => request.result.createObjectStore(STORE, { keyPath: 'desktopId' });
        request.onsuccess = () => resolve(request.result);
        request.onerror = () => reject(request.error);
    });
}

async function run(mode, work) {
    const db = await open();
    try {
        return await new Promise((resolve, reject) => {
            const transaction = db.transaction(STORE, mode);
            const request = work(transaction.objectStore(STORE));
            transaction.oncomplete = () => resolve(request?.result);
            transaction.onerror = () => reject(transaction.error);
        });
    } finally {
        db.close();
    }
}

const key = desktopId => `${desktopId}`.toLowerCase();

export const pairings = {
    all: () => run('readonly', store => store.getAll()),
    get: desktopId => run('readonly', store => store.get(key(desktopId))),
    save: pairing => run('readwrite', store => store.put({ ...pairing, desktopId: key(pairing.desktopId) })),
    remove: desktopId => run('readwrite', store => store.delete(key(desktopId))),
};
