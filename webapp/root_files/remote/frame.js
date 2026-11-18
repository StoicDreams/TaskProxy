// Runs the desktop's Task Proxy app in a frame (Docs/RemoteAccess.md in TaskProxyApp, 2.4).
//
// The frame first loads at /remote/app/?c=<connection>, so sw.js controls it and answers its requests from the
// desktop. The stand-in, put first in the app's <head>, then:
// - replaces the frame's address with the app's own route, so the loader's paths, routes and <base href="/"> work as
//   they do on the desktop;
// - passes the service worker's requests up to this page;
// - starts the app's workers from a blob, since a worker's own script never reaches the service worker;
// - reports the route, so the app reopens where it was;
// - gives the app a window.__TAURI__ that runs commands and hears events over the connection.
const ROUTE_KEY = 'remote-route';
const decoder = new TextDecoder();
const encoder = new TextEncoder();

/** The stand-in's code. It runs in the frame, so it can use nothing from this module. */
function standIn() {
    const bridge = parent.__remoteBridge;
    const connection = new URLSearchParams(location.search).get('c');
    window.__taskProxyRemote = bridge.remote;
    navigator.serviceWorker.onmessage = async event => {
        if (event.data?.type !== 'remote-fetch') return;
        const reply = await bridge.fetch(event.data);
        event.ports[0].postMessage(reply, [reply.body]);
    };
    history.replaceState(null, '', bridge.route());
    // _reloading is a project reload's stop on the way back to the same page.
    const keepRoute = () => location.pathname.includes('_reloading') || bridge.keepRoute(location.pathname + location.search);
    for (const name of ['pushState', 'replaceState']) {
        const change = history[name];
        history[name] = function (...args) {
            const result = change.apply(this, args);
            keepRoute();
            return result;
        };
    }
    window.addEventListener('popstate', keepRoute);
    const NativeWorker = window.Worker;
    window.Worker = function (url, options) {
        const address = new URL(url, document.baseURI);
        address.searchParams.set('remote-connection', connection);
        const script = `importScripts(${JSON.stringify(address.href)});`;
        return new NativeWorker(URL.createObjectURL(new Blob([script], { type: 'text/javascript' })), options);
    };
    // The frame's address is outside the service worker's scope, so a reload of the frame alone would load the
    // website. The outer page opens the app again instead.
    window.addEventListener('pagehide', () => bridge.reopen());
    window.__TAURI__ = bridge.tauri;
}

/** The app's index.html as the frame needs it: the stand-in first, and no service worker of its own. */
export function forFrame(html) {
    return html
        .replace(/navigator\.serviceWorker\.register\([^)]*\);?/, '')
        .replace(/<head[^>]*>/i, head => `${head}<script>(${standIn})();</script>`);
}

function base64ToBytes(text) {
    return Uint8Array.from(atob(text), char => char.charCodeAt(0));
}

/** What the app's `window.__TAURI__` does, over the connection. */
export function tauriFor(connection) {
    return {
        core: { invoke: (cmd, args) => connection.request(cmd, args ?? {}) },
        event: {
            listen: async (event, handler) => connection.listen(event, payload => handler({ event, payload })),
        },
        opener: { openUrl: async url => { window.open(url, '_blank', 'noopener'); } },
        dialog: { open: async () => { throw 'Only on the desktop.'; } },
    };
}

/**
 * Opens the app in `frame` over `connection`. `remote` is what the app is told about this device:
 * `{level, deviceName, desktopName}`.
 */
export async function openApp(frame, connection, remote) {
    const registration = await navigator.serviceWorker.register('/remote/sw.js', { scope: '/remote/app/' });
    await new Promise(resolve => {
        const worker = registration.active ? null : registration.installing || registration.waiting;
        if (!worker) return resolve();
        worker.addEventListener('statechange', () => worker.state === 'activated' && resolve());
    });
    const id = crypto.randomUUID();
    // The app's files don't change while it is connected, so each is asked for once.
    const files = new Map();
    const fetchFile = async ({ path, navigate }) => {
        try {
            if (!navigate && files.has(path)) return files.get(path);
            const file = await connection.request('remote_app_file', { path });
            let bytes = base64ToBytes(file.data);
            if (navigate) bytes = encoder.encode(forFrame(decoder.decode(bytes)));
            const answer = { status: 200, mime: file.mime };
            if (!navigate) files.set(path, { ...answer, bytes });
            return { ...answer, bytes };
        } catch (error) {
            const reason = `${error?.message || error}`;
            return { status: /no file/.test(reason) ? 404 : 503, mime: 'text/plain', bytes: encoder.encode(reason) };
        }
    };
    const reply = async request => {
        const { status, mime, bytes } = await fetchFile(request);
        // A copy, so handing the bytes to the service worker leaves the kept file whole.
        const body = bytes.slice().buffer;
        return { status, headers: { 'content-type': mime }, body };
    };
    let reopening = false;
    window.__remoteBridge = {
        remote,
        tauri: tauriFor(connection),
        fetch: reply,
        route: () => sessionStorage.getItem(ROUTE_KEY) || '/',
        keepRoute: path => sessionStorage.setItem(ROUTE_KEY, path),
        reopen() {
            if (reopening || connection.closed) return;
            reopening = true;
            setTimeout(() => {
                reopening = false;
                if (!connection.closed) frame.src = `/remote/app/?c=${id}&t=${Date.now()}`;
            }, 0);
        },
    };
    navigator.serviceWorker.onmessage = async event => {
        if (event.data?.type !== 'remote-fetch') return;
        // Another tab's connection: say nothing, and its own page answers.
        if (event.data.connection !== id) return event.ports[0].postMessage(null);
        const answer = await reply(event.data);
        event.ports[0].postMessage(answer, [answer.body]);
    };
    frame.hidden = false;
    frame.src = `/remote/app/?c=${id}`;
}

/** Closes the app, as when the connection ends. */
export function closeApp(frame) {
    frame.src = 'about:blank';
    frame.hidden = true;
}
