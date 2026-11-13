<webui-data data-page-title="Use Variables, Secrets, and Environments" data-page-subtitle="Tutorial: about 10 minutes"></webui-data>

## Watch it first

<webui-page-segment elevation="10">

<webui-flex align="center" justify="center">
<video controls playsinline preload="none" poster="/video/page-script-environment.webp">
    <source src="/video/page-script-environment.mp4" type="video/mp4">
    Your browser can't play this video. The steps below cover the same thing.
</video>
</webui-flex>
</webui-page-segment>

## Why use variables

<webui-page-segment elevation="10">

Scripts and pages often need values that differ from person to person, or from one environment to the next: an API address, a database name, an access token. Variables keep those values out of the script, so:

- **Secrets stay out of your repository.** Values are encrypted and stay on your computer.
- **Everyone can share one script.** Each person fills in their own values.
- **Switching environments is one click.** Pick staging, and every staging value is used at once.

Open **Manage Variables** from the **$** at the top right.

</webui-page-segment>

## 1. Define a project variable

<webui-page-segment elevation="10">

1. Open the **Project** tab.
2. Type the variable's name in **Key**, and click **Add**.
3. Type its value in the box beside its name.

The name is saved in `.taskproxy/Variables.json`, so your teammates see it too once you commit. The value you typed stays on your computer.

Each row also has buttons to copy the value to the clipboard, clear it, or delete the variable.

<webui-loop-video src="/video/loops/variables-project.mp4" poster="/video/loops/variables-project.webp" alt="Manage Variables open on the Project tab, with apiBaseUrl, environment, and releaseType variables for the dev environment"></webui-loop-video>

</webui-page-segment>

## 2. Add environments

<webui-page-segment elevation="10">

The **Environment** dropdown on the Project tab holds a separate set of values for each environment. Every project starts with `dev`.

1. Click **Manage** to add, rename, or delete environments, for example `staging` and `prod`.
2. Choose an environment in the dropdown, and enter its values.

From then on, choosing an environment swaps in all of its values at once. Anything the environment leaves blank falls back to your global value of the same name.

</webui-page-segment>

## 3. Keep personal secrets global

<webui-page-segment elevation="10">

The **Global** tab holds values for every project, such as your personal access token. Task Proxy reads your git token from a variable named `github_pat` or `git_pat`, from the project first and then from global.

<webui-loop-video src="/video/loops/variables-global.mp4" poster="/video/loops/variables-global.webp" alt="Manage Variables open on the Global tab, with deployToken and github_pat variables"></webui-loop-video>

</webui-page-segment>

## 4. Use variables in a script

<webui-page-segment elevation="10">

In a page script, write the variable as an ordinary PowerShell variable with a placeholder value:

```pwsh
$apiBaseUrl = 'https://dev.api.acme.test'
Invoke-RestMethod "$apiBaseUrl/health"
```

When it runs, Task Proxy puts the value of the **apiBaseUrl** variable in place of `'https://dev.api.acme.test'`. Variables with no value set leave the script as written, so the placeholder doubles as a default.

The **Page** tab lists the variables the current page's scripts use, so you can set a value for this page only.

When Task Proxy shows a script before running it, values longer than six characters are masked, such as `htt***est`, so secrets aren't shown on screen.

</webui-page-segment>

## Which value wins

<webui-page-segment elevation="10">

When the same name is set in more than one place, Task Proxy uses the first it finds:

1. **Page**
2. **Project**, from the active environment
3. **Global**

The **Enabled** switches at the top of Manage Variables turn a whole scope off for a while. It's a quick way to test what a script does without your page or project values.

</webui-page-segment>

<webui-quote theme="warning">

Variables can also have a default value, which is saved in `Variables.json` and committed. Never use a password or token as a default.

</webui-quote>

## Next steps

<webui-page-segment elevation="10">

- [Build a page for your team](/tutorials/team-pages)
- [How Task Proxy works](/how-it-works)

</webui-page-segment>
