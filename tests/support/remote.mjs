import { test as base, expect } from '@playwright/test';
import http from 'node:http';
import { existsSync, readFileSync, readdirSync, statSync } from 'node:fs';
import { homedir } from 'node:os';
import { extname, join, normalize, sep } from 'node:path';
import { fileURLToPath } from 'node:url';
import { ROOT_FILES, resolveSiteFile, serveLiveCdn } from './site.mjs';

// Task Proxy Remote needs real service workers and real WebRTC, so these tests serve the site from a local server
// rather than answering requests in the page as the other site tests do. A second page plays Task Proxy on a
// desktop (fixtures/remote/desktop.js), and api.myfi.ws's mailbox is mocked in `mockApi`.
const FIXTURES = fileURLToPath(new URL('../fixtures/remote', import.meta.url));
const MIME = {
    '.js': 'text/javascript', '.mjs': 'text/javascript', '.json': 'application/json', '.css': 'text/css', '.html': 'text/html',
    '.svg': 'image/svg+xml', '.png': 'image/png', '.md': 'text/plain', '.webmanifest': 'application/manifest+json',
};

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

/** The import map from the remote page, so test pages load the noble libraries the same way. */
export function importMap() {
    return readFileSync(join(ROOT_FILES, 'remote', 'index.html'), 'utf8').match(/<script type="importmap">[\s\S]*?<\/script>/)[0];
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
            if (name === '/desktop.html') return send(200, 'text/html', readFileSync(join(FIXTURES, 'desktop.html'), 'utf8').replace('__IMPORT_MAP__', importMap()));
            if (name === '/blank.html') return send(200, 'text/html', `<!DOCTYPE html><html><head>${importMap()}</head><body></body></html>`);
            const file = fixtureFile(name);
            return file ? send(200, MIME[extname(file)] || 'application/octet-stream', readFileSync(file)) : send(404, 'text/plain', 'Not Found');
        }
        // web.config rewrites /remote/ to the remote page.
        const file = resolveSiteFile(/^\/remote\/?$/.test(pathname) ? '/remote/index.html' : pathname);
        if (file) return send(200, MIME[extname(file)] || 'application/octet-stream', readFileSync(file));
        if (extname(pathname)) return send(404, 'text/plain', 'Not Found');
        // Every other page route is the site itself, which the app in the frame must never reach.
        return send(200, 'text/html', '<!DOCTYPE html><html><body><h1 id="website">TaskProxy.com</h1></body></html>');
    });
    return new Promise(resolve => server.listen(0, 'localhost', () => resolve({ server, requests, origin: `http://localhost:${server.address().port}` })));
}

/**
 * api.myfi.ws as Task Proxy Remote uses it: sign-in, the signed-in account's desktops, and the mailbox between
 * devices and desktops (Apis/Databases' api_post_remote_* functions). `account` is who this browser is signed in as.
 */
export function mockApi() {
    const state = {
        signedIn: false,
        account: 1,
        desktops: [],
        toDesktop: [],
        replies: new Map(),
        calls: [],
        /** Answers remote/message/send with this status and reason, as the API refuses another account. */
        refuseSend: null,
    };
    state.handle = async route => {
        const request = route.request();
        const url = new URL(request.url());
        const path = url.pathname.replace(/^\//, '');
        const origin = request.headers().origin || '*';
        const headers = {
            'access-control-allow-origin': origin,
            'access-control-allow-credentials': 'true',
            'access-control-allow-headers': 'content-type',
            'access-control-allow-methods': 'GET, POST, DELETE',
        };
        if (request.method() === 'OPTIONS') return route.fulfill({ status: 204, headers });
        const body = request.postData() ? JSON.parse(request.postData()) : {};
        state.calls.push({ path, body });
        const reply = (status, value) => route.fulfill({
            status, headers: { ...headers, 'content-type': typeof value === 'string' ? 'text/plain' : 'application/json' },
            body: typeof value === 'string' ? value : JSON.stringify(value),
        });
        const desktop = id => state.desktops.find(item => item.desktopId === id);
        switch (path) {
            case 'user/signin/code':
                // As when a browser blocks api.myfi.ws's cookie: the code is accepted, and no session is kept.
                if (body.code === 'cookie-blocked-code') return reply(200, '');
                if (body.code !== 'good-code') return reply(400, 'That sign-in code was refused.');
                state.signedIn = true;
                return reply(200, '');
            case 'user/roles':
                return reply(200, state.signedIn ? '1' : '0');
            case 'remote/desktops':
                if (!state.signedIn) return reply(401, '');
                return reply(200, { desktops: state.desktops.filter(item => item.account === state.account).map(({ desktopId, name, online }) => ({ desktopId, name, online, fingerprint: '', lastSeen: '' })) });
            case 'remote/message/send': {
                if (!state.signedIn) return reply(401, '');
                if (state.refuseSend) return reply(state.refuseSend.status, state.refuseSend.reason);
                const to = desktop(body.desktopId);
                if (!to || to.account !== state.account) return reply(403, 'This desktop isn\'t on your account. Sign in to the account the desktop is signed in to.');
                state.toDesktop.push({ desktopId: body.desktopId, reply: body.reply, from: state.account, message: body.message });
                return reply(200, { online: to.online });
            }
            case 'remote/replies': {
                if (!state.signedIn) return reply(401, '');
                const messages = state.replies.get(body.reply) || [];
                state.replies.delete(body.reply);
                return reply(200, { messages });
            }
            // The desktop's side, signed in with its app session.
            case 'remote/messages': {
                const messages = state.toDesktop.filter(item => item.desktopId === body.desktopId);
                state.toDesktop = state.toDesktop.filter(item => item.desktopId !== body.desktopId);
                return reply(200, { messages: messages.map(({ reply: mailbox, from, message }) => ({ reply: mailbox, from, message })) });
            }
            case 'remote/reply/send': {
                const list = state.replies.get(body.reply) || [];
                list.push({ desktopId: body.desktopId, message: body.message });
                state.replies.set(body.reply, list);
                return reply(200, {});
            }
            default:
                return reply(404, '');
        }
    };
    return state;
}

export const test = base.extend({
    site: [async ({}, use) => {
        const site = await startServer();
        await use(site);
        site.server.close();
    }, { scope: 'worker' }],
    api: async ({ context }, use) => {
        const api = mockApi();
        await context.route('https://api.myfi.ws/**', api.handle);
        // Web UI's real stylesheet, as the live page loads it, since its rules for the app shell reach this page too.
        await context.route('https://cdn.myfi.ws/**', route => serveLiveCdn(route));
        await use(api);
    },
    /** The test desktop, signed in to `api.account` and registered, reading its mailbox. */
    desktop: async ({ context, site, api }, use) => {
        const page = await context.newPage();
        await page.goto(`${site.origin}/__fixtures/desktop.html`);
        await page.waitForFunction(() => window.desktopReady);
        const id = await page.evaluate(() => window.desktop.id);
        api.desktops.push({ desktopId: id, name: 'Test Desktop', account: api.account, online: true });
        // Reads until the test ends, so it is never awaited.
        page.evaluate(() => window.desktop.run()).catch(() => { });
        await use(page);
        await page.evaluate(() => { window.desktop.running = false; }).catch(() => { });
    },
    page: async ({ page }, use) => {
        const errors = [];
        page.on('pageerror', error => errors.push(error.stack || error.message));
        await use(page);
        expect(errors, 'Uncaught errors happened while this test ran').toEqual([]);
    },
});

export { expect };

/** The frame the app runs in on the remote page. */
export const appFrame = page => page.frameLocator('#app');
