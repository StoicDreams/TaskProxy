<webui-data data-page-title="Work with Branches" data-page-subtitle="Tutorial: about 5 minutes"></webui-data>

## Why branches

<webui-page-segment elevation="10">

A branch lets you work on one change without disturbing anyone else. A common pattern is one branch per feature or fix, merged into `main` when it's done.

In the **Git Controller**, open the **Branches** tab. It lists your local branches and the remote ones, such as `origin/main`, with when each was last updated. A star marks the branch you're on.

<webui-loop-video src="/video/loops/git-branches.mp4" poster="/video/loops/git-branches.webp" alt="The Branches tab, listing local and remote branches with Switch, New, Merge, and Delete buttons"></webui-loop-video>

</webui-page-segment>

## Start a new branch

<webui-page-segment elevation="10">

1. Find the branch to start from, usually `main` or `origin/main`, and click **New** on its row.
2. Name the new branch, for example `feature/cart-discounts` or `bug/checkout-rounding`.

Starting from `origin/main` gives you your team's latest work, if you fetched recently.

</webui-page-segment>

## Switch branches

<webui-page-segment elevation="10">

Click **Switch** on the branch you want.

Task Proxy won't switch if it would overwrite changes you haven't committed. Commit them, or put them aside with a stash first.

</webui-page-segment>

## Put work aside with a stash

<webui-page-segment elevation="10">

Need to switch branches in the middle of something?

1. Click **Stash** at the top of the Git Controller. Your uncommitted changes are saved and your files go back to the last commit.
2. Switch branches, and do what you need to.
3. Switch back, and click **Pop Stash** to bring your changes back.

</webui-page-segment>

## Merge a branch

<webui-page-segment elevation="10">

Click **Merge** on a branch to bring its commits into the branch you're on. For example, to update your feature branch with your team's latest work, switch to the feature branch and merge `origin/main` into it.

If both branches changed the same lines, Task Proxy tells you the merge has conflicts and leaves conflict markers (`<<<<<<<`) in those files. Fix each file in your editor, then commit. Task Proxy won't commit a file that still has conflict markers in it.

</webui-page-segment>

## Clean up

<webui-page-segment elevation="10">

Click **Delete** to remove a branch you no longer need. This removes your local copy only. The branch stays on the remote.

</webui-page-segment>

## Next steps

<webui-page-segment elevation="10">

- [Review, commit, and sync your changes](/tutorials/commit-and-sync)
- [Task Proxy for teams](/for-teams)

</webui-page-segment>
