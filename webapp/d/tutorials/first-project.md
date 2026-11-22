<webui-data data-page-title="Set Up Task Proxy and Your First Project" data-page-subtitle="Tutorial: about 5 minutes" data-page-description="Create your security key, add a project folder, and find your way around Task Proxy in about five minutes."></webui-data>

## What you'll do

<webui-page-segment elevation="10">

1. Create the security key that protects your secrets.
2. Add a project folder.
3. Find your way around the app.

You'll need Task Proxy installed. Get it from the [home page](/). To run scripts you'll also need PowerShell, which Task Proxy can install for you when you first run one.

</webui-page-segment>

## 1. Create your security key

<webui-page-segment elevation="10">

The first time Task Proxy opens, it asks for a **Security Key**. It encrypts everything you keep in Task Proxy, such as tokens and passwords.

1. Click **Generate Key** to make a strong random key, or type your own of at least 20 characters.
2. Copy the key into your password manager. You need the same key to read your data on another computer.
3. Click **Save**.

Task Proxy keeps the key in your operating system's credential store, so you won't be asked for it again on this computer.

<webui-loop-video src="/video/loops/first-run-security-key.mp4" poster="/video/loops/first-run-security-key.webp" alt="The welcome page, asking for a security key, with Generate Key and Save buttons"></webui-loop-video>

</webui-page-segment>

## 2. Add a project

<webui-page-segment elevation="10">

A project is a folder on your computer, usually the root of a git repository.

1. Type a **Project Name**, or leave it blank to use the folder's name.
2. Click **Select Project Folder** and choose the folder.

Task Proxy creates a `.taskproxy` folder inside it for the pages and settings your team shares. If the folder already has one, because a teammate set the project up, Task Proxy loads it, and you get their pages straight away.

Have several projects? Click **Add Multiple Projects** to add them all at once.

<webui-loop-video src="/video/loops/add-first-project.mp4" poster="/video/loops/add-first-project.webp" alt="The Add Your First Project page, with Select Project Folder and Add Multiple Projects buttons"></webui-loop-video>

</webui-page-segment>

## 3. Find your way around

<webui-page-segment elevation="10">

- **Left navigation:** the **Project** dropdown at the top opens a grid of your projects, each with its icon and git status, to switch between them. Below it are the project's own pages, and at the bottom are four tools: **Navigation Manager**, **Docs Manager**, **Script Manager**, and **Git Controller**.
- **Top right:** **Save**, **Feedback**, and **Tools**, the toolbox. Tools opens a panel on the right, beside whatever you are doing, with a tab for each tool: **Terminals**, **Task Manager**, **Variables**, **Alerts**, **Plugins**, **Icons & Emojis**, **Theme**, **Accessibility**, and **Account**. Its button counts running scripts and new alerts.
- **Bottom:** your [favorite scripts](/tutorials/favorites), each a click away.
- **Help:** every tool has a **Help** bubble in the corner. It opens a small window you can move and resize, and keep open while you work.
- **Settings:** the Task Proxy logo at the top left takes you to Settings. Its tabs add, rename, and remove projects, import markdown files as pages, change your key, and set up Remote Connections, script performance, and AI. App updates are beside them.

<webui-loop-video src="/video/loops/tools-drawer.mp4" poster="/video/loops/tools-drawer.webp" alt="Tools opening on the right, moving through its Terminals, Task Manager, Variables, and Theme tabs"></webui-loop-video>

Removing a project only takes it out of Task Proxy. Your files and the `.taskproxy` folder stay where they are.

<webui-loop-video src="/video/loops/settings.mp4" poster="/video/loops/settings.webp" alt="Settings, with its tabs for projects, import, the security key, Remote Connections, performance, and AI, and Check for Updates beside them"></webui-loop-video>

</webui-page-segment>

<webui-flex justify="flex-end">
    <webui-button href="/tutorials/commit-and-sync" theme="primary" end-icon="chevrons-right">Continue to Review, commit, and sync your changes</webui-button>
</webui-flex>
