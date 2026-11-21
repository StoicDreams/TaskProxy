// Remote Connections: sign in, see this account's computers that have Remote Connections on, connect to one, and use
// Task Proxy on it from this browser. The protocol is the Remote Connections Protocol page in the Api repo.
import { api, signInUrl } from './api.js';
import { computers, identity } from './store.js';
import { browserCode, isPublicKey } from './crypto.js';
import { ConnectError, connect } from './connection.js';
import { closeApp, openApp } from './frame.js';

/** The computer this tab is connected to, so reloading connects again. */
const CONNECTED_KEY = 'remote-connected';
/** A browser waiting for approval asks again this often, with a new offer. */
const RETRY_MS = 3000;
/** The approved and waiting browsers are read this often while connected. */
const BROWSERS_MS = 5000;

const $ = id => document.getElementById(id);
/** The open connection. */
let current = null;
/** Stops the connection being made, when there is one. */
let attempt = null;

function button(label, onClick, { secondary = false } = {}) {
    const element = document.createElement('button');
    element.type = 'button';
    element.textContent = label;
    if (secondary) element.className = 'secondary';
    element.addEventListener('click', onClick);
    return element;
}

function span(className, text) {
    const element = document.createElement('span');
    element.className = className;
    element.textContent = text;
    return element;
}

function show(message, detail = '', actions = [], code = '') {
    $('message').textContent = message;
    $('detail').textContent = detail;
    $('browser-code').textContent = code;
    $('code-line').hidden = !code;
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

function when(time) {
    const date = new Date(Number(time));
    return Number(time) > 0 && !isNaN(date) ? date.toLocaleString() : '';
}

/** What this browser calls itself, such as "Firefox on Android", for the person approving it. */
function browserName(agent = navigator.userAgent) {
    const browser = /Edg(e|A|iOS)?\//.test(agent) ? 'Edge'
        : /OPR\/|Opera/.test(agent) ? 'Opera'
        : /Firefox\/|FxiOS\//.test(agent) ? 'Firefox'
        : /Chrome\/|CriOS\//.test(agent) ? 'Chrome'
        : /Safari\//.test(agent) ? 'Safari'
        : 'Browser';
    const system = /Android/.test(agent) ? 'Android'
        : /iPhone|iPod/.test(agent) ? 'iPhone'
        : /iPad/.test(agent) ? 'iPad'
        : /Windows/.test(agent) ? 'Windows'
        : /CrOS/.test(agent) ? 'ChromeOS'
        : /Mac OS X|Macintosh/.test(agent) ? 'Mac'
        : /Linux/.test(agent) ? 'Linux'
        : '';
    return (system ? `${browser} on ${system}` : browser).substring(0, 60);
}

/** Takes `prefix` and what follows off the address, so a code is never bookmarked or shared. */
function takeHash(prefix) {
    if (!location.hash.startsWith(prefix)) return null;
    const value = decodeURIComponent(location.hash.substring(prefix.length));
    history.replaceState(null, '', location.pathname + location.search);
    return value || null;
}

function wait(ms, signal) {
    return new Promise((resolve, reject) => {
        const timer = setTimeout(resolve, ms);
        signal.addEventListener('abort', () => { clearTimeout(timer); reject(signal.reason); }, { once: true });
    });
}

function stopAttempt() {
    attempt?.abort();
    attempt = null;
}

async function start() {
    const code = takeHash('#myfi-signin=');
    if (code) {
        show('Signing in');
        // A refused code stays on the page with the API's reason, rather than being replaced by the sign-in prompt.
        const failed = await api.signIn(code).then(() => null, error => error);
        // A code used twice, such as on a reload, is refused, but a browser already signed in goes on to its computers.
        if (failed && !await api.isSignedIn()) {
            show('Sign-in failed.', reasonOf(failed), [signInLink('Sign In Again')]);
            return;
        }
    }
    if (!await api.isSignedIn()) {
        show(
            code ? 'Sign-in finished, but this browser is still signed out.' : 'Sign in to connect to your computers.',
            code
                ? 'This browser may be blocking the sign-in cookie for api.myfi.ws. Allow cookies for this site, then sign in again.'
                : 'Use the same MyFi account Task Proxy is signed in to on your computer.',
            [signInLink(code ? 'Sign In Again' : 'Sign In')],
        );
        return;
    }
    const reconnect = sessionStorage.getItem(CONNECTED_KEY);
    if (reconnect) {
        const desktop = (await api.desktops().catch(() => [])).find(item => `${item.desktopId}` === reconnect);
        if (desktop) return connectTo(desktop);
        sessionStorage.removeItem(CONNECTED_KEY);
    }
    return showDesktops();
}

async function showDesktops() {
    stopAttempt();
    $('desktops-section').hidden = true;
    let desktops;
    try {
        desktops = await api.desktops();
    } catch (error) {
        show('Your computers couldn\'t be listed.', reasonOf(error), [button('Try Again', () => showDesktops())]);
        return;
    }
    const items = desktops.map(desktop => {
        const item = document.createElement('li');
        const seen = when(desktop.lastSeen);
        item.append(
            span('name', desktop.name),
            span('state', desktop.active ? 'Active' : `Not active${seen ? ` · last seen ${seen}` : ''}`),
            button('Connect', () => connectTo(desktop)),
            button('Turn Off', () => askTurnOff(desktop), { secondary: true }),
        );
        return item;
    });
    $('desktops').replaceChildren(...items);
    const own = await identity();
    $('own').textContent = `This browser is ${browserName()}, with the code ${await browserCode(own.publicKey)}.`;
    $('desktops-section').hidden = false;
    show(desktops.length ? 'Choose a computer to connect to.' : 'None of your computers have Remote Connections on.');
}

function askTurnOff(desktop) {
    $('desktops-section').hidden = true;
    show(
        `Turn off Remote Connections on ${desktop.name}?`,
        'No browser can connect to it after this. It can only be turned on again in Task Proxy on that computer.',
        [
            button('Turn Off', async () => {
                show(`Turning off Remote Connections on ${desktop.name}`);
                try {
                    await api.turnOff(desktop.desktopId);
                } catch (error) {
                    show(`Remote Connections couldn't be turned off on ${desktop.name}.`, reasonOf(error), [button('Your Computers', () => showDesktops())]);
                    return;
                }
                showDesktops();
            }),
            button('Cancel', () => showDesktops(), { secondary: true }),
        ],
    );
}

/** What to say for each way a connection isn't made: the message, then the detail. */
function failureText(name, error) {
    switch (error instanceof ConnectError ? error.kind : '') {
        case 'off':
        case 'busy':
            return [`Couldn't connect to ${name}.`, reasonOf(error)];
        case 'no-answer':
            return [`${name} didn't answer.`, 'Check that Task Proxy is open on it and signed in, then try again.'];
        case 'unsigned':
            return [`${name} didn't answer.`, 'An answer came that wasn\'t signed with the key this browser remembers for that computer, so it was ignored.'];
        case 'refused':
            return [`${name} refused this browser.`, 'It was refused or removed on that computer, or this device\'s clock is more than 2 minutes off. Check the clock, then ask for this browser to be allowed again in Task Proxy\'s Remote Connections settings on that computer.'];
        case 'unreachable':
            return [`This browser and ${name} couldn't reach each other.`, 'The computer answered, but its network and this one don\'t allow a direct connection, and there is no relay. Try from another network, such as the same Wi-Fi or a VPN.'];
        case 'version':
            return [`Couldn't connect to ${name}.`, 'This page and Task Proxy on the computer are different versions. Update Task Proxy on the computer, or reload this page.'];
        default:
            return [`Couldn't connect to ${name}.`, reasonOf(error)];
    }
}

/**
 * Connects to a computer from the list. The first time, its listed key is remembered. After that only the remembered
 * key is believed, and a listed key that differs stops here with a warning, until `trustNewKey` says to replace it.
 */
async function connectTo(desktop, { trustNewKey = false } = {}) {
    stopAttempt();
    const control = attempt = new AbortController();
    const name = desktop.name;
    const cancel = () => button('Cancel', () => showDesktops(), { secondary: true });
    $('desktops-section').hidden = true;
    show(`Connecting to ${name}`, '', [cancel()]);
    try {
        let key = await computers.get(desktop.desktopId);
        if (key && key !== desktop.publicKey && !trustNewKey) {
            sessionStorage.removeItem(CONNECTED_KEY);
            show(
                `${name}'s key has changed.`,
                'This happens when Task Proxy\'s data was removed from that computer and Remote Connections was turned on again. If that isn\'t what happened, something else may be answering in its place, so don\'t continue.',
                [button('Your Computers', () => showDesktops()), button('Trust the New Key', () => connectTo(desktop, { trustNewKey: true }), { secondary: true })],
            );
            return;
        }
        if (key !== desktop.publicKey) {
            if (!isPublicKey(desktop.publicKey)) {
                throw new ConnectError('failed', `${name} is listed without a key this browser can check. Turn Remote Connections off and on again in Task Proxy on it.`);
            }
            key = desktop.publicKey;
            await computers.remember(desktop.desktopId, key);
        }
        const own = await identity();
        let waiting = false;
        for (;;) {
            const result = await connect(desktop, key, own, api, {
                browserName: browserName(),
                signal: control.signal,
                onAsked({ active }) {
                    if (!active && !waiting) show(`Connecting to ${name}`, 'Task Proxy on it hasn\'t checked in lately. Waiting for it to answer.', [cancel()]);
                },
            });
            if (result.status === 'ok') {
                if (control.signal.aborted) return result.connection.close();
                attempt = null;
                return connected(desktop, result.connection);
            }
            if (!waiting) {
                waiting = true;
                show(
                    `Waiting for ${name} to approve this browser`,
                    'Approve it in Task Proxy on that computer, in its Remote Connections settings, or from a browser that is already connected to it. Check first that the code shown there matches this one.',
                    [cancel()],
                    await browserCode(own.publicKey),
                );
            }
            await wait(RETRY_MS, control.signal);
        }
    } catch (error) {
        // Stopped by Cancel or by another connection starting, which shows what comes next.
        if (control.signal.aborted) return;
        attempt = null;
        sessionStorage.removeItem(CONNECTED_KEY);
        const [message, detail] = failureText(name, error);
        show(message, detail, [
            button('Try Again', () => connectTo(desktop)),
            button('Your Computers', () => showDesktops(), { secondary: true }),
        ]);
    }
}

async function connected(desktop, connection) {
    sessionStorage.setItem(CONNECTED_KEY, `${desktop.desktopId}`);
    current = connection;
    document.body.classList.add('connected');
    $('connected-to').textContent = `Task Proxy on ${desktop.name}`;
    $('connected-bar').hidden = false;
    $('disconnect').onclick = () => {
        sessionStorage.removeItem(CONNECTED_KEY);
        connection.close('Disconnected.');
    };
    const stopBrowsers = watchBrowsers(connection);
    connection.onClose(reason => {
        if (current === connection) current = null;
        stopBrowsers();
        closeApp($('app'));
        document.body.classList.remove('connected');
        $('connected-bar').hidden = true;
        show(reason, '', [
            button('Connect Again', () => connectTo(desktop)),
            button('Your Computers', () => showDesktops(), { secondary: true }),
        ]);
    });
    try {
        await openApp($('app'), connection, { deviceName: browserName(), desktopName: desktop.name });
    } catch (error) {
        connection.close(`Task Proxy couldn't open in this browser: ${reasonOf(error)}`);
    }
}

/**
 * Keeps the list of approved and waiting browsers while connected, so this browser can approve or remove another.
 * Each code is worked out here from the browser's key, and a code the computer sent is never shown.
 */
function watchBrowsers(connection) {
    const panel = $('browsers');
    const toggle = $('browsers-button');
    let drawn = 0;
    let shown = '';
    const ask = async (cmd, args = {}) => {
        const turn = ++drawn;
        let list;
        try {
            list = await connection.request(cmd, args);
        } catch (error) {
            if (connection.closed || turn !== drawn) return;
            $('browsers-error').textContent = reasonOf(error);
            $('browsers-error').hidden = false;
            return;
        }
        // Drawn again only when something changed, so a button isn't replaced under a click.
        const text = JSON.stringify(list);
        if (text === shown && turn === drawn) {
            $('browsers-error').hidden = true;
            return;
        }
        const entry = async (browser, state, buttons) => {
            if (!isPublicKey(browser?.key)) return null;
            const item = document.createElement('li');
            item.append(span('code', await browserCode(browser.key)), span('name', `${browser.name || 'Browser'}`.substring(0, 60)), span('state', state(browser)), ...buttons(browser));
            return item;
        };
        const waiting = (await Promise.all((Array.isArray(list?.waiting) ? list.waiting : []).map(browser => entry(
            browser,
            item => `Asked ${when(item.asked)}`.trim(),
            item => [
                button('Approve', () => ask('remote_browser_approve', { key: item.key })),
                button('Refuse', () => ask('remote_browser_remove', { key: item.key }), { secondary: true }),
            ],
        )))).filter(Boolean);
        const approved = (await Promise.all((Array.isArray(list?.approved) ? list.approved : []).map(browser => entry(
            browser,
            item => `${item.current ? 'This browser · ' : ''}Approved ${when(item.added)}`.trim(),
            item => [button(item.current ? 'Remove This Browser' : 'Remove', () => ask('remote_browser_remove', { key: item.key }), { secondary: true })],
        )))).filter(Boolean);
        if (connection.closed || turn !== drawn) return;
        shown = text;
        $('browsers-error').hidden = true;
        $('browsers-waiting').replaceChildren(...waiting);
        $('browsers-approved').replaceChildren(...approved);
        $('browsers-none').hidden = waiting.length > 0;
        toggle.textContent = waiting.length ? `Browsers (${waiting.length} waiting)` : 'Browsers';
    };
    const open = isOpen => {
        panel.hidden = !isOpen;
        toggle.setAttribute('aria-expanded', `${isOpen}`);
    };
    toggle.onclick = () => {
        open(panel.hidden);
        if (!panel.hidden) ask('remote_browsers');
    };
    const timer = setInterval(() => ask('remote_browsers'), BROWSERS_MS);
    ask('remote_browsers');
    return () => {
        clearInterval(timer);
        drawn++;
        open(false);
        toggle.textContent = 'Browsers';
        $('browsers-waiting').replaceChildren();
        $('browsers-approved').replaceChildren();
    };
}

const run = () => start().catch(error => show('Something went wrong.', reasonOf(error), [button('Reload', () => location.reload())]));
// A sign-in finished while this page is open in the tab changes only the address's # part, which doesn't load the
// page again.
window.addEventListener('hashchange', () => {
    if (location.hash.startsWith('#myfi-signin=')) run();
});
run();
