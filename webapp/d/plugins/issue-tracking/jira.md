<webui-data data-page-title="Jira Plugin" data-page-subtitle="Jira Cloud, without the wait"></webui-data>

## Jira inside Task Proxy

<webui-page-segment elevation="10">

The Jira plugin brings the parts of Jira you use every day into Task Proxy: your issue list, each issue together with the story and epic above it, new issues, and a branch for each issue. It talks to Jira Cloud (`your-team.atlassian.net`) directly, so pages open quickly and show only what you asked for.

<webui-loop-video src="/video/loops/jira/my-issues.mp4" poster="/video/loops/jira/my-issues.webp" alt="My Issues, listing issues with their status, priority, sprint, and story points"></webui-loop-video>

</webui-page-segment>

## Set it up

<webui-page-segment elevation="10">

1. Click the puzzle piece button at the top of Task Proxy, beside **Icons & Emojis**, and install **Jira**.
2. Create an API token on [Atlassian's API tokens page](https://id.atlassian.com/manage-profile/security/api-tokens).
3. In the same panel, open Jira's **Settings** and enter your Jira site, such as `https://your-team.atlassian.net`, the email you sign in with, and the token.

The token is saved encrypted on your computer, and only the Jira plugin can read it. To use a different Jira site in one project, set a `jira_site` variable on that project.

</webui-page-segment>

## My Issues

<webui-page-segment elevation="10">

**My Issues** starts with your open issues, newest change first. Type any JQL to search, as in Jira's advanced search, and save searches you use often, such as your sprint's bugs. Click a row to open the issue.

</webui-page-segment>

## Each issue with its parents

<webui-page-segment elevation="10">

Jira shows one issue at a time, so the story or epic a task belongs to is another click away. Task Proxy shows them together. The issue comes first, then its parent, then the parent's parent, each in its own section you can open or close. Task Proxy remembers which you closed.

<webui-loop-video src="/video/loops/jira/issue.mp4" poster="/video/loops/jira/issue.webp" alt="An issue with its status, people, story points, description, and comments, followed by its parent story"></webui-loop-video>

From the issue you can:

- **Move it** to another status.
- **Comment**, with markdown for bold, italics, code, lists, and links.
- **Create branch**, named after the issue, such as `ATL-142-show-ci-status-on-the-dashboard`.
- **Open in Jira**, for anything else.

<webui-loop-video src="/video/loops/jira/issue-parents.mp4" poster="/video/loops/jira/issue-parents.webp" alt="The parent story with its acceptance criteria, and the epic above it"></webui-loop-video>

</webui-page-segment>

## Views: choose what each level shows

<webui-page-segment elevation="10">

A **View** sets which fields show for the issue, and separately for its parent, its grandparent, and so on. For example, a team view might show a task's status, people, story points, sprint, description, and comments; its story's description, acceptance criteria, and comments; and only the epic's description.

<webui-loop-video src="/video/loops/jira/views.mp4" poster="/video/loops/jira/views.webp" alt="The Views page, listing the built-in View and a project View"></webui-loop-video>

Open **Views** in the menu to make one:

1. Click **New View**, or **Copy** on the built-in one.
2. In each layer, add the fields you want, including your site's custom fields, and move them up or down.
3. Add a layer for each level of parent you want to see.
4. Save it for yourself, or for the project. A project View is saved in the project's `.taskproxy` folder, so everyone on the project gets it through git.

<webui-loop-video src="/video/loops/jira/view-editor.mp4" poster="/video/loops/jira/view-editor.webp" alt="Editing a View, with fields for the issue, its parent, and its grandparent"></webui-loop-video>

Choose a View at the top of any issue. Task Proxy remembers the last one you picked.

</webui-page-segment>

## Create issues

<webui-page-segment elevation="10">

**Create Issue** asks for the project, type, summary, and description, and optionally a parent. It assigns the issue to you unless you clear the box, then opens it.

<webui-loop-video src="/video/loops/jira/create-issue.mp4" poster="/video/loops/jira/create-issue.webp" alt="Creating an issue in the Atlas project"></webui-loop-video>

</webui-page-segment>

## Your branch's issue in the Git Controller

<webui-page-segment elevation="10">

When your branch name has an issue key in it, such as `ATL-142-…` or `feature/atl-142-…`, the **Git Controller** shows that issue's status, summary, and who has it, under the branch. Click the key to open the issue.

<webui-loop-video src="/video/loops/jira/git-controller-card.mp4" poster="/video/loops/jira/git-controller-card.webp" alt="The Git Controller showing the issue for the current branch"></webui-loop-video>

</webui-page-segment>

## What it can reach

<webui-page-segment elevation="10">

- **Websites:** only `*.atlassian.net`, over HTTPS.
- **Settings:** your Jira site, email, and API token.
- **Git:** reading the current branch, and creating a branch when you click **Create branch**.
- **Your projects:** only `.taskproxy/plugins/jira`, where project Views are saved.

The screenshots use a made-up project called **Atlas**.

</webui-page-segment>
