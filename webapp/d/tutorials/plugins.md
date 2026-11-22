<webui-data data-page-title="Add a Plugin" data-page-subtitle="Tutorial: about 5 minutes" data-page-description="Install a Task Proxy plugin, set it up for a project, use it, reuse it in another project, and turn it off or remove it."></webui-data>

## What you'll do

<webui-page-segment elevation="10">

Plugins connect Task Proxy to the other tools you use, such as Jira. This tutorial installs one, sets it up for a project, and shows where its pages appear. Jira is the example, but every plugin works the same way.

Want to know what a plugin can reach before you start? See [what a plugin can reach](/plugins).

</webui-page-segment>

## 1. Install it

<webui-page-segment elevation="10">

1. Open **Tools**, the toolbox at the top right, and choose its **Plugins** tab, the puzzle piece.
2. Under **Available**, click **Install** on the plugin you want.
3. Task Proxy lists what the plugin will be able to reach, such as the websites it talks to and the settings it reads. Read it, and click **Install**.

Plugins from the catalog are signed, and Task Proxy checks the signature before it installs one. When a newer version comes out, its button changes to **Update**.

</webui-page-segment>

## 2. Set it up for this project

<webui-page-segment elevation="10">

A plugin only shows in projects you set it up for, so each project reaches only the accounts you chose for it.

1. Open the project you want to use it in.
2. In the **Plugins** panel, open the plugin's **Settings for this project**.
3. Enter what it asks for, such as your Jira site, email, and API token, and click **Save for this project**.

A plugin that needs no settings has **Use in this project** in their place.

Settings are saved encrypted on your computer, and only that plugin can read them. Other plugins, your pages, and your scripts can't.

<webui-loop-video src="/video/loops/plugins-drawer.mp4" poster="/video/loops/plugins-drawer.webp" alt="The Plugins panel, with Jira installed and its settings open"></webui-loop-video>

</webui-page-segment>

## 3. Use it

<webui-page-segment elevation="10">

The plugin's pages appear in the left menu straight away, under its own name. Jira, for example, adds **My Issues**, **All Issues**, **Create Issue**, **Views**, **Branch Names**, and **Notifications**.

A plugin can also add to tools you already use. Jira shows the issue for your current branch in the **Git Controller**, under the branch.

<webui-loop-video src="/video/loops/jira/my-issues.mp4" poster="/video/loops/jira/my-issues.webp" alt="My Issues, listing issues with their status, priority, sprint, and story points"></webui-loop-video>

See the [Jira plugin](/plugins/issue-tracking/jira) for everything it does.

</webui-page-segment>

## 4. Use it in another project

<webui-page-segment elevation="10">

Open the other project, then the plugin's **Settings for this project**:

- **Use settings from another project** reuses what you already entered, so you type your token once.
- **Or enter new settings for this project** suits a different account, such as a client's Jira.

**Stop using them in this project** takes the plugin out of the open project only. The other projects keep it.

</webui-page-segment>

## 5. Turn it off or remove it

<webui-page-segment elevation="10">

- **Turn off** hides the plugin in every project, and keeps its settings for when you **Turn on** again.
- **Remove** uninstalls it and deletes its settings.

</webui-page-segment>

<webui-flex justify="flex-end">
    <webui-button href="/tutorials/ai" theme="primary" end-icon="chevrons-right">Continue to Write with AI</webui-button>
</webui-flex>
