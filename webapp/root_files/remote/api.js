// The calls the Remote Connections page makes to api.myfi.ws, signed in with this site's own session cookie, as the
// Web UI loader makes them (fetchApi in MyFiCDN's loader.js). The cookie is HttpOnly, so this page never reads it.
export const API = 'https://api.myfi.ws';

/** A failed call, with the API's status and its reason when it gave one. */
export class ApiError extends Error {
    constructor(status, message) {
        super(message);
        this.status = status;
    }
}

async function send(path, body, method) {
    return fetch(`${API}/${path}`, {
        method,
        credentials: 'include',
        mode: 'cors',
        cache: 'no-cache',
        headers: body === undefined ? {} : { 'Content-Type': 'application/json' },
        body: body === undefined ? undefined : JSON.stringify(body),
    });
}

function failure(status, text) {
    const reason = text.trim() && text.length < 300 ? text.trim() : '';
    return new ApiError(status, status === 401
        ? 'You are signed out. Sign in again.'
        : reason || `api.myfi.ws couldn't answer (${status}). Try again in a minute.`);
}

async function call(path, body, method = 'POST') {
    const response = await send(path, body, method);
    const text = await response.text();
    if (!response.ok) throw failure(response.status, text);
    return parsed(text);
}

/** An answer's JSON, or its text when it isn't JSON, as the sign-in's "Signin Successful". */
function parsed(text) {
    if (!text) return null;
    try {
        return JSON.parse(text);
    } catch {
        return text;
    }
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
    /** This account's computers with Remote Connections on: `{desktopId, name, publicKey, active, lastSeen}`. */
    async desktops() {
        return (await call('remote/desktops', undefined, 'GET'))?.desktops || [];
    },
    /** The servers a connection finds its addresses with, read before each connection. */
    async servers() {
        return (await call('remote/servers', undefined, 'GET'))?.iceServers || [];
    },
    /** Leaves a signed offer for a computer. Returns `{connectionId, active}`. */
    connect(desktopId, offer) {
        return call('remote/connect', { desktopId, offer });
    },
    /** The computer's answer to a request, given once, or null while it hasn't answered. Throws once the request has ended. */
    async answer(connectionId) {
        const response = await send(`remote/connect?connectionId=${encodeURIComponent(connectionId)}`, undefined, 'GET');
        const text = await response.text();
        if (response.status === 202) return null;
        if (!response.ok) throw failure(response.status, text);
        return JSON.parse(text).answer;
    },
    /** Turns Remote Connections off for a computer. */
    async turnOff(desktopId) {
        await call('remote/desktop', { desktopId }, 'DELETE');
    },
};

/** The address that signs this site in on www.stoicdreams.com and comes back to `path`. */
export function signInUrl(path = '/remote/') {
    return `https://www.stoicdreams.com/signin?domain=${encodeURIComponent(location.hostname)}&return=${encodeURIComponent(path)}`;
}
