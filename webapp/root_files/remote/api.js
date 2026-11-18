// The calls the remote page makes to api.myfi.ws, signed in with this site's own session cookie, as the Web UI
// loader makes them (fetchApi in MyFiCDN's loader.js).
export const API = 'https://api.myfi.ws';

/** A failed call, with the API's status and its reason when it gave one. */
export class ApiError extends Error {
    constructor(status, message) {
        super(message);
        this.status = status;
    }
}

async function call(path, body, method = 'POST') {
    const response = await fetch(`${API}/${path}`, {
        method,
        credentials: 'include',
        mode: 'cors',
        cache: 'no-cache',
        headers: body === undefined ? {} : { 'Content-Type': 'application/json' },
        body: body === undefined ? undefined : JSON.stringify(body),
    });
    const text = await response.text();
    if (!response.ok) {
        const reason = text.trim() && text.length < 300 ? text.trim() : '';
        throw new ApiError(response.status, response.status === 401
            ? 'You are signed out. Sign in again.'
            : reason || `api.myfi.ws couldn't answer (${response.status}). Try again in a minute.`);
    }
    return text ? JSON.parse(text) : null;
}

export const api = {
    /** Exchanges the code stoicdreams.com sends back after signing in for this site's session. */
    async signIn(code) {
        await call('user/signin/code', { code });
    },
    /** Whether this browser is signed in on this site. */
    async isSignedIn() {
        try {
            return Number(await call('user/roles', undefined, 'GET')) > 0;
        } catch {
            return false;
        }
    },
    /** This account's desktops: `{desktopId, name, fingerprint, online, lastSeen}`. */
    async desktops() {
        return (await call('remote/desktops', undefined, 'GET'))?.desktops || [];
    },
    /** Leaves a message for a desktop. Returns `{online}`. */
    send(desktopId, reply, message) {
        return call('remote/message/send', { desktopId, reply, message });
    },
    /** The desktops' answers in a reply mailbox, oldest first: `[{desktopId, message}]`. */
    async replies(reply) {
        return (await call('remote/replies', { reply }))?.messages || [];
    },
};

/** The address that signs this site in on www.stoicdreams.com and comes back to `path`. */
export function signInUrl(path = '/remote/') {
    return `https://www.stoicdreams.com/signin?domain=${encodeURIComponent(location.hostname)}&return=${encodeURIComponent(path)}`;
}
