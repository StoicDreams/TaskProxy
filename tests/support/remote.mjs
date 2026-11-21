import { test as base, expect } from '@playwright/test';
import http from 'node:http';
import { randomUUID } from 'node:crypto';
import { existsSync, readFileSync, readdirSync, statSync } from 'node:fs';
import { homedir } from 'node:os';
import { extname, join, normalize, sep } from 'node:path';
import { fileURLToPath } from 'node:url';
import { resolveSiteFile, serveLiveCdn } from './site.mjs';

// Remote Connections needs real service workers and real WebRTC, so these tests serve the site from a local server
// rather than answering requests in the page as the other site tests do. A second page plays Task Proxy on a
// computer (fixtures/remote/desktop.js), and api.myfi.ws's remote endpoints are mocked in `mockApi`.
const FIXTURES = fileURLToPath(new URL('../fixtures/remote', import.meta.url));
const MIME = {
    '.js': 'text/javascript', '.mjs': 'text/javascript', '.json': 'application/json', '.css': 'text/css', '.html': 'text/html',
    '.svg': 'image/svg+xml', '.png': 'image/png', '.md': 'text/plain', '.webmanifest': 'application/manifest+json',
};

/** The test computer's fixed public key (fixtures/remote/desktop.js), and the code that key gives. */
export const FIXED_PUBLIC_KEY = 'BDQklSCQV2O_sD6Q3SzG9W2MHIsh1ujx6LVXDiQ_CIuyQc5EFRX2eOd0P6WPbcA-apvXKZ0ZWyvOAS2NuCxn0yY';
export const FIXED_CODE = 'C4P-SCS';

/**
 * A Chromium that can make WebRTC connections between two pages here: Playwright's own headless build, the newest
 * installed, which on CI is the one `npx playwright install chromium` installs. Some distributions' Chromium, such as
 * Arch's 156, offers no addresses at all when Playwright drives it, so no connection can form. PW_WEBRTC_CHROMIUM
 * names another. Undefined leaves Playwright's default.
 */
export function webrtcChromium() {
    if (process.env.PW_WEBRTC_CHROMIUM) return process.env.PW_WEBRTC_CHROMIUM;
    const browsers = process.env.PLAYWRIGHT_BROWSERS_PATH || join(homedir(), process.platform === 'darwin' ? 'Library/Caches/ms-playwright' : process.platform === 'win32' ? 'AppData/Local/ms-playwright' : '.cache/ms-playwright');
    const executable = {
        linux: 'chrome-headless-shell-linux64/chrome-headless-shell',
        darwin: `chrome-headless-shell-mac-${process.arch === 'arm64' ? 'arm64' : 'x64'}/chrome-headless-shell`,
        win32: 'chrome-headless-shell-win64/chrome-headless-shell.exe',
    }[process.platform];
    if (!executable || !existsSync(browsers)) return undefined;
    return readdirSync(browsers)
        .filter(name => /^chromium_headless_shell-\d+$/.test(name))
        .sort((a, b) => Number(b.split('-')[1]) - Number(a.split('-')[1]))
        .map(name => join(browsers, name, executable))
        .find(file => existsSync(file));
}

function fixtureFile(pathname) {
    const file = normalize(join(FIXTURES, decodeURIComponent(pathname)));
    return file.startsWith(FIXTURES + sep) && existsSync(file) && statSync(file).isFile() ? file : null;
}

/** Serves the site as IIS does, with /remote/ as its own page, and the test fixtures under /__fixtures/. */
function startServer() {
    const requests = [];
    const server = http.createServer((request, response) => {
        const { pathname } = new URL(request.url, 'http://localhost');
        requests.push(pathname);
        const send = (status, type, body) => {
            response.writeHead(status, { 'content-type': type, 'cache-control': 'no-store' });
            response.end(body);
        };
        if (pathname.startsWith('/__fixtures/')) {
            const name = pathname.substring('/__fixtures'.length);
            if (name === '/blank.html') return send(200, 'text/html', '<!DOCTYPE html><html><head></head><body></body></html>');
            const file = fixtureFile(name);
            return file ? send(200, MIME[extname(file)] || 'application/octet-stream', readFileSync(file)) : send(404, 'text/plain', 'Not Found');
        }
        // web.config rewrites /remote/ to the Remote Connections page, which resolveSiteFile does for any folder.
        const file = resolveSiteFile(pathname);
        if (file) return send(200, MIME[extname(file)] || 'application/octet-stream', readFileSync(file));
        if (extname(pathname)) return send(404, 'text/plain', 'Not Found');
        // Every other page route is the site itself, which the app in the frame must never reach.
        return send(200, 'text/html', '<!DOCTYPE html><html><body><h1 id="website">TaskProxy.com</h1></body></html>');
    });
    return new Promise(resolve => server.listen(0, 'localhost', () => resolve({ server, requests, origin: `http://localhost:${server.address().port}` })));
}

/**
 * api.myfi.ws as Remote Connections uses it: sign-in, the signed-in account's computers, and the one offer and one
 * answer it passes between a browser and a computer (Apis/Databases' api_*remote* functions).
 */
export function mockApi() {
    const state = {
        signedIn: false,
        /** `{desktopId, name, publicKey, active, lastSeen}`, as GET remote/desktops lists them. */
        desktops: [],
        /** Connection requests by id: `{desktopId, offer, answer, taken}`. */
        connections: new Map(),
        /** Every call, as `{method, path, body}`. */
        calls: [],
        /** How many answers browsers have been given. */
        answersGiven: 0,
        /** Requests end at once, as when the computer never answers in the API's 60 seconds. */
        requestsEnd: false,
        /** The servers GET remote/servers lists. */
        iceServers: [{ urls: 'stun:api.myfi.ws:3478' }],
    };
    state.handle = async route => {
        const request = route.request();
        const url = new URL(request.url());
        const path = url.pathname.replace(/^\//, '');
        const method = request.method();
        const headers = {
            'access-control-allow-origin': request.headers().origin || '*',
            'access-control-allow-credentials': 'true',
            'access-control-allow-headers': 'content-type',
            'access-control-allow-methods': 'GET, POST, DELETE',
        };
        if (method === 'OPTIONS') return route.fulfill({ status: 204, headers });
        const body = request.postData() ? JSON.parse(request.postData()) : {};
        state.calls.push({ method, path, body });
        const reply = (status, value) => route.fulfill({
            status, headers: { ...headers, 'content-type': typeof value === 'string' ? 'text/plain' : 'application/json' },
            body: typeof value === 'string' ? value : JSON.stringify(value),
        });
        const desktop = id => state.desktops.find(item => item.desktopId === id);
        switch (`${method} ${path}`) {
            case 'POST user/signin/code':
                // As when a browser blocks api.myfi.ws's cookie: the code is accepted, and no session is kept.
                // The API answers a sign-in in plain text, not JSON.
                if (body.code === 'cookie-blocked-code') return reply(200, 'Signin Successful');
                if (body.code !== 'good-code') return reply(400, 'That sign-in code was refused.');
                state.signedIn = true;
                return reply(200, 'Signin Successful');
            case 'GET user/roles':
                return reply(200, state.signedIn ? '1' : '0');
            case 'GET remote/desktops':
                if (!state.signedIn) return reply(401, '');
                return reply(200, { desktops: state.desktops });
            case 'GET remote/servers':
                if (!state.signedIn) return reply(401, '');
                return reply(200, { iceServers: state.iceServers });
            case 'POST remote/connect': {
                if (!state.signedIn) return reply(401, '');
                if (!desktop(body.desktopId)) return reply(404, 'This computer isn\'t on your account, or Remote Connections is off on it.');
                if (typeof body.offer !== 'string' || body.offer.length > 16384) return reply(400, 'offer must be at most 16 KB');
                const waiting = [...state.connections.values()].filter(item => item.desktopId === body.desktopId && !item.taken);
                if (waiting.length >= 5) return reply(429, 'Too many connections are waiting for this computer. Check that Task Proxy is open on it.');
                const connectionId = randomUUID();
                state.connections.set(connectionId, { desktopId: body.desktopId, offer: body.offer, answer: null, taken: false });
                return reply(200, { connectionId, active: !!desktop(body.desktopId).active });
            }
            case 'GET remote/connect': {
                if (!state.signedIn) return reply(401, '');
                const connectionId = url.searchParams.get('connectionId');
                const connection = state.connections.get(connectionId);
                if (!connection || state.requestsEnd) return reply(404, 'The computer didn\'t answer in time. Check that Task Proxy is open on it, and try again.');
                if (connection.answer === null) return reply(202, '');
                state.connections.delete(connectionId);
                state.answersGiven++;
                return reply(200, { answer: connection.answer });
            }
            case 'DELETE remote/desktop':
                if (!state.signedIn) return reply(401, '');
                state.desktops = state.desktops.filter(item => item.desktopId !== body.desktopId);
                return reply(200, {});
            // The computer's side, signed in with its app session.
            case 'POST remote/desktop/connections': {
                const waiting = [...state.connections].filter(([, item]) => item.desktopId === body.desktopId && !item.taken);
                for (const [, item] of waiting) item.taken = true;
                return reply(200, { connections: waiting.map(([connectionId, item]) => ({ connectionId, offer: item.offer })) });
            }
            case 'POST remote/desktop/answer': {
                const connection = state.connections.get(body.connectionId);
                if (connection) connection.answer = body.answer;
                return reply(200, {});
            }
            default:
                return reply(404, '');
        }
    };
    /** The calls a browser made to one endpoint. */
    state.callsTo = (method, path) => state.calls.filter(call => call.method === method && call.path === path);
    return state;
}

/** Routes a browser context's requests to the mocked API and the framework's real stylesheet. */
async function routeContext(context, api) {
    await context.route('https://api.myfi.ws/**', api.handle);
    // Web UI's real stylesheet, as the live page loads it, since its rules for the app shell reach this page too.
    await context.route('https://cdn.myfi.ws/**', route => serveLiveCdn(route));
    // The page is given the API's servers, which the tests record. The connection itself is made without them, so no
    // test asks a server outside this computer for its address.
    await context.addInitScript(() => {
        const Native = window.RTCPeerConnection;
        window.peerSettings = [];
        window.RTCPeerConnection = function (settings) {
            window.peerSettings.push(JSON.parse(JSON.stringify(settings ?? null)));
            return new Native({ ...settings, iceServers: [] });
        };
        window.RTCPeerConnection.prototype = Native.prototype;
    });
}

export const test = base.extend({
    site: [async ({}, use) => {
        const site = await startServer();
        await use(site);
        site.server.close();
    }, { scope: 'worker' }],
    api: async ({ context }, use) => {
        const api = mockApi();
        await routeContext(context, api);
        await use(api);
    },
    /** The test computer, with Remote Connections on, reading its connection requests. */
    desktop: async ({ context, site, api }, use) => {
        const page = await context.newPage();
        await page.goto(`${site.origin}/__fixtures/desktop.html`);
        await page.waitForFunction(() => window.desktopReady);
        const { id, publicKey } = await page.evaluate(() => ({ id: window.desktop.id, publicKey: window.desktop.publicKey }));
        api.desktops.push({ desktopId: id, name: 'Test Desktop', publicKey, active: true, lastSeen: Date.now() });
        // Reads until the test ends, so it is never awaited.
        page.evaluate(() => window.desktop.run()).catch(() => { });
        await use(page);
        await page.evaluate(() => { window.desktop.running = false; }).catch(() => { });
    },
    /** A page in a second browser, with its own storage and so its own key, signed in to the same account. */
    otherPage: async ({ browser, api }, use) => {
        const context = await browser.newContext({ serviceWorkers: 'allow' });
        await routeContext(context, api);
        const page = await context.newPage();
        const errors = [];
        page.on('pageerror', error => errors.push(error.stack || error.message));
        await use(page);
        expect(errors, 'Uncaught errors happened in the second browser while this test ran').toEqual([]);
        await context.close();
    },
    page: async ({ page }, use) => {
        const errors = [];
        page.on('pageerror', error => errors.push(error.stack || error.message));
        await use(page);
        expect(errors, 'Uncaught errors happened while this test ran').toEqual([]);
    },
});

export { expect };

/** The frame the app runs in on the Remote Connections page. */
export const appFrame = page => page.frameLocator('#app');
