<webui-data data-page-title="Organize your development scripts, APIs, documentation, and more" data-page-subtitle=""></webui-data>

<webui-page-segment elevation="10">

Task Proxy is a new developer tool for managing development documentation and scripts alongside productivity features to help organize, simplify, and automate developer workflows.

The primary concept for Task Proxy is to provide users with a tool where they can easily create and manage project documentation, scripts, and configurations.

</webui-page-segment>

## Current State of Development

<webui-page-segment elevation="10">

- Integrated [Tauri](https://tauri.app) framework for simplified development and deployments to multiple platform targets (Windows, Mac, Linux).
- Integrated [WebUI](https://webui.stoicdreams.com) framework for layout, components, and default styling.
- New Task Proxy desktop application is setup with CICD pipeline to build, code sign, and publish app as changes are committed.
  - Code signing for Windows is working - Mac and Linux code signing coming soon.

</webui-page-segment>

## Current and Planned Features

<webui-page-segment elevation="10">

- Create unique Task Proxy Projects for each project you need.
- Quickly and easily switch between projects within Task Proxy.
- Manage project markdown files with live display.
- Create and manage Task Proxy Pages within a project that can store multiple modules you setup to provide documentation, run scripts, show reports, and more.
- Manage and store secrets to use in scripts and API connections securely by encrypting them and storing them outside of any projects.
- Scope data to Global, Project, or Page to determine if it can be used across all projects, only within the current project, or only within the current page.
- Task Proxy pages are stored within the project folder [projectroot]/.taskproxy so pages stay with the project and are easily synced and shared along with project updates - when using version control such as Git or Mercurial.
- Git Manager for committing and syncing updates.
- Script Manager for manaing project scripts.
- Terminal Manager for running scripts.
- Schedule times and events to trigger running specfic scripts or command flows.

</webui-page-segment>

<app-latest></app-latest>

<webui-content cache src="/d/installation-notes.md" cache></webui-content>
