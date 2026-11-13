<webui-data data-page-title="Review, Commit, and Sync Your Changes" data-page-subtitle="Tutorial: about 5 minutes"></webui-data>

## Watch it first

<webui-page-segment elevation="10">

<webui-flex align="center" justify="center">
<video controls playsinline preload="none" poster="/video/git-commit-sync.webp">
    <source src="/video/git-commit-sync.mp4" type="video/mp4">
    Your browser can't play this video. The steps below cover the same thing.
</video>
</webui-flex>

</webui-page-segment>

## Before you start

<webui-page-segment elevation="10">

- Add your project to Task Proxy. See [Set up Task Proxy and your first project](/tutorials/first-project).
- To pull and push, Task Proxy needs a personal access token from your git host, such as GitHub. See step 5.

Open the **Git Controller** from the octopus icon at the bottom of the left navigation.

</webui-page-segment>

## 1. See what changed

<webui-page-segment elevation="10">

The top of the Git Controller shows where you are: the remote, the branch you're tracking, and how many commits you are ahead of or behind it. Below that, **Files to Commit** and **Lines Changed** add up what your next commit holds.

Every changed file is listed on the left, marked **Add**, **Modify**, or **Delete**. Click a file to see its changes on the right, with the old version beside the new one. Use the up and down arrow keys to move through the list. Check **Show Full File** to see the whole file rather than only the changed parts.

Lots of files? Type part of a path in **Filter files** to narrow the list.

<webui-loop-video src="/video/loops/git-changes.mp4" poster="/video/loops/git-changes.webp" alt="The Git Controller showing four changed files, and the changes to cart.js side by side"></webui-loop-video>

</webui-page-segment>

## 2. Choose what goes in the commit

<webui-page-segment elevation="10">

Each file starts as **Include**. Change it to:

- **Exclude** to leave it out of this commit only.
- **Ignore** to leave it out of every commit until you include it again. This suits local settings files you change but never commit.

**Toggle All** includes or excludes every file in the list, and leaves ignored files alone.

To throw away your changes to one file, click its trash can. **Revert All** at the top throws away every uncommitted change, so use it with care.

</webui-page-segment>

## 3. Write a message and commit

<webui-page-segment elevation="10">

Type a **Commit Message** and click **Commit**.

Task Proxy remembers the message for each project and repository until the commit succeeds. You can switch projects, or close the app, without losing what you wrote.

<webui-loop-video src="/video/loops/git-commit-ready.mp4" poster="/video/loops/git-commit-ready.webp" alt="A commit message typed in, with nav.json excluded, so Files to Commit shows 3 of 4"></webui-loop-video>

</webui-page-segment>

## 4. Sync with your team

<webui-page-segment elevation="10">

**Sync** pulls your teammates' commits, then pushes yours. Turn on **Sync after commit** to do this every time you commit.

The other buttons give you finer control:

| Button | What it does |
|---|---|
| **Fetch** | Checks the remote for new commits without changing your files |
| **Pull** | Brings in remote commits. It stops rather than overwrite work you haven't committed |
| **Push** | Sends your commits to the remote |
| **Force Pull** | Replaces your branch with the remote one, throwing away your local commits and changes |

</webui-page-segment>

## 5. Add your access token

<webui-page-segment elevation="10">

Pull and push need a personal access token. Task Proxy asks for one the first time it needs it, or you can set it in advance on the **Auth** tab:

- **Project Level** uses the token for this project only.
- **Global Level** uses it for every project.

The token is encrypted and stays on your computer. It's never shown to pages or page scripts.

<webui-loop-video src="/video/loops/git-auth.mp4" poster="/video/loops/git-auth.webp" alt="The Auth tab of the Git Controller, for entering a personal access token at project or global level"></webui-loop-video>

</webui-page-segment>

## Next steps

<webui-page-segment elevation="10">

- [Work with branches](/tutorials/branches)
- [Task Proxy for everyone who uses git](/for-git-users)

</webui-page-segment>
