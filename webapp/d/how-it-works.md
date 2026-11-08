<webui-data data-page-title="How Task Proxy Works" data-page-subtitle="What lives in your repository, and what stays on your computer"></webui-data>

## One app for the work around your code

<webui-page-segment elevation="10">

Task Proxy is a desktop app for Windows, Mac, and Linux. You point it at a project folder, usually the root of a git repository, and it gives that project:

- **Pages** that hold your team's steps, notes, and the scripts that carry them out.
- **A Script Manager** for running PowerShell scripts, with an input for each parameter.
- **A Terminal Manager** that shows each script's output in a real terminal.
- **Variables and secrets**, with environments such as dev, staging, and prod.
- **A Git Controller** for reviewing changes, committing, syncing, and working with branches.
- **A Docs Manager** for editing the project's markdown files with a live preview.

You can add as many projects as you like and switch between them from the **Project** dropdown at the top of the navigation.

![The Git Controller in Task Proxy, with a list of changed files and the changes in one of them](/img/tutorials/git-changes.webp)

</webui-page-segment>

## What is shared, and what is not

<webui-page-segment elevation="10">

When you add a project, Task Proxy creates a `.taskproxy` folder in it. Everything your team should share goes in that folder, as plain JSON and markdown, so you share it the same way you share code: commit it and push.

Everything personal stays on your computer, encrypted.

| In the repository, in `.taskproxy` | On your computer, encrypted |
|---|---|
| Pages, in `pages/` | Values you enter for project variables |
| The project's navigation, in `Navigation.json` | Each environment's values |
| Variable names, types, and default values, in `Variables.json` | Global variables and secrets, such as tokens |
| | Your list of projects and app settings |

Scripts are ordinary `.ps1` files, so they live wherever you keep them in the project, and are shared like any other file.

<webui-quote theme="warning">

Default values in `Variables.json` are committed, so never use a password or token as a default. Enter secrets as values instead, which never leave your computer.

</webui-quote>

</webui-page-segment>

## How your secrets are protected

<webui-page-segment elevation="10">

- The first time you open Task Proxy, it asks for a **Security Key** of at least 20 characters, or makes one for you.
- The key is kept in your operating system's credential store, such as Windows Credential Manager or the macOS Keychain, so you are not asked for it again.
- Your data files are encrypted with AES-256-GCM using that key.
- If a file can't be read with the current key, Task Proxy sets it aside rather than overwriting it, and restores it if you enter the right key later.

Keep a copy of your key in a password manager. You need the same key to read your data on a new computer.

</webui-page-segment>

## How a variable reaches a script

<webui-page-segment elevation="10">

A variable can be set in three places. When a page or script asks for one, Task Proxy looks in this order and uses the first value it finds:

1. **Page**: values for the page you are on.
2. **Project**: values for this project, from the active environment.
3. **Global**: values for every project, such as your personal access token.

In a page script, Task Proxy fills in any variable that has the same name as one in the script. Here, `$apiBaseUrl` is set to the value of the **apiBaseUrl** variable before the script runs:

```pwsh
$apiBaseUrl = 'https://dev.api.acme.test'
Invoke-RestMethod "$apiBaseUrl/health"
```

Before a project's script runs for the first time, Task Proxy shows you the script, with long values masked, and asks whether you trust the project.

</webui-page-segment>

## How git fits in

<webui-page-segment elevation="10">

Task Proxy works with git directly, so there's nothing else to install. It signs in to your remote over HTTPS with a personal access token, saved as the `github_pat` or `git_pat` variable.

- **Pull, merge, and switching branches never overwrite uncommitted work.** If a change would be lost, Task Proxy stops and tells you.
- **Changes from git are picked up.** When a pull changes `Navigation.json` or `Variables.json`, Task Proxy reloads them. If you also changed them in the app, it reports the conflict instead of overwriting the file.
- **A project can hold several repositories.** Task Proxy finds each `.git` folder in the project, and you pick one from the **Repo** dropdown.

</webui-page-segment>

<webui-flex gap="var(--padding)" wrap>
    <webui-link href="/tutorials" icon="circle_emoji-books|theme:primary|backing|inverted" theme="primary">Browse the tutorials</webui-link>
    <webui-link href="/getting-started" icon="emoji-rocket" theme="secondary">Getting Started</webui-link>
</webui-flex>
