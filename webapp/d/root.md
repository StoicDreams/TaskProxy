<webui-data data-page-title="Organize your development scripts, APIs, documentation, and more" data-page-subtitle=""></webui-data>

<webui-page-segment elevation="10">
## Supercharge Your Developer Workflow

Task Proxy is a developer tool for managing documentation and scripts alongside productivity features to help organize, simplify, and automate your workflows. 

Built in Rust for lightweight, cross-platform speed, Task Proxy integrates seamlessly into your daily routine to eliminate friction across Windows, Mac, and Linux.

<webui-flex gap="var(--padding)" style="margin-top: 1rem;">
    <webui-link href="https://github.com/StoicDreams/TaskProxyApp" icon="emoji-link" theme="primary">View on GitHub</webui-link>
    <webui-link href="/getting-started" icon="emoji-rocket" theme="secondary">Getting Started</webui-link>
</webui-flex>

</webui-page-segment>

## See It in Action

<webui-page-segment elevation="10">

Review your changes, commit, and sync with your team, all from one window:

<webui-flex align="center" justify="center">
<video controls playsinline preload="none" poster="/video/git-commit-sync.webp">
    <source src="/video/git-commit-sync.mp4" type="video/mp4">
</video>
</webui-flex>

Want to learn more? The [tutorials](/tutorials) walk through each task step by step, with screenshots and short videos, and [How It Works](/how-it-works) explains what Task Proxy shares through git and what stays on your computer.

</webui-page-segment>

## Who It's For

<webui-cards card-width="280">
    <webui-card name="Teams" avatar="emoji-busts_in_silhouette" link="/for-teams">
        Keep onboarding guides and runbooks in the repository, with steps anyone can run in a click.
    </webui-card>
    <webui-card name="Developers" avatar="emoji-laptop" link="/for-developers">
        Run scripts without remembering their flags, review and commit quickly, and keep tokens out of your scripts.
    </webui-card>
    <webui-card name="Everyone Who Uses Git" avatar="emoji-globe_with_meridians" link="/for-git-users">
        Writers, designers, and students: see what changed, save a version, and share it, without the command line.
    </webui-card>
</webui-cards>

## Why Choose Task Proxy?

<webui-page-segment elevation="10">
- **Zero-Friction Collaboration:** Configurations and custom pages are stored within a `.taskproxy` folder in your project root, so everything stays perfectly synced and easily shared via your version control system.
- **Bulletproof Security:** Manage and store secrets for scripts and API connections securely by encrypting them via your OS's native credential manager, keeping them safely outside your repository.
- **Precision Context:** Scope variables to Global, Project, or Page levels, ensuring your data and secrets are only accessible exactly where they are needed.
</webui-page-segment>

## Example Workflows

<webui-page-segment elevation="10">
- **Centralized Team Hubs:** Create modular Task Proxy Pages within your project to provide onboarding documentation, run health-check scripts, and show dynamic reports.
- **Automated Pipelines:** Utilize the integrated Script and Terminal Managers to queue and execute command flows in a specified sequence.
- **Live Documentation Editing:** Manage project `readme.md` files and custom documentation with side-by-side live rendering.
</webui-page-segment>

## Core Capabilities

<webui-page-segment elevation="10">
- **Project Management:** Create, add, and switch between multiple isolated workspaces instantly.
- **Git Controller:** Authenticate to commit, sync, push, pull, branch, and stash directly from the UI, featuring a built-in diff viewer.
- **Terminal & Script Manager:** Write parameterized PowerShell scripts with auto-generated UI inputs, and execute them in live background terminals or separate OS windows.
</webui-page-segment>

<app-latest></app-latest>

<webui-content cache src="/d/installation-notes.md" cache></webui-content>
