## Installation Notes

<webui-tabs theme="secondary" index="1" transition-timing="200" data-subscribe="session-platform-tab-index:setTab" style="--theme-color: var(--color-secondary); --theme-color-offset: var(--color-secondary-offset);">
    <webui-button slot="tabs" style="--theme-color: var(--color-null); --theme-color-offset: var(--color-null-offset);">Windows</webui-button>
    <webui-flex gap="20" class="pa-3" slot="content" theme="inherit" style="gap: 20px; --theme-color: var(--color-inherit); --theme-color-offset: var(--color-inherit-offset);">
        <webui-paper>
            Use the EXE installer to install for the current user - installs in the `C:/Users/*` folder.
            Use the MSI installer to install for all users - installs in the `Program Files` folder.
        </webui-paper>
    </webui-flex>
    <webui-button slot="tabs" style="--theme-color: var(--color-null); --theme-color-offset: var(--color-null-offset);">Mac</webui-button>
    <webui-flex gap="20" class="pa-3" slot="content" theme="inherit" style="gap: 20px; --theme-color: var(--color-inherit); --theme-color-offset: var(--color-inherit-offset);">
        <webui-paper>
            We have not yet setup certificate signing for Task Proxy on Mac. When installed, Apple will lock the program from being used. Before you can use the app, you will need to remove this lock with a special script.
            <webui-code langauge="terminal">xattr -d com.apple.quarantine '/Applications/Task Proxy.app'</webui-code>
        </webui-paper>
    </webui-flex>
    <webui-button slot="tabs" theme="active" style="--theme-color: var(--color-active); --theme-color-offset: var(--color-active-offset);">Linux / Ubuntu</webui-button>
    <webui-flex gap="20" class="pa-3" slot="content" theme="inherit" style="gap: 20px; --theme-color: var(--color-inherit); --theme-color-offset: var(--color-inherit-offset);">
        <webui-paper>
            We have not yet setup certificate signing for Task Proxy on Linux and do not currently have a workaround since we do not actively use Linux.
        </webui-paper>
    </webui-flex>
</webui-tabs>
