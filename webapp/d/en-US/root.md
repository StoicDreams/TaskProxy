<webui-data data-page-title="Organize your development scripts, APIs, documentation, and more" data-page-subtitle=""></webui-data>

<webui-quote theme="info">

The Task Proxy desktop application is getting rebuilt in Rust. This move to Rust will allow for a much lighter and faster application with better support across a variety of devices and operating systems.

</webui-quote>

<webui-page-segment>

Task Proxy is a new developer tool for managing development documentation and scripts alongside productivity features to help organize, simplify, and automate developer workflows.

The primary concept for Task Proxy is to provide users with a tool where they can easily create and manage project documentation, scripts, and configurations.

</webui-page-segment>

## Current State of Development

<webui-page-segment>

- Integrated [Tauri](https://tauri.app) framework for simplified development and deployments to multiple platform targets (Windows, Mac, Linux).
- Integrated [WebUI](https://webui.stoicdreams.com) framework for layout, components, and default styling.
- New Task Proxy desktop application is setup with CICD pipeline to build and publish app as changes are committed.

</webui-page-segment>

## Current Features being ported from Legacy App

<webui-page-segment>

- Create unique Task Proxy Projects for each project you need.
- Quickly and easily switch between projects within Task Proxy.
- Manage project README.md files with live display.
- Create and manage Task Proxy Pages within a project that can store multiple modules you setup to provide documentation, run scripts, show reports, and more.
- Manage and store secrets to use in scripts and API connections securely by encrypting them and storing them outside of any projects.
- Scope data to Global, Project, or Page to determine if it can be used across all projects, only within the current project, or only within the current page.
- Task Proxy pages are stored within the project folder [projectroot]/TaskProxyData so pages stay with the project and are easily synced and shared along with project updates - when using version control such as Git or Mercurial.
- Command flows that allow running specified scripts and apis in a specified sequence.

</webui-page-segment>

## Additional Planned Features for new App

<webui-page-segment>

- Terminal module that will allow running scripts that need to run continuously and not be restricted to only running when the hosting page is open.
- Schedule times and events to trigger running specfic scripts or command flows.

</webui-page-segment>

<webui-quote theme="info">

More information coming soon!

</webui-quote>

<!--

## Early Development Desktop Builds

<webui-page-segment>

Use these links to install our early access development builds. These builds are very early in development and may have many bugs, as well as many missing features.

</webui-page-segment>

<webui-side-by-side>

<webui-quote theme="warning">

Notes:

- that updated builds are overriding the old files - we are not applying versioning during this initial stage of development.
- When the app gets closer to being developer ready we will integrate versioning into our builds as well as update this website as new versions are available.
- For now if you are interested in keeping up with build updates for the desktop app then follow the [TaskProxyApp GitHub repo](https://github.com/StoicDreams/TaskProxyApp).
- We are trying to find time to work on this and push out updates at least once per week, but our full-time work, family, and sometimes other side projects take higher priority.

</webui-quote>

<webui-page-segment>

- [Windows x64 MSI Installer](https://cdn.myfi.ws/downloads/task-proxy/task-proxy_0.1.0_x64_en-US.msi)
- [Windows x64 EXE Installer](https://cdn.myfi.ws/downloads/task-proxy/task-proxy_0.1.0_x64-setup.exe)
- [Mac DMG](https://cdn.myfi.ws/downloads/task-proxy/task-proxy_0.1.0_x64.dmg)
- [Linux amd64 DEB](https://cdn.myfi.ws/downloads/task-proxy/task-proxy_0.1.0_amd64.deb)
- [Linux amd64 AppImage](https://cdn.myfi.ws/downloads/task-proxy/task-proxy_0.1.0_amd64.AppImage)

</webui-page-segment>

</webui-side-by-side>

-->
