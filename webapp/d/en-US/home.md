# Organize your development scripts, APIs, documentation, and more

```quote "info"
The Task Proxy desktop application is getting rebuilt in Rust. This move to Rust will allow for a much lighter and faster application with better support across a variety of devices and operating systems.
```

```section
Task Proxy is a new developer tool for managing development documentation and scripts alongside productivity features to help organize, simplify, and automate developer workflows.

The primary concept for Task Proxy is to provide users with a tool where they can easily create and manage project documentation, scripts, and configurations.
```

## Current Features

````section

- Create unique Task Proxy Projects for each project you need.
- Quickly and easily switch between projects within Task Proxy.
- Manage project README.md files with live display.
- Create and manage Task Proxy Pages within a project that can store multiple modules you setup to provide documentation, run scripts, show reports, and more.
- Manage and store secrets to use in scripts and API connections securely by encrypting them and storing them outside of any projects.
- Scope data to Global, Project, or Page to determine if it can be used across all projects, only within the current project, or only within the current page.
- Task Proxy pages are stored within the project folder [projectroot]/TaskProxyData so pages stay with the project and are easily synced and shared along with project updates - when using version control such as Git or Mercurial.
- Command flows that allow running specified scripts and apis in a specified sequence.

````

## Planned Features

````section

- Convert project to Rust.
- Terminal module that will allow running scripts that need to run continuously and not be restricted to only running when the hosting page is open.
- Schedule times and events to trigger running specfic scripts or command flows.

````

```quote "primary"
More information coming soon!
```
