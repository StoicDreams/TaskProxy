// Registered by /remote/ with the scope /remote/app/, where the Task Proxy app runs in a frame. It controls the frame
// because the frame first loads inside that path, and from then on it answers every request the frame makes, whatever
// its path, from the computer: the app's files are Task Proxy's own, sent over the connection. Requests to other sites, such as the CDN, go to the network as usual.
//
// It keeps nothing between events, since the browser stops an idle service worker and its memory with it:
// - The frame's first load names its connection (?c=), and so does a worker the app starts (remote-connection=).
//   The outer page holding that connection answers, and other tabs' outer pages say nothing.
// - Every other request goes to the frame that made it, which passes it to the outer page above it.
self.addEventListener('install', () => self.skipWaiting());
self.addEventListener('activate', event => event.waitUntil(self.clients.claim()));
self.addEventListener('fetch', event => {
    const url = new URL(event.request.url);
    if (url.origin !== location.origin) return;
    // A frame that is going away can't answer, so anything failing is a closed connection.
    event.respondWith(answer(event, url).catch(() => closed()));
});

function closed() {
    return new Response('The connection to the computer is closed.', { status: 503, headers: { 'content-type': 'text/plain' } });
}

function ask(client, request) {
    const channel = new MessageChannel();
    const reply = new Promise(resolve => { channel.port1.onmessage = event => resolve(event.data); });
    client.postMessage({ type: 'remote-fetch', ...request }, [channel.port2]);
    return reply;
}

async function answer(event, url) {
    const navigate = event.request.mode === 'navigate';
    const connection = navigate ? url.searchParams.get('c') : url.searchParams.get('remote-connection');
    url.searchParams.delete('remote-connection');
    const request = {
        path: navigate ? '/' : url.pathname + url.search,
        navigate,
        connection,
        range: event.request.headers.get('range'),
    };
    let reply;
    if (connection) {
        const outers = (await self.clients.matchAll({ type: 'window', includeUncontrolled: true }))
            .filter(client => new URL(client.url).pathname === '/remote/');
        reply = await Promise.any(outers.map(outer => ask(outer, request).then(answer => answer ?? Promise.reject()))).catch(() => null);
    } else {
        const client = event.clientId && await self.clients.get(event.clientId);
        reply = client && await ask(client, request);
    }
    if (!reply) return closed();
    return new Response(reply.body, { status: reply.status, headers: reply.headers });
}
