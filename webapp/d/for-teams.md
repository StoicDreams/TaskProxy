<webui-data data-page-title="Task Proxy for Teams" data-page-subtitle="Share how your project works, in the project itself"></webui-data>

## Your team's knowledge, next to your code

<webui-page-segment elevation="10">

Most teams keep their how-to knowledge in a wiki, a chat thread, or one person's head. It drifts out of date, and new people can't tell which parts still work.

Task Proxy keeps it in the repository. Pages, navigation, and variable definitions live in the project's `.taskproxy` folder, so they're reviewed, versioned, and branched like the code they describe. When a step changes, the page changes in the same commit.

</webui-page-segment>

## Onboard people in an afternoon

<webui-page-segment elevation="10">

Write an onboarding page once: what to install, how to configure it, how to start the app. Put the commands for each step right under it.

A new teammate clones the repository, adds it to Task Proxy, and follows the page from top to bottom, running each step with a click. They don't need to know PowerShell, or to copy commands out of a document.

<webui-loop-video src="/video/loops/page-onboarding.mp4" poster="/video/loops/page-onboarding.webp" alt="An onboarding page in Task Proxy, with steps and a run button on each script"></webui-loop-video>

<webui-flex gap="var(--padding)" wrap>
    <webui-link href="/tutorials/team-pages" icon="emoji-page_facing_up" theme="primary">Tutorial: Build a page for your team</webui-link>
</webui-flex>

</webui-page-segment>

## Runbooks people can trust

<webui-page-segment elevation="10">

Release checklists, deploys, health checks, data fixes: the jobs you do rarely are the ones most likely to go wrong. Put each one on a page, with its scripts.

- **The steps and the commands can't drift apart**, because they're in the same file.
- **Anyone can do the job**, not only the person who wrote the script.
- **Changes are reviewed** in pull requests, like any other change.

<webui-flex align="center" justify="center">
<video controls playsinline preload="none" poster="/video/build-a-page.webp">
    <source src="/video/build-a-page.mp4" type="video/mp4">
</video>
</webui-flex>

</webui-page-segment>

## One script, every environment, no shared secrets

<webui-page-segment elevation="10">

Scripts often need tokens and addresses. Sharing those in a repository is a risk, and asking everyone to edit the script is error-prone.

With Task Proxy, the script names the variables it needs. Each person enters their own values, which are encrypted and stay on their computer. Environments such as dev, staging, and prod switch every value at once, so the same page deploys anywhere.

<webui-flex gap="var(--padding)" wrap>
    <webui-link href="/tutorials/variables-and-environments" icon="emoji-key" theme="primary">Tutorial: Use variables, secrets, and environments</webui-link>
</webui-flex>

</webui-page-segment>

## Safe by default

<webui-page-segment elevation="10">

- **Scripts ask first.** Before a project's script runs for the first time, Task Proxy shows it, with long values masked, and asks whether you trust the project.
- **Git won't lose work.** Pull, merge, and switching branches stop rather than overwrite uncommitted changes.
- **Tokens stay private.** Git tokens are never shown to pages or page scripts.

</webui-page-segment>

## Get your team started

<webui-page-segment elevation="10">

1. Add your repository to Task Proxy, and write one page for the job people ask you about most.
2. Commit the `.taskproxy` folder.
3. Ask your team to install Task Proxy and add the repository. Your page is waiting for them.

<webui-flex gap="var(--padding)" wrap>
    <webui-link href="/getting-started" icon="emoji-rocket" theme="primary">Getting Started</webui-link>
    <webui-link href="/how-it-works" icon="emoji-gear" theme="secondary">How Task Proxy works</webui-link>
</webui-flex>

</webui-page-segment>
