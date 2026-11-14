<webui-data data-page-title="Plugin Development" data-page-subtitle="Build plugins for Task Proxy, and the spec they follow"></webui-data>

## Build a plugin

<webui-page-segment elevation="10">

A Task Proxy plugin is a small WebAssembly program with a manifest. It describes its screens as data, which Task Proxy draws with its own components, and it reaches nothing outside its sandbox except through Task Proxy, which checks every request against what the manifest declared.

The plugins Stoic Dreams publishes, and the Rust kit for writing them, are open source in [TaskProxyPlugins](https://github.com/StoicDreams/TaskProxyPlugins). Its `spec` folder holds the same spec as this page.

</webui-page-segment>

<webui-tabs theme="secondary" transition-timing="200" pad="0">
<webui-button slot="tabs" hash="overview">Overview</webui-button>
<webui-page-segment slot="content" style="--theme-color: var(--color-background); --theme-color-offset: var(--color-background-offset);">

### How a plugin runs

- **WebAssembly in a sandbox.** Task Proxy runs plugins with [Extism](https://extism.org), with no WASI and no network or file access of their own. Each call gets a fresh instance, 30 seconds of WebAssembly time, and 64 MB of memory.
- **One way out.** A plugin's only import is `taskproxy_host`, which takes one JSON request, such as reading a variable or sending an HTTPS request, and answers with `{"ok": ...}` or `{"error": "..."}`. Task Proxy refuses anything the manifest doesn't allow.
- **Screens as data.** A plugin returns stacks, tables, forms, sections, and dialogs as JSON. It never sends HTML or script, and markdown is sanitized.
- **Clicks for anything outside.** Creating a branch, opening a website, or copying text are host actions: Task Proxy does them itself, only when the user clicks a button that says so.
- **Set up per project.** A plugin shows only in projects set up for it, with its settings or, for a plugin with none, turned on there. Nothing appears in a project that was not given access.

### What you write

| Piece | What it is |
|---|---|
| `plugin.json` | The manifest: the plugin's id, name, version, the spec versions it supports, its permissions, and its pages. |
| `render` | Draws one of the plugin's pages. |
| `action` | Answers a button, link, or form the plugin drew, and returns what happens next. |
| `branch_info` | Optional. A card for the Git Controller about the current branch. |
| `notifications` | Optional. Notifications for Task Proxy's Alerts panel. |

</webui-page-segment>
<webui-button slot="tabs" hash="first-plugin">Your First Plugin</webui-button>
<webui-page-segment slot="content" style="--theme-color: var(--color-background); --theme-color-offset: var(--color-background-offset);">

### Set up

You need Rust with the WebAssembly target, and PowerShell for the build script.

<webui-code language="terminal">
rustup target add wasm32-unknown-unknown
git clone https://github.com/StoicDreams/TaskProxyPlugins
</webui-code>

### Write it

1. Copy `plugins/jira` as a starting point: a `cdylib` crate that depends on `taskproxy-plugin-sdk`, with a `plugin.json`.
2. Give it a new `id` and `name`, and list only the permissions it needs.
3. List the spec versions it supports as `"spec": ["0.1.0"]`, naming the lowest patch it needs, and keep `"apiVersion": 1` beside it for older Task Proxy releases.
4. Implement the SDK's `Plugin` trait, with `render` and `action`, and export it with `export_plugin!(MyPlugin)`.

A minimal manifest:

<webui-code language="json">
{
    "id": "hello",
    "name": "Hello",
    "version": "0.1.0",
    "spec": ["0.1.0"],
    "apiVersion": 1,
    "description": "Says hello from a plugin.",
    "icon": "code",
    "pages": [{ "id": "home", "name": "Hello", "icon": "code" }]
}
</webui-code>

### Try it

1. Build every plugin into `dist/<id>` with `pwsh ./scripts/build.ps1`.
2. In Task Proxy, click the puzzle piece button, choose **Install from folder**, and pick `dist/<id>`. A plugin from a folder is marked unsigned.
3. Turn it on for the open project, or enter its settings, and its pages appear in the menu.

</webui-page-segment>
<webui-button slot="tabs" hash="versions">Spec Versions</webui-button>
<webui-page-segment slot="content" style="--theme-color: var(--color-background); --theme-color-offset: var(--color-background-offset);">

### How the spec is versioned

The plugin spec is versioned on its own, apart from Task Proxy and from each plugin, so each can update without waiting on the others. A version is `major.minor.patch`, and each `major.minor`, such as 0.1, is a **line**.

- **Patch (0.1.0 to 0.1.1):** only adds, such as a new host call, node, or optional field. Everything valid before stays valid.
- **Minor (0.1 to 0.2):** a breaking change, such as removing or renaming anything, or changing what something means. The patch resets to 0, and the lines never mix.

### How Task Proxy and a plugin match

- **Task Proxy** lists, for each line it supports, the newest patch it implements.
- **A plugin** lists in its manifest's `spec`, for each line it supports, the lowest patch it needs.
- **They match** on a line both list when Task Proxy's patch is at least the plugin's. Otherwise Task Proxy refuses the plugin and says whether to update Task Proxy or the plugin.
- **The catalog keeps older versions** of a plugin for spec lines its newest version dropped, and Task Proxy installs the newest version it can run.

### Task Proxy releases

| Task Proxy | Spec versions |
|---|---|
| 0.1.122 and later | 0.1.2 |
| 0.1.118 to 0.1.121 | 0.1.0, as `apiVersion: 1`. `spec` is not read. |
| 0.1.115 to 0.1.117 | An early form of 0.1.0, as `apiVersion: 1` |

### Plugins

| Plugin | Versions | Spec versions |
|---|---|---|
| Jira | 0.1.3 and later | 0.1.0, with drag and drop in its column editor where Task Proxy supports 0.1.2 |
| Jira | 0.1.0 to 0.1.2 | 0.1.0, as `apiVersion: 1` |

</webui-page-segment>
<webui-button slot="tabs" hash="guidelines">Guidelines</webui-button>
<webui-page-segment slot="content" style="--theme-color: var(--color-background); --theme-color-offset: var(--color-background-offset);">

### Permissions and settings

- **Ask for the least you need.** Users see every permission before installing. Name exact hosts, and use `*.example.com` only when each user has their own subdomain.
- **Prefer a host action to a permission** for anything that changes the user's work, so they see and click it.
- **Declare settings as variables,** and mark credentials `secret`, with `help` that says where to get them. Never ask for a token in a page's own form.
- **Share team data in project files,** under `.taskproxy/plugins/<id>/`, and keep personal data in the plugin's storage.

### Screens

- **Keep section and panel keys stable,** since Task Proxy remembers whether each is open by its key.
- **Confirm what can't be undone,** with a question that names what will happen.
- **Say what happened** with a short message, or redraw the page.
- **Show an empty state** that says why a list is empty and what to do.
- **Write plain text** in a person's words, and errors as sentences, since Task Proxy shows them as they are.
- **Check icon names** against [the icon list](https://cdn.myfi.ws/icons/all.json). An unknown one draws a placeholder.

### Speed and compatibility

- **Each call starts fresh,** so cache what is slow to fetch in storage, with the time from `now`.
- **Page through long lists,** and ask a service only for what the page shows.
- **List the lowest spec patch you need,** so the plugin runs in as many Task Proxy releases as it can.
- **Handle errors from newer host calls,** since releases before 0.1.122 run plugins without checking `spec`.
- **Ignore fields you don't know,** so newer Task Proxy releases can add them.

### Security

- **Treat service data as untrusted.** Don't pass it into markdown or `openUrl` unless that is what it is.
- **Keep secrets out of URLs, messages, notifications, and project files.**
- **Check a page's params,** since anyone can link to a page's address.

</webui-page-segment>
<webui-button slot="tabs" hash="publishing">Testing and Publishing</webui-button>
<webui-page-segment slot="content" style="--theme-color: var(--color-background); --theme-color-offset: var(--color-background-offset);">

### Testing

- **Test natively.** Plugin logic takes a `&dyn Host`, so unit tests pass a fake host with recorded responses, and need no WebAssembly.
- **Test the manifest against the code:** its version, `spec`, and the variables it reads.
- **Try it in Task Proxy** in a project that is not set up, one that is, and one with a wrong or expired credential.
- **Build to WebAssembly in CI,** so a dependency that doesn't build for `wasm32-unknown-unknown` is caught before a release.

### Publishing

- **Plugins in Stoic Dreams' catalog** are built, signed with the Task Proxy update key, and uploaded by TaskProxyPlugins' CI, from source in that repo.
- **Task Proxy checks the signatures** before installing, and that the signed manifest asks for exactly the permissions the catalog shows.
- **Every release raises the plugin's version.** Published versions are never changed or removed.
- **Plugin releases never need a Task Proxy release.**

</webui-page-segment>
</webui-tabs>

## Plugin spec

<webui-page-segment elevation="10">

Each tab is one version of the spec, complete, newest first. Rules marked **MUST** are enforced: Task Proxy refuses a plugin that breaks one. JSON names are camelCase, and both sides ignore fields they don't know.

</webui-page-segment>

<webui-tabs vertical theme="info" transition-timing="200" pad="0">
<webui-button slot="tabs" hash="spec-0-1-3">0.1.3 (Draft)</webui-button>
<webui-page-segment slot="content" style="--theme-color: var(--color-background); --theme-color-offset: var(--color-background-offset);">

### Spec 0.1.3 (Draft)

A draft for the Task Manager plugin, which lists running processes, including stuck background ones, and closes them. No Task Proxy release supports it yet, and it may change before it is released. It is everything in 0.1.2, plus the following.

### The `processes` permission

`"processes": ["list"]`, or `["list", "stop"]`.

| Value | Allows |
|---|---|
| `list` | The `processes` host call. |
| `stop` | The `process.stop` and `process.kill` host actions. Needs `list` too. |

A manifest that asks for `processes` **MUST NOT** also ask for `hosts`. Command lines and folders can hold secrets and private paths, so a plugin that reads them can't send anything off the machine.

### The `processes` host call

`{"op": "processes"}` answers with `{"processes": [...], "ownPid": number}`, where `ownPid` is Task Proxy's own process. It lists only the user's own processes. Each is:

| Field | Type | Meaning |
|---|---|---|
| `pid` | number | |
| `parentPid` | number or `null` | |
| `name` | string | |
| `command` | string[] | The program and its arguments. |
| `cwd` | string or `null` | Its working folder, when the platform reports it. |
| `started` | number | When it started, in milliseconds since the Unix epoch. With `pid`, it names one process, since pids are reused. |
| `cpu` | number | Percent of one core since the last call. |
| `memory` | number | Resident memory in bytes. |
| `ports` | object[] | Each `{"port", "protocol", "address"}` it listens on or has bound. |
| `orphaned` | boolean | Its parent exited, so it now belongs to init, `systemd --user`, or `launchd`. |
| `inProject` | boolean | Its working folder is inside the open project. |

### Stopping a process

The host actions `process.stop` and `process.kill` take `{"pid", "started", "tree"}`.

- **`process.stop`** asks the process to end: SIGTERM, or a close request on Windows.
- **`process.kill`** ends it: SIGKILL, or termination on Windows.
- **`tree: true`** also ends its child processes, children first.

Task Proxy refuses:

- a pid whose start time is not `started`
- its own process and the processes it was started from
- other users' processes

It always asks the user to confirm, naming the process, its pid, and its command.

### Still to decide

Processes belong to the whole machine, but a plugin shows only in projects set up for it. This draft either keeps that rule, with the Task Manager turned on for each project and filtered to that project by default, or adds a kind of plugin that shows in every project once turned on.

</webui-page-segment>
<webui-button slot="tabs" hash="spec-0-1-2">0.1.2</webui-button>
<webui-page-segment slot="content" style="--theme-color: var(--color-background); --theme-color-offset: var(--color-background-offset);">

### Spec 0.1.2

Supported by Task Proxy 0.1.122 and later.

**New in 0.1.2:**

- the `reorder` node, for items the user drags into order
- forms' `inline`, for fields and buttons in one row

Everything else is as in 0.1.1.

### Package

- **`plugin.json`:** the manifest.
- **`plugin.wasm`:** a WebAssembly module for `wasm32-unknown-unknown`, at most 20 MB, run with Extism with no WASI.
- **Its only import** is `taskproxy_host` in the `extism:host/user` module.

### Manifest

| Field | Type | Rules |
|---|---|---|
| `id` | string | Required. Lowercase letters, digits, and dashes, starting with a letter, at most 64 characters. Never changes. |
| `name` | string | Required. Not blank. |
| `version` | string | Required. The plugin's own version, three numbers. |
| `spec` | string[] | Required. The spec versions it supports, one per line, each the lowest patch it needs, such as `["0.1.0"]`. |
| `apiVersion` | number | `1` while it supports line 0.1, for Task Proxy 0.1.121 and earlier. Without `spec`, it means spec 0.1.0. |
| `description` | string | A sentence or two, shown before installing. |
| `category` | string | A slug, such as `issue-tracking`. |
| `icon` | string | An icon name from [the icon list](https://cdn.myfi.ws/icons/all.json). |
| `permissions` | object | `hosts`, `variables`, and `git`, below. |
| `pages` | object[] | Each `{"id", "name", "icon", "hidden"}`, at `/plugin/<id>/<page>`. A `hidden` page is left out of the menu. |
| `contributes` | string[] | `gitBranchInfo` for a Git Controller card, and `notifications` for the Alerts panel. Unknown values are ignored. |

### Permissions

| Permission | Rules |
|---|---|
| `hosts` | Domains for HTTPS requests: `api.example.com` exactly, or `*.example.com` for its subdomains only. A pattern needs at least two labels, so `*` and `*.com` are refused. |
| `variables` | Each `{"key", "label", "secret", "help"}`. Keys are letters, digits, `_`, and `-`, and **MUST NOT** start with `app-` or `session-`. Users enter them per project, and `secret` ones are masked and never shown again. |
| `git` | `currentBranch` to read the current branch, and `createBranch` for the branch host action. |

### Exports

Each takes one JSON value and returns `{"ok": ...}` or `{"error": "..."}`. Errors are shown to the user.

| Export | Input | Result |
|---|---|---|
| `render` | `{"page", "params"}` | A node: the page's content. `params` is the address's query. |
| `action` | `{"page", "pageParams", "action", "params", "form"}` | An action result. |
| `branch_info` | `{"branch"}` | A node, or `null`. With `gitBranchInfo`. |
| `notifications` | `{}` | A list of `{"id", "title", "text", "theme", "time", "links"}`. With `notifications`. Polled every two minutes. |
| `notification_read` | `{"id"}` | Ignored. Called when the user closes a notification. |

### Host calls

A request names its `op`. A request Task Proxy does not understand is answered with an error.

| `op` | Request | Answer |
|---|---|---|
| `var` | `{"key"}` | A declared variable from the project's own variables, then its settings, or `null`. |
| `storeGet` | `{"key"}` | The plugin's saved value, or `null`. |
| `storeSet` | `{"key", "value"}` | Saves it, encrypted. `null` removes it. |
| `projectFileRead` | `{"path"}` | Text under `.taskproxy/plugins/<id>/` in the open project, or `null`. |
| `projectFileWrite` | `{"path", "text"}` | Writes there, at most 1 MB. Paths can't leave that folder. |
| `currentBranch` | `{}` | The branch's name, or `null`. Needs `git: currentBranch`. |
| `now` | `{}` | Milliseconds since the Unix epoch. |
| `http` | `{"request": {"method", "url", "headers", "body"}}` | `{"status", "body"}`. HTTPS to declared hosts only, no redirects, at most 10 MB back, and no credentials in the URL. |
| `hostInfo` | `{}` | `{"app", "spec", "platform"}`: Task Proxy's version, the spec version it runs the plugin with, and `linux`, `macos`, or `windows`. |

### Action results

Every field is optional, and `{}` changes nothing.

| Field | Effect |
|---|---|
| `message` | `{"text", "theme"}`: a short alert. |
| `closeDialog` | Closes the dialog the action came from. |
| `navigate` | `{"page", "params"}`: opens one of the plugin's pages. |
| `dialog` | `{"title", "ui"}`: opens a dialog. |
| `ui` | Replaces the page's content, or the dialog's. |
| `refresh` | Draws the page again. |
| `options` | `[{"value", "label"}]`: choices for a `select` node or a field's `suggest`. |

### Nodes

Every node has a `type`. An unknown type is drawn as a placeholder. Themes are `primary`, `secondary`, `tertiary`, `info`, `success`, `warning`, and `danger`.

| `type` | Fields |
|---|---|
| `stack`, `row`, `toolbar` | `children` |
| `heading` | `text`, `level` (1 to 4, default 2) |
| `text` | `text`, `muted`, `strong` |
| `markdown` | `text`, sanitized |
| `badge` | `text`, `theme` |
| `link` | `text`, `action` |
| `button` | `action`, `theme` |
| `properties` | `items`, each `{"label", "value"}` with a node as the value |
| `table` | `columns`, titles or `{"label", "action", "sort"}`, and `rows`, each `{"cells", "action"}` |
| `select` | `text`, `theme`, `options` (an action that returns the choices when clicked), `action` (run with the choice as `form.value`) |
| `clip` | `text`, `max` (30), `tip` (100), `action`, `always`, `muted` |
| `section` | `key`, `title`, `subtitle`, `open`, `children`. Remembered open or closed by `key`. |
| `panel` | `key`, `open`, `children`. Shown and hidden by the `toggle` host action. |
| `form` | `fields`, `submit`, `cancel`, `buttons`, `children`, `inline` (new in 0.1.2: fields and buttons in one row) |
| `inputs` | `fields`, more of a form's fields among its `children` |
| `notice` | `text`, `theme` |
| `empty` | `text` |
| `reorder` | `items`, each `{"id", "children"}`, and `action`. New in 0.1.2. |

An **action** is `{"id", "label", "params", "confirm", "icon", "host"}`. With `confirm`, the user is asked first.

A **reorder** list shows each item with a drag handle. The user drags items, or moves them with Alt+Up and Alt+Down, and Task Proxy then runs `action` with `form.order`, the ids in their new order. Older hosts show a placeholder, so check `hostInfo` and draw something else for them.

A **field** is `{"name", "label", "kind", "value", "options", "required", "placeholder", "help", "suggest"}`:

- **Kinds:** `text`, `password`, `textarea`, `number`, `select`, `multiselect`, `checkbox`, and `hidden`.
- **Values sent:** checkboxes send booleans, multiselects send lists, and every other kind sends a string.
- **`suggest`:** runs when the user types `@` and a few letters, with them as `query`. The form also sends `<name>.mentions`.

### Host actions

Run by Task Proxy only when the user clicks the button that names them.

| `type` | Fields | Does |
|---|---|---|
| `git.createBranch` | `name` | Creates a branch and switches to it. Needs `git: createBranch`. |
| `openUrl` | `url` | Opens an HTTPS address in the browser. |
| `copy` | `text` | Copies to the clipboard. |
| `openSettings` | | Opens the plugin's settings. |
| `toggle` | `key` | Shows or hides a `panel`. |

### Catalog

- **Each entry** holds the manifest's fields, including `spec`, and the URLs and signatures of both files.
- **`versions`** lists older versions for spec lines the newest one dropped, and Task Proxy installs the newest version it can run.
- **Signatures:** both files are signed with the Task Proxy update key.
- **Refused installs:** Task Proxy refuses a download whose signature, permissions, id, or version doesn't match its entry.

</webui-page-segment>
<webui-button slot="tabs" hash="spec-0-1-1">0.1.1</webui-button>
<webui-page-segment slot="content" style="--theme-color: var(--color-background); --theme-color-offset: var(--color-background-offset);">

### Spec 0.1.1

Supported by Task Proxy 0.1.122 and later.

**New in 0.1.1:**

- the `hostInfo` host call
- the manifest's `spec` list
- the catalog's `spec` and `versions`

Everything else is as in 0.1.0.

### Package

- **`plugin.json`:** the manifest.
- **`plugin.wasm`:** a WebAssembly module for `wasm32-unknown-unknown`, at most 20 MB, run with Extism with no WASI.
- **Its only import** is `taskproxy_host` in the `extism:host/user` module.

### Manifest

| Field | Type | Rules |
|---|---|---|
| `id` | string | Required. Lowercase letters, digits, and dashes, starting with a letter, at most 64 characters. Never changes. |
| `name` | string | Required. Not blank. |
| `version` | string | Required. The plugin's own version, three numbers. |
| `spec` | string[] | Required. The spec versions it supports, one per line, each the lowest patch it needs, such as `["0.1.0"]`. |
| `apiVersion` | number | `1` while it supports line 0.1, for Task Proxy 0.1.121 and earlier. Without `spec`, it means spec 0.1.0. |
| `description` | string | A sentence or two, shown before installing. |
| `category` | string | A slug, such as `issue-tracking`. |
| `icon` | string | An icon name from [the icon list](https://cdn.myfi.ws/icons/all.json). |
| `permissions` | object | `hosts`, `variables`, and `git`, below. |
| `pages` | object[] | Each `{"id", "name", "icon", "hidden"}`, at `/plugin/<id>/<page>`. A `hidden` page is left out of the menu. |
| `contributes` | string[] | `gitBranchInfo` for a Git Controller card, and `notifications` for the Alerts panel. Unknown values are ignored. |

### Permissions

| Permission | Rules |
|---|---|
| `hosts` | Domains for HTTPS requests: `api.example.com` exactly, or `*.example.com` for its subdomains only. A pattern needs at least two labels, so `*` and `*.com` are refused. |
| `variables` | Each `{"key", "label", "secret", "help"}`. Keys are letters, digits, `_`, and `-`, and **MUST NOT** start with `app-` or `session-`. Users enter them per project, and `secret` ones are masked and never shown again. |
| `git` | `currentBranch` to read the current branch, and `createBranch` for the branch host action. |

### Exports

Each takes one JSON value and returns `{"ok": ...}` or `{"error": "..."}`. Errors are shown to the user.

| Export | Input | Result |
|---|---|---|
| `render` | `{"page", "params"}` | A node: the page's content. `params` is the address's query. |
| `action` | `{"page", "pageParams", "action", "params", "form"}` | An action result. |
| `branch_info` | `{"branch"}` | A node, or `null`. With `gitBranchInfo`. |
| `notifications` | `{}` | A list of `{"id", "title", "text", "theme", "time", "links"}`. With `notifications`. Polled every two minutes. |
| `notification_read` | `{"id"}` | Ignored. Called when the user closes a notification. |

### Host calls

A request names its `op`. A request Task Proxy does not understand is answered with an error.

| `op` | Request | Answer |
|---|---|---|
| `var` | `{"key"}` | A declared variable from the project's own variables, then its settings, or `null`. |
| `storeGet` | `{"key"}` | The plugin's saved value, or `null`. |
| `storeSet` | `{"key", "value"}` | Saves it, encrypted. `null` removes it. |
| `projectFileRead` | `{"path"}` | Text under `.taskproxy/plugins/<id>/` in the open project, or `null`. |
| `projectFileWrite` | `{"path", "text"}` | Writes there, at most 1 MB. Paths can't leave that folder. |
| `currentBranch` | `{}` | The branch's name, or `null`. Needs `git: currentBranch`. |
| `now` | `{}` | Milliseconds since the Unix epoch. |
| `http` | `{"request": {"method", "url", "headers", "body"}}` | `{"status", "body"}`. HTTPS to declared hosts only, no redirects, at most 10 MB back, and no credentials in the URL. |
| `hostInfo` | `{}` | `{"app", "spec", "platform"}`: Task Proxy's version, the spec version it runs the plugin with, and `linux`, `macos`, or `windows`. New in 0.1.1. |

### Action results

Every field is optional, and `{}` changes nothing.

| Field | Effect |
|---|---|
| `message` | `{"text", "theme"}`: a short alert. |
| `closeDialog` | Closes the dialog the action came from. |
| `navigate` | `{"page", "params"}`: opens one of the plugin's pages. |
| `dialog` | `{"title", "ui"}`: opens a dialog. |
| `ui` | Replaces the page's content, or the dialog's. |
| `refresh` | Draws the page again. |
| `options` | `[{"value", "label"}]`: choices for a `select` node or a field's `suggest`. |

### Nodes

Every node has a `type`. An unknown type is drawn as a placeholder. Themes are `primary`, `secondary`, `tertiary`, `info`, `success`, `warning`, and `danger`.

| `type` | Fields |
|---|---|
| `stack`, `row`, `toolbar` | `children` |
| `heading` | `text`, `level` (1 to 4, default 2) |
| `text` | `text`, `muted`, `strong` |
| `markdown` | `text`, sanitized |
| `badge` | `text`, `theme` |
| `link` | `text`, `action` |
| `button` | `action`, `theme` |
| `properties` | `items`, each `{"label", "value"}` with a node as the value |
| `table` | `columns`, titles or `{"label", "action", "sort"}`, and `rows`, each `{"cells", "action"}` |
| `select` | `text`, `theme`, `options` (an action that returns the choices when clicked), `action` (run with the choice as `form.value`) |
| `clip` | `text`, `max` (30), `tip` (100), `action`, `always`, `muted` |
| `section` | `key`, `title`, `subtitle`, `open`, `children`. Remembered open or closed by `key`. |
| `panel` | `key`, `open`, `children`. Shown and hidden by the `toggle` host action. |
| `form` | `fields`, `submit`, `cancel`, `buttons`, `children` |
| `inputs` | `fields`, more of a form's fields among its `children` |
| `notice` | `text`, `theme` |
| `empty` | `text` |

An **action** is `{"id", "label", "params", "confirm", "icon", "host"}`. With `confirm`, the user is asked first.

A **field** is `{"name", "label", "kind", "value", "options", "required", "placeholder", "help", "suggest"}`:

- **Kinds:** `text`, `password`, `textarea`, `number`, `select`, `multiselect`, `checkbox`, and `hidden`.
- **Values sent:** checkboxes send booleans, multiselects send lists, and every other kind sends a string.
- **`suggest`:** runs when the user types `@` and a few letters, with them as `query`. The form also sends `<name>.mentions`.

### Host actions

Run by Task Proxy only when the user clicks the button that names them.

| `type` | Fields | Does |
|---|---|---|
| `git.createBranch` | `name` | Creates a branch and switches to it. Needs `git: createBranch`. |
| `openUrl` | `url` | Opens an HTTPS address in the browser. |
| `copy` | `text` | Copies to the clipboard. |
| `openSettings` | | Opens the plugin's settings. |
| `toggle` | `key` | Shows or hides a `panel`. |

### Catalog

- **Each entry** holds the manifest's fields, including `spec`, and the URLs and signatures of both files.
- **`versions`** lists older versions for spec lines the newest one dropped, and Task Proxy installs the newest version it can run.
- **Signatures:** both files are signed with the Task Proxy update key.
- **Refused installs:** Task Proxy refuses a download whose signature, permissions, id, or version doesn't match its entry.

</webui-page-segment>
<webui-button slot="tabs" hash="spec-0-1-0">0.1.0</webui-button>
<webui-page-segment slot="content" style="--theme-color: var(--color-background); --theme-color-offset: var(--color-background-offset);">

### Spec 0.1.0

The first spec, run by Task Proxy 0.1.118 to 0.1.121 as `apiVersion: 1`, and by later releases.

### Package

- **`plugin.json`:** the manifest.
- **`plugin.wasm`:** a WebAssembly module for `wasm32-unknown-unknown`, at most 20 MB, run with Extism with no WASI.
- **Its only import** is `taskproxy_host` in the `extism:host/user` module.

### Manifest

| Field | Type | Rules |
|---|---|---|
| `id` | string | Required. Lowercase letters, digits, and dashes, starting with a letter, at most 64 characters. Never changes. |
| `name` | string | Required. Not blank. |
| `version` | string | Required. The plugin's own version, three numbers. |
| `apiVersion` | number | Required, and `1`. |
| `description` | string | A sentence or two, shown before installing. |
| `category` | string | A slug, such as `issue-tracking`. |
| `icon` | string | An icon name from [the icon list](https://cdn.myfi.ws/icons/all.json). |
| `permissions` | object | `hosts`, `variables`, and `git`, below. |
| `pages` | object[] | Each `{"id", "name", "icon", "hidden"}`, at `/plugin/<id>/<page>`. A `hidden` page is left out of the menu. |
| `contributes` | string[] | `gitBranchInfo` for a Git Controller card, and `notifications` for the Alerts panel. Unknown values are ignored. |

### Permissions

| Permission | Rules |
|---|---|
| `hosts` | Domains for HTTPS requests: `api.example.com` exactly, or `*.example.com` for its subdomains only. A pattern needs at least two labels, so `*` and `*.com` are refused. |
| `variables` | Each `{"key", "label", "secret", "help"}`. Keys are letters, digits, `_`, and `-`, and **MUST NOT** start with `app-` or `session-`. Users enter them per project, and `secret` ones are masked and never shown again. |
| `git` | `currentBranch` to read the current branch, and `createBranch` for the branch host action. |

### Exports

Each takes one JSON value and returns `{"ok": ...}` or `{"error": "..."}`. Errors are shown to the user.

| Export | Input | Result |
|---|---|---|
| `render` | `{"page", "params"}` | A node: the page's content. `params` is the address's query. |
| `action` | `{"page", "pageParams", "action", "params", "form"}` | An action result. |
| `branch_info` | `{"branch"}` | A node, or `null`. With `gitBranchInfo`. |
| `notifications` | `{}` | A list of `{"id", "title", "text", "theme", "time", "links"}`. With `notifications`. Polled every two minutes. |
| `notification_read` | `{"id"}` | Ignored. Called when the user closes a notification. |

### Host calls

A request names its `op`. A request Task Proxy does not understand is answered with an error.

| `op` | Request | Answer |
|---|---|---|
| `var` | `{"key"}` | A declared variable from the project's own variables, then its settings, or `null`. |
| `storeGet` | `{"key"}` | The plugin's saved value, or `null`. |
| `storeSet` | `{"key", "value"}` | Saves it, encrypted. `null` removes it. |
| `projectFileRead` | `{"path"}` | Text under `.taskproxy/plugins/<id>/` in the open project, or `null`. |
| `projectFileWrite` | `{"path", "text"}` | Writes there, at most 1 MB. Paths can't leave that folder. |
| `currentBranch` | `{}` | The branch's name, or `null`. Needs `git: currentBranch`. |
| `now` | `{}` | Milliseconds since the Unix epoch. |
| `http` | `{"request": {"method", "url", "headers", "body"}}` | `{"status", "body"}`. HTTPS to declared hosts only, no redirects, at most 10 MB back, and no credentials in the URL. |

### Action results

Every field is optional, and `{}` changes nothing.

| Field | Effect |
|---|---|
| `message` | `{"text", "theme"}`: a short alert. |
| `closeDialog` | Closes the dialog the action came from. |
| `navigate` | `{"page", "params"}`: opens one of the plugin's pages. |
| `dialog` | `{"title", "ui"}`: opens a dialog. |
| `ui` | Replaces the page's content, or the dialog's. |
| `refresh` | Draws the page again. |
| `options` | `[{"value", "label"}]`: choices for a `select` node or a field's `suggest`. |

### Nodes

Every node has a `type`. An unknown type is drawn as a placeholder. Themes are `primary`, `secondary`, `tertiary`, `info`, `success`, `warning`, and `danger`.

| `type` | Fields |
|---|---|
| `stack`, `row`, `toolbar` | `children` |
| `heading` | `text`, `level` (1 to 4, default 2) |
| `text` | `text`, `muted`, `strong` |
| `markdown` | `text`, sanitized |
| `badge` | `text`, `theme` |
| `link` | `text`, `action` |
| `button` | `action`, `theme` |
| `properties` | `items`, each `{"label", "value"}` with a node as the value |
| `table` | `columns`, titles or `{"label", "action", "sort"}`, and `rows`, each `{"cells", "action"}` |
| `select` | `text`, `theme`, `options` (an action that returns the choices when clicked), `action` (run with the choice as `form.value`) |
| `clip` | `text`, `max` (30), `tip` (100), `action`, `always`, `muted` |
| `section` | `key`, `title`, `subtitle`, `open`, `children`. Remembered open or closed by `key`. |
| `panel` | `key`, `open`, `children`. Shown and hidden by the `toggle` host action. |
| `form` | `fields`, `submit`, `cancel`, `buttons`, `children` |
| `inputs` | `fields`, more of a form's fields among its `children` |
| `notice` | `text`, `theme` |
| `empty` | `text` |

An **action** is `{"id", "label", "params", "confirm", "icon", "host"}`. With `confirm`, the user is asked first.

A **field** is `{"name", "label", "kind", "value", "options", "required", "placeholder", "help", "suggest"}`:

- **Kinds:** `text`, `password`, `textarea`, `number`, `select`, `multiselect`, `checkbox`, and `hidden`.
- **Values sent:** checkboxes send booleans, multiselects send lists, and every other kind sends a string.
- **`suggest`:** runs when the user types `@` and a few letters, with them as `query`. The form also sends `<name>.mentions`.

### Host actions

Run by Task Proxy only when the user clicks the button that names them.

| `type` | Fields | Does |
|---|---|---|
| `git.createBranch` | `name` | Creates a branch and switches to it. Needs `git: createBranch`. |
| `openUrl` | `url` | Opens an HTTPS address in the browser. |
| `copy` | `text` | Copies to the clipboard. |
| `openSettings` | | Opens the plugin's settings. |
| `toggle` | `key` | Shows or hides a `panel`. |

### Catalog

- **Each entry** holds the manifest's fields, and the URLs and signatures of both files.
- **Signatures:** both files are signed with the Task Proxy update key.
- **Refused installs:** Task Proxy refuses a download whose signature, permissions, id, or version doesn't match its entry.

</webui-page-segment>
</webui-tabs>
