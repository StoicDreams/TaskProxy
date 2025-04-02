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
    function sortVersions(items){
        // sort items by version
        items.sort((a,b)=>{
            let aVersion = a.version.split('.');
            let bVersion = b.version.split('.');
            if (aVersion[0] > bVersion[0]){
                return -1;
            }
            if (aVersion[0] < bVersion[0]){
                return 1;
            }
            if (aVersion[1] > bVersion[1]){
                return -1;
            }
            if (aVersion[1] < bVersion[1]){
                return 1;
            }
            if (aVersion[2] > bVersion[2]){
                return -1;
            }
            if (aVersion[2] < bVersion[2]){
                return 1;
            }
            return 0;
        });
    }
    webui.define("app-all-versions", {
        constructor: (t) => {
            t._title = webui.create('h2',{html:'Task Proxy Desktop Releases'});
            t._tabs = webui.create('webui-tabs', {html: template, theme:'secondary',index:'1','transition-timing':'200','data-subscribe':'session-platform-tab-index:setTab'});
         },
        attr: ['example'],
        attrChanged: (t, property, value) => {
            switch (property) {
                case 'example':
                    break;
            }
        },
        connected: function (t) {
            t.parentNode.insertBefore(t._title, t);
            t.parentNode.insertBefore(t._tabs, t);
            t.remove();
            let tabWin = t._tabs.querySelector('#latest-windows');
            let tabMac = t._tabs.querySelector('#latest-mac');
            let tabUbuntu = t._tabs.querySelector('#latest-ubuntu');
            function addTabContent(container, items, versions){
                sortVersions(items);
                let html = '';
                let version = '0.0.0';
                items.forEach(item=>{
                    if (version != item.version) {
                        if (version != '0.0.0') {
                            html = `${html}</webui-flex>`;
                            if (versions[version]) {
                                html = `${html}<webui-content class="d-flex gap-1 flex-column" nest cache src="https://cdn.myfi.ws/apps/task-proxy/${versions[version]}"></webui-content>`;
                            }
                            html = `${html}</webui-grid>`
                        }
                        version = item.version;
                        html = `${html}<webui-button slot="tabs">${version}</webui-button><webui-grid columns="${(versions[version] ? "max-content " : "")}1fr" gap="20" class="pa-3" slot="content" theme="inherit" id="latest-windows"><webui-flex column gap="20">`
                    }
                    let name = item.name.endsWith('.msi') ? "Windows x64 MSI Installer" : item.name.endsWith('.exe') ? "Windows x64 EXE Installer" : item.name.endsWith('.dmg') ? "Mac DMG" : item.name.endsWith('.deb') ? "Linux amd64 DEB" : item.name.endsWith('.AppImage') ? "Linux amd64 AppImage" : item.name;
                    html = `${html}<a href="${item.file}">${name}</a>`;
                });

                if (version != '0.0.0') {
                    html = `${html}</webui-flex>`;
                    if (versions[version]) {
                        html = `${html}<webui-content nest cache src="https://cdn.myfi.ws/apps/task-proxy/${versions[version]}"></webui-content>`;
                    }
                    html = `${html}</webui-grid>`;
                }
                let tabs = webui.create('webui-tabs', {html:html, theme:'tertiary', vertical: true});
                container.innerHTML = '';
                container.appendChild(tabs);
            }
            webui.fetchWithCache('https://cdn.myfi.ws/apps/task-proxy/apps.json', true).then(json=>{
                addTabContent(tabWin, json.win, json.versions);
                addTabContent(tabMac, json.mac, json.versions);
                addTabContent(tabUbuntu, json.ubu, json.versions);
            });
         },
        disconnected: function (t) { }
    });

}