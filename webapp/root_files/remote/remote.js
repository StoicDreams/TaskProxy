// Task Proxy Remote: sign in, pair with a desktop from its QR code, and use Task Proxy on it from this device
// (Docs/RemoteAccess.md in TaskProxyApp, 2.4).
import { api, signInUrl } from './api.js';
import { pairings } from './store.js';
import { Refused, connect, pair, readPairPayload } from './connection.js';
import { closeApp, openApp } from './frame.js';

/** The QR code's payload, kept through signing in. */
const PAIR_KEY = 'remote-pair';
/** The desktop this tab is connected to, so reloading connects again. */
const CONNECTED_KEY = 'remote-connected';
const LEVELS = {
    view: 'look at projects, pages, changes and runs',
    work: 'look, edit, set variables, and run trusted scripts',
    commit: 'do everything, including commit and push',
};

const $ = id => document.getElementById(id);
/** The open connection, so a new code can close it first. */
let current = null;

function button(label, onClick, { secondary = false } = {}) {
    const element = document.createElement('button');
    element.type = 'button';
    element.textContent = label;
    if (secondary) element.className = 'secondary';
    element.addEventListener('click', onClick);
    return element;
}

function show(message, detail = '', actions = []) {
    $('message').textContent = message;
    $('detail').textContent = detail;
    $('actions').replaceChildren(...actions);
}

function signInLink(label) {
    const link = document.createElement('a');
    link.className = 'button';
    link.href = signInUrl();
    link.textContent = label;
    return link;
}

function reasonOf(error) {
    return `${error?.message || error || 'Something went wrong.'}`;
}

/** Takes `prefix` and what follows off the address, so a code is never bookmarked or shared. */
function takeHash(prefix) {
    if (!location.hash.startsWith(prefix)) return null;
    const value = decodeURIComponent(location.hash.substring(prefix.length));
    history.replaceState(null, '', location.pathname + location.search);
    return value || null;
}

async function start() {
    const code = takeHash('#myfi-signin=');
    const payload = takeHash('#pair=');
    if (payload) sessionStorage.setItem(PAIR_KEY, payload);
    if (code) {
        show('Signing in');
        // A refused code stays on the page with the API's reason, rather than being replaced by the sign-in prompt.
        const failed = await api.signIn(code).then(() => null, error => error);
        if (failed) {
            show('Sign-in failed.', reasonOf(failed), [signInLink('Sign In Again')]);
            return;
        }
    }
    if (!await api.isSignedIn()) {
        show(
            code ? 'Sign-in finished, but this browser is still signed out.' : 'Sign in to use Task Proxy from this device.',
            code
                ? 'This browser may be blocking the sign-in cookie for api.myfi.ws. Allow cookies for this site, then sign in again.'
                : 'Use the same Stoic Dreams account Task Proxy is signed in to on your desktop.',
            [signInLink(code ? 'Sign In Again' : 'Sign In')],
        );
        return;
    }
    const pending = sessionStorage.getItem(PAIR_KEY);
    if (pending) {
        sessionStorage.removeItem(PAIR_KEY);
        return runPairing(pending);
    }
    const reconnect = sessionStorage.getItem(CONNECTED_KEY);
    const pairing = reconnect && await pairings.get(reconnect);
    if (pairing) return connectTo(pairing);
    return showDesktops();
}

async function runPairing(text) {
    const payload = readPairPayload(text);
    if (!payload) {
        show('This link isn\'t a Task Proxy pairing code.', 'Scan the QR code in Task Proxy\'s Settings on your desktop again.');
        return showDesktops({ keepMessage: true });
    }
    const name = payload.name || 'your desktop';
    show(`Pairing with ${name}`);
    try {
        const pairing = await pair(payload, api, { onStatus: status => show(`Pairing with ${name}`, status) });
        await pairings.save(pairing);
        return connectTo(pairing, `Paired with ${pairing.desktopName}. This device can ${LEVELS[pairing.level] || 'look'}.`);
    } catch (error) {
        show(error instanceof Refused ? reasonOf(error) : `Pairing with ${name} failed.`, error instanceof Refused ? '' : reasonOf(error));
        return showDesktops({ keepMessage: true });
    }
}

async function showDesktops({ keepMessage = false } = {}) {
    let desktops;
    try {
        desktops = await api.desktops();
    } catch (error) {
        show('Your desktops couldn\'t be listed.', reasonOf(error), [button('Try Again', () => showDesktops())]);
        return;
    }
    const kept = await pairings.all();
    // Only this account's desktops are listed, so another account's pairings never show.
    const items = desktops.map(desktop => {
        const pairing = kept.find(item => item.desktopId === `${desktop.desktopId}`.toLowerCase());
        const item = document.createElement('li');
        const name = document.createElement('span');
        name.className = 'name';
        name.textContent = desktop.name;
        const state = document.createElement('span');
        state.className = 'state';
        state.textContent = `${desktop.online ? 'Online' : 'Offline'}${pairing ? '' : ' · not paired with this device'}`;
        item.append(name, state);
        if (pairing) {
            item.append(
                button('Connect', () => connectTo(pairing)),
                button('Forget', async () => {
                    await pairings.remove(pairing.desktopId);
                    showDesktops();
                }, { secondary: true }),
            );
        }
        return item;
    });
    $('desktops').replaceChildren(...items);
    $('desktops-section').hidden = false;
    if (!keepMessage) {
        show(desktops.length ? 'Choose a desktop to connect to.' : 'None of your desktops have Remote Access on.');
    }
}

async function connectTo(pairing, note = '') {
    $('desktops-section').hidden = true;
    show(`Connecting to ${pairing.desktopName}`, note);
    let connection;
    try {
        connection = await connect(pairing, api);
    } catch (error) {
        sessionStorage.removeItem(CONNECTED_KEY);
        show(`Couldn't connect to ${pairing.desktopName}.`, reasonOf(error), [
            button('Try Again', () => connectTo(pairing)),
            button('Your Desktops', () => showDesktops(), { secondary: true }),
        ]);
        if (error instanceof Refused) $('detail').textContent = reasonOf(error);
        return;
    }
    sessionStorage.setItem(CONNECTED_KEY, pairing.desktopId);
    current = connection;
    document.body.classList.add('connected');
    $('connected-to').textContent = `Task Proxy on ${pairing.desktopName}`;
    $('connected-bar').hidden = false;
    $('disconnect').onclick = () => {
        sessionStorage.removeItem(CONNECTED_KEY);
        connection.close('Disconnected.');
    };
    connection.onClose(reason => {
        if (current === connection) current = null;
        closeApp($('app'));
        document.body.classList.remove('connected');
        $('connected-bar').hidden = true;
        show(reason, '', [
            button('Connect Again', () => connectTo(pairing)),
            button('Your Desktops', () => showDesktops(), { secondary: true }),
        ]);
    });
    try {
        await openApp($('app'), connection, { level: pairing.level, deviceName: pairing.name, desktopName: pairing.desktopName });
    } catch (error) {
        connection.close(`Task Proxy couldn't open on this device: ${reasonOf(error)}`);
    }
}

const run = () => start().catch(error => show('Something went wrong.', reasonOf(error), [button('Reload', () => location.reload())]));
// A QR code scanned, or a sign-in finished, while this page is open in the tab changes only the address's # part,
// which doesn't load the page again.
window.addEventListener('hashchange', () => {
    if (!location.hash.startsWith('#pair=') && !location.hash.startsWith('#myfi-signin=')) return;
    if (current) {
        sessionStorage.removeItem(CONNECTED_KEY);
        current.close('Disconnected to pair another desktop.');
    }
    run();
});
run();
