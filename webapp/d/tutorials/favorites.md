<webui-data data-page-title="Run Your Favorite Scripts in One Click" data-page-subtitle="Tutorial: about 5 minutes" data-page-description="Keep the scripts you run most in a row at the bottom of Task Proxy, with their parameters set, and run each in one click."></webui-data>

## What favorites are for

<webui-page-segment elevation="10">

Some scripts you run all day: start the dev server, run the tests, reset the database. **Favorite scripts** sit in a row at the bottom of Task Proxy, each as an icon, so they are one click away from any page and any project.

- **Click** an icon to run its script. It opens in the **Terminals** tab of **Tools**, like any other run.
- **Hover** an icon to see its script's first line.
- **Drag** icons, or press **Alt+Left** and **Alt+Right**, to put them in order.
- When there are more than fit, the ellipsis at the right shows them all.

A favorite always runs in the project it came from, even while another project is open, so a button for a server in one project works from anywhere.

<webui-loop-video src="/video/loops/favorites.mp4" poster="/video/loops/favorites.webp" alt="Adding a script as a favorite, then running it from the favorites row at the bottom of Task Proxy"></webui-loop-video>

</webui-page-segment>

## 1. Add a favorite

<webui-page-segment elevation="10">

1. Click the pencil at the left of the favorites row. **Favorite Scripts** opens over most of the page.
2. Click **Add Script**, and pick a script **On this page**, or one of the project's **Script files**.
3. Give it a **Name** and an icon: a Web UI icon or emoji, or an image from the project.

</webui-page-segment>

## 2. Set its parameters

<webui-page-segment elevation="10">

A script with parameters lists them under **Parameters**. Each one is either:

- **Fixed:** always the value you type here, such as `e2e` for a test suite.
- **From data:** filled from your variables when it runs, the same way a page's script is.

**Data may come from** chooses which variables it may use: the **Page**'s, the **Project**'s, and your **Global** ones. Secrets are filled in by Task Proxy as the script starts, so they never pass through the window.

</webui-page-segment>

## 3. Choose where it shows

<webui-page-segment elevation="10">

Under **Show in**, choose **Every project**, or **Only these projects** and tick the ones you want. Your favorites are kept in Task Proxy rather than in a project, so the same row follows you from project to project.

**Remove** takes a favorite out of the row. The script itself is left alone.

</webui-page-segment>

<webui-flex justify="flex-end">
    <webui-button href="/tutorials/make-it-yours" theme="primary" end-icon="chevrons-right">Continue to Make Task Proxy yours</webui-button>
</webui-flex>
