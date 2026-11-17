/* Display all app versions. */
"use strict"
{
    const template = `
    <webui-button slot="tabs">Windows</webui-button>
    <webui-flex gap="20" slot="content" theme="inherit" id="latest-windows">Loading Windows release data...</webui-flex>
    <webui-button slot="tabs">Mac</webui-button>
    <webui-flex gap="20" slot="content" theme="inherit" id="latest-mac">Loading Mac release data...</webui-flex>
    <webui-button slot="tabs">Linux / Ubuntu</webui-button>
    <webui-flex gap="20" slot="content" theme="inherit" id="latest-ubuntu">Loading Linux release data...</webui-flex>`;
    function sortVersions(items) {
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
    }
    webui.define("app-all-versions", {
        constructor() {
            const t = this;
            t._title = webui.create('h2', { html: 'Task Proxy Desktop Releases' });
            t._tabs = webui.create('webui-tabs', { html: template, theme: 'secondary', index: '1', 'transition-timing': '200', 'data-subscribe': 'session-platform-tab-index:setTab' });
        },
        attr: ['example'],
        attrChanged(property, value) {
            const t = this;
            switch (property) {
                case 'example':
                    break;
            }
        },
        connected() {
            const t = this;
            t.parentNode.insertBefore(t._title, t);
            t.parentNode.insertBefore(t._tabs, t);
            t.remove();
            let tabWin = t._tabs.querySelector('#latest-windows');
            let tabMac = t._tabs.querySelector('#latest-mac');
            let tabUbuntu = t._tabs.querySelector('#latest-ubuntu');
            // Names, versions, and links in apps.json are data, so they are set as text and attributes, never as HTML.
            function fileName(name) {
                return name.endsWith('.msi') ? "Windows x64 MSI Installer" : name.endsWith('.exe') ? "Windows x64 EXE Installer" : name.endsWith('.dmg') ? "Mac DMG" : name.endsWith('.deb') ? "Linux amd64 DEB" : name.endsWith('.AppImage') ? "Linux amd64 AppImage" : name;
            }
            function addTabContent(container, platform, items, versions) {
                if (!items || items.length === 0) {
                    container.innerText = `There are currently no releases available for ${platform}.`;
                    return;
                }
                sortVersions(items);
                let tabs = webui.create('webui-tabs', { theme: 'tertiary', vertical: '' });
                let version = null;
                let files = null;
                let notes = null;
                items.forEach(item => {
                    if (version !== item.version) {
                        // Release notes of every version but the last listed stack their content in a column.
                        if (notes) notes.className = 'd-flex gap-0 flex-column';
                        version = item.version;
                        let notesFile = versions && versions[version];
                        let grid = webui.create('webui-grid', { columns: `${(notesFile ? "max-content " : "")}1fr`, gap: '20', class: 'pa-3', slot: 'content', theme: 'inherit' });
                        files = webui.create('webui-flex', { column: '', gap: '20' });
                        grid.appendChild(files);
                        notes = notesFile ? webui.create('webui-content', { nest: '', cache: '', src: `https://cdn.myfi.ws/apps/task-proxy/${notesFile}` }) : null;
                        if (notes) grid.appendChild(notes);
                        tabs.append(webui.create('webui-button', { slot: 'tabs', text: version }), grid);
                    }
                    files.appendChild(webui.create('a', { text: fileName(item.name), href: item.file }));
                });
                container.replaceChildren(tabs);
            }
            webui.fetchWithCache('https://cdn.myfi.ws/apps/task-proxy/apps.json', true).then(json => {
                addTabContent(tabWin, 'Windows', json.win, json.versions);
                addTabContent(tabMac, 'Mac', json.mac, json.versions);
                addTabContent(tabUbuntu, 'Linux/Ubuntu', json.ubu, json.versions);
            }).catch(_ => {
                tabWin.innerText = `Failed to load Windows release data.`;
                tabMac.innerText = `Failed to load Mac release data.`;
                tabUbuntu.innerText = `Failed to load Linux release data.`;
            });
        }
    });

}