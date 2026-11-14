<webui-data data-page-title="Jira Plugin" data-page-subtitle="Jira Cloud, without the wait"></webui-data>

## Jira inside Task Proxy

<webui-page-segment elevation="10">

The Jira plugin brings the parts of Jira you use every day into Task Proxy: your issues and your team's, which you can change right in the list, each issue together with the story and epic above it, new issues, and a branch for each issue. It talks to Jira Cloud (`your-team.atlassian.net`) directly, so pages open quickly and show only what you asked for.

<webui-loop-video src="/video/loops/jira/my-issues.mp4" poster="/video/loops/jira/my-issues.webp" alt="My Issues, listing issues with their status, priority, sprint, and story points"></webui-loop-video>

</webui-page-segment>

## Set it up

<webui-page-segment elevation="10">

1. Click the puzzle piece button at the top of Task Proxy, beside **Icons & Emojis**, and install **Jira**.
2. Create an API token on [Atlassian's API tokens page](https://id.atlassian.com/manage-profile/security/api-tokens).
3. With your project open, open Jira's **Settings for this project** in the same panel, and enter your Jira site, such as `https://your-team.atlassian.net`, the email you sign in with, and the token.

Jira is set up one project at a time, so each project only reaches the Jira account it was set up with, and Jira's pages only show in projects that have one. A project you have not set up shows no Jira menu at all. To add Jira to another project, open it, then open Jira's **Settings for this project** in the plugins panel, and use the settings you already entered or new ones for that project, such as a client's Jira. The token is saved encrypted on your computer, and only the Jira plugin can read it.

</webui-page-segment>

## My Issues and All Issues

<webui-page-segment elevation="10">

**My Issues** starts with your open issues, newest change first, and **All Issues** with everyone's, so you can see your team's work and filter it by who it is assigned to.

- **Filters:** open **Filters** beside **Search** to narrow the list by project, type, status, priority, or sprint. All Issues also filters by one or more people, or by issues nobody has yet.
- **JQL:** the **JQL** button shows the query behind the list, which you can change as in Jira's advanced search. The filters are added to it.
- **Sorting:** click a column title to sort by it, and click it again to reverse the order.
- **Columns:** choose the columns from the issue, its parent, and its grandparent, such as the story a task belongs to.
- **Saved searches:** save the searches you use often, such as your sprint's bugs, filters and sort included.

Click an issue's key to open it.

</webui-page-segment>

## Change issues without opening them

<webui-page-segment elevation="10">

Status, priority, assignee, sprint, story points, and other fields picked from a list change right in the table. Click the value, then choose a new one. Long text is cut short in the table: point at it to read more, or click it to read all of it, and edit it there when Jira lets you.

<webui-loop-video src="/video/loops/jira/change-in-place.mp4" poster="/video/loops/jira/change-in-place.webp" alt="Changing an issue's status from the My Issues table"></webui-loop-video>

</webui-page-segment>

## Comments and mentions

<webui-page-segment elevation="10">

The Comment column shows each issue's latest comment. Click it to read every comment and add your own. Type **@** and a few letters to mention someone, as in Jira, and pick them from the people who can see the issue. Mentions work on the issue page too.

<webui-loop-video src="/video/loops/jira/comments.mp4" poster="/video/loops/jira/comments.webp" alt="Reading an issue's comments and mentioning a teammate in a new one"></webui-loop-video>

</webui-page-segment>

## Your team's issues

<webui-page-segment elevation="10">

<webui-loop-video src="/video/loops/jira/all-issues.mp4" poster="/video/loops/jira/all-issues.webp" alt="All Issues with its filters open, including who issues are assigned to"></webui-loop-video>

</webui-page-segment>

## Notifications

<webui-page-segment elevation="10">

Your Jira notifications show in Task Proxy's alerts, behind the bell at the top. Click an issue in one to open it, and close one to mark it read. Jira's **Notifications** page lists them too.

When Jira's notification bell does not answer the plugin, the notifications are what others did on issues you are assigned, reported, or watch in the last week: mentions, comments, assignments, and status changes. Those are marked read in Task Proxy only.

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
