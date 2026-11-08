<webui-data data-page-title="Build a Page for Your Team" data-page-subtitle="Tutorial: about 10 minutes"></webui-data>

## Watch it first

<webui-page-segment elevation="10">

<webui-flex align="center" justify="center">
<video controls playsinline preload="none" poster="/video/build-a-page.webp">
    <source src="/video/build-a-page.mp4" type="video/mp4">
    Your browser can't play this video. The steps below cover the same thing.
</video>
</webui-flex>
</webui-page-segment>

## What a page is for

<webui-page-segment elevation="10">

A page is a document that can do things. Write the steps for a job in markdown, and include the PowerShell that carries each one out. Anyone on your team can then follow the page and run each step with a click.

Pages are saved in your project's `.taskproxy/pages` folder. Commit them, and everyone who opens the project in Task Proxy gets them.

Good first pages:

- **Onboarding:** install the tools, set up local settings, and start the app.
- **Release checklist:** run the tests, bump the version, and publish.
- **Runbooks:** health checks, restarts, and other jobs you don't do often enough to remember.

![An onboarding page with headings, steps, and PowerShell blocks that each have a run button](/img/tutorials/page-onboarding.webp)

</webui-page-segment>

## 1. Add the page to the navigation

<webui-page-segment elevation="10">

1. Open the **Navigation Manager** from the compass icon at the bottom of the left navigation.
2. Click **Add Page**, or **Add Folder** to group pages together.
3. Type a **Name**, and pick an icon from **Icon Search**.
4. Drag items to reorder them, or to move a page into a folder.
5. Click **Save**. **Cancel** throws away your changes.

![The Navigation Manager, with the project's pages and folders on the left and Icon Search on the right](/img/tutorials/nav-manager.webp)

</webui-page-segment>

## 2. Write the page

<webui-page-segment elevation="10">

Open the new page from the left navigation.

1. Click the header at the top to give the page a title and subtitle.
2. Click **Add** to add a segment. Each segment is a heading, a block of text, or a line.
3. Click a segment's edit button to open its editor. Choose its type, type its content in markdown, and click the edit button again to close it.
4. Drag a segment by its edit button to move it.
5. Click **Save**.

![A segment open for editing, with its markdown on the left and a preview on the right](/img/tutorials/page-edit-segment.webp)

</webui-page-segment>

## 3. Add scripts

<webui-page-segment elevation="10">

A fenced code block marked `pwsh`, `powershell`, or `ps1` becomes a script with a run button:

````markdown
Drops and reseeds the local database. Your data is lost.

```pwsh
$databaseName = 'acme_dev'
npm run db:reset -- --database $databaseName
```
````

If a variable called **databaseName** is set, Task Proxy puts its value into the script in place of `'acme_dev'` when it runs. Each teammate can then use their own value without editing the page. See [Use variables, secrets, and environments](/tutorials/variables-and-environments).

You can also show a variable's value in the page text. Write its name in capitals inside braces, so a variable named `api_url` shows as `{API_URL}`.

</webui-page-segment>

## 4. Run a step

<webui-page-segment elevation="10">

Click the run button on a script. The first time you run a script from a project, Task Proxy shows you the script, with long values masked, and asks whether you trust the project. Scripts can do anything your user account can, so only trust projects you know.

The script runs in the Terminal Manager, which opens to show its output.

![The Run Script From This Project prompt, showing the script with its value masked, and a Trust Project and Run button](/img/tutorials/page-script-confirm.webp)

</webui-page-segment>

## 5. Share it

<webui-page-segment elevation="10">

Commit the new files in `.taskproxy`, the page and `Navigation.json`, and push. Teammates get the page the next time they pull.

</webui-page-segment>

## Next steps

<webui-page-segment elevation="10">

- [Use variables, secrets, and environments](/tutorials/variables-and-environments)
- [Task Proxy for teams](/for-teams)

</webui-page-segment>
