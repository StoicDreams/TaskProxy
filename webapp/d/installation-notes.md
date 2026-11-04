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
            <webui-code language="terminal">
                xattr -d com.apple.quarantine '/Applications/Task Proxy.app'
            </webui-code>
        </webui-paper>
    </webui-flex>
    <webui-button slot="tabs" theme="active" style="--theme-color: var(--color-active); --theme-color-offset: var(--color-active-offset);">Linux / Ubuntu</webui-button>
    <webui-flex gap="20" class="pa-3" slot="content" theme="inherit" style="gap: 20px; --theme-color: var(--color-inherit); --theme-color-offset: var(--color-inherit-offset);">
        <webui-paper>
            Task Proxy is provided as both an **AppImage** (universal) and a **DEB** package (Debian/Ubuntu). The AppImage is fully signed and is the recommended format for most Linux distributions.

            ### Using the AppImage (Recommended)
            AppImages are standalone applications that run without traditional installation.
            1. Download the `.AppImage` file.
            2. Make the file executable. You can right-click the file in your file manager, go to **Properties -> Permissions**, and check the box that says **Allow executing file as program**. Alternatively, open your terminal and run:
                <webui-code language="terminal">chmod +x Task_Proxy_*.AppImage</webui-code>
            3. Double-click the file to launch Task Proxy.
            
            **Adding to your Applications Menu:**
            To easily integrate the AppImage into your system's application launcher, we highly recommend installing [AppImageLauncher](https://github.com/TheAssassin/AppImageLauncher). Once AppImageLauncher is installed, simply opening the Task Proxy `.AppImage` will automatically prompt you to integrate it into your applications menu for easy access.

            #### Yay
            
            ```terminal
            yay -S appimagelauncher
            ```

            #### Paru

            ```terminal
            paru -S appimagelauncher
            ```

            ### Using the DEB Package (Debian / Ubuntu)
            If you are using a Debian-based distribution like Ubuntu or Linux Mint, you can install the DEB package directly.
            1. Download the `.deb` file.
            2. Open your terminal in the download folder and run:
                <webui-code language="terminal">sudo apt install ./Task_Proxy_*.deb</webui-code>
            3. This will install Task Proxy and automatically add it to your system's applications menu.
        </webui-paper>
    </webui-flex>
</webui-tabs>
