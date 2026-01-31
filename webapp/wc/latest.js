/* Display the latest app versions. */
"use strict"
{
    const template = `
    <webui-button slot="tabs">Windows</webui-button>
    <webui-flex gap="20" class="pa-3" slot="content" theme="inherit" id="latest-windows">Loading Windows release data...</webui-flex>
    <webui-button slot="tabs">Mac</webui-button>
    <webui-flex gap="20" class="pa-3" slot="content" theme="inherit" id="latest-mac">Loading Mac release data...</webui-flex>
    <webui-button slot="tabs">Linux / Ubuntu</webui-button>
    <webui-flex gap="20" class="pa-3" slot="content" theme="inherit" id="latest-ubuntu">Loading Linux release data...</webui-flex>`;
    function getLatest(items) {
        let results = [];
        // sort items by version
        items.sort((a, b) => {
            let aVersion = a.version.split('.');
            let bVersion = b.version.split('.');
            if (parseInt(aVersion[0]) > parseInt(bVersion[0])) {
                return -1;
            }
            if (parseInt(aVersion[0]) < parseInt(bVersion[0])) {
                return 1;
            }
            if (parseInt(aVersion[1]) > parseInt(bVersion[1])) {
                return -1;
            }
            if (parseInt(aVersion[1]) < parseInt(bVersion[1])) {
                return 1;
            }
            if (parseInt(aVersion[2]) > parseInt(bVersion[2])) {
                return -1;
            }
            if (parseInt(aVersion[2]) < parseInt(bVersion[2])) {
                return 1;
            }
            return 0;
        });
        let useVersion = items[0].version;
        items.forEach(item => {
            if (item.version === useVersion) {
                results.push(item);
            }
        });
        return results;
    }
    webui.define("app-latest", {
        constructor() {
            const t = this;
            t._title = webui.create('h2', { html: 'Latest Release' });
            t._tabs = webui.create('webui-tabs', { html: template, theme: 'secondary', index: '1', 'transition-timing': '200', 'data-subscribe': 'session-platform-tab-index:setTab' });
        },
        connected() {
            const t = this;
            t.parentNode.insertBefore(t._title, t);
            t.parentNode.insertBefore(t._tabs, t);
            let rnp = document.createTextNode("");
            t.parentNode.insertBefore(rnp, t);
            t.remove();
            let tabWin = t._tabs.querySelector('#latest-windows');
            let tabMac = t._tabs.querySelector('#latest-mac');
            let tabUbuntu = t._tabs.querySelector('#latest-ubuntu');
            webui.fetchWithCache('https://cdn.myfi.ws/apps/task-proxy/apps.json', true).then(json => {
                if (json.win && json.win.length > 0) {
                    let latest = getLatest(json.win);
                    let version = `${latest[0].version}`;
                    t._title.innerHTML = `Latest Release (Version ${version})`;
                    tabWin.innerHTML = ``;
                    latest.forEach(item => {
                        let name = item.name.endsWith('.msi') ? "Windows x64 MSI Installer" : item.name.endsWith('.exe') ? "Windows x64 EXE Installer" : item.name;
                        tabWin.appendChild(webui.create('a', { 'html': name, 'href': item.file }));
                    });
                    if (json.versions[version]) {
                        rnp.parentNode.insertBefore(webui.create('webui-content', { cache: true, src: `https://cdn.myfi.ws/apps/task-proxy/${json.versions[version]}` }), rnp);
                    }
                } else {
                    tabWin.innerHTML = `There are currently no releases available for Windows.`;
                }
                if (json.mac && json.mac.length > 0) {
                    let latest = getLatest(json.mac);
                    tabMac.innerHTML = ``;
                    latest.forEach(item => {
                        let name = item.name.endsWith('.dmg') ? "Mac DMG" : item.name;
                        tabMac.appendChild(webui.create('a', { 'html': name, 'href': item.file }));
                    });

                } else {
                    tabMac.innerHTML = `There are currently no releases available for Mac.`;
                }
                if (json.ubu && json.ubu.length > 0) {
                    let latest = getLatest(json.ubu);
                    tabUbuntu.innerHTML = ``;
                    latest.forEach(item => {
                        let name = item.name.endsWith('.deb') ? "Linux amd64 DEB" : item.name.endsWith('.AppImage') ? "Linux amd64 AppImage" : item.name;
                        tabUbuntu.appendChild(webui.create('a', { 'html': name, 'href': item.file }));
                    });
                } else {
                    tabUbuntu.innerHTML = `There are currently no releases available for Linux/Ubuntu.`;
                }
            }).catch(_ => {
                tabWin.innerHTML = `Failed to load Windows release data.`;
                tabMac.innerHTML = `Failed to load Mac release data.`;
                tabUbuntu.innerHTML = `Failed to load Linux release data.`;
            })
        }
    });

}