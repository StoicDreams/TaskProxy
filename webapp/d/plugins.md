<webui-data data-page-title="Task Proxy Plugins" data-page-subtitle="Add the integrations you use, and nothing you don't"></webui-data>

## What plugins are

<webui-page-segment elevation="10">

Plugins connect Task Proxy to the other tools in your day, such as your issue tracker. You install only the ones you use, so Task Proxy stays small for everyone else.

Each plugin adds its own pages to Task Proxy's menu, and can add details to tools you already use, such as showing the issue for your current branch in the **Git Controller**.

<webui-loop-video src="/video/loops/plugins-drawer.mp4" poster="/video/loops/plugins-drawer.webp" alt="The Plugins panel, with Jira installed and its settings open"></webui-loop-video>

</webui-page-segment>

## Install a plugin

<webui-page-segment elevation="10">

1. Click the puzzle piece button at the top of Task Proxy, beside **Icons & Emojis**. The **Plugins** panel opens on the right.
2. Under **Available**, click **Install** on the plugin you want.
3. Read what the plugin will be able to do, and click **Install**.
4. Open the plugin's **Settings** in the same panel and enter what it asks for, such as your Jira site and API token.

Its pages appear in the menu straight away. **Turn off** hides a plugin without removing it, and **Remove** deletes it along with its settings.

</webui-page-segment>

## What a plugin can reach

<webui-page-segment elevation="10">

Plugins run in a sandbox. Each one lists what it needs, and Task Proxy shows you that list before you install it and refuses anything else:

- **Websites:** only the ones it names, such as `*.atlassian.net` for Jira, and only over HTTPS.
- **Settings:** only its own. They're saved encrypted on your computer, for that plugin alone, so other plugins, project pages, and scripts can't read them.
- **Your projects:** only its own folder, `.taskproxy/plugins/<plugin>`, so a team can share things like Jira Views through git.
- **Git:** reading the current branch, and creating a branch when you click its button. A plugin never changes your repository on its own.

Plugins from Task Proxy's catalog are signed by Stoic Dreams, and Task Proxy checks the signature before installing. Opening a project never installs a plugin.

</webui-page-segment>

## Plugins by category

<webui-page-segment elevation="10">

### Issue tracking

</webui-page-segment>

<webui-cards card-width="300">
    <webui-card name="Jira" avatar="emoji-ticket" link="/plugins/issue-tracking/jira">
        Your Jira Cloud issues, each one with its parents through Views you design, new issues, and a branch for each issue.
    </webui-card>
</webui-cards>

## Build your own

<webui-page-segment elevation="10">

Plugins are WebAssembly, written in Rust with the [Task Proxy plugin kit](https://github.com/StoicDreams/TaskProxyPlugins), or any language with an [Extism](https://extism.org) plugin kit. Build one, then click the puzzle piece button in Task Proxy and choose **Install from folder** to try it.

</webui-page-segment>
