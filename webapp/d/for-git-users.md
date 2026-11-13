<webui-data data-page-title="Task Proxy for Everyone Who Uses Git" data-page-subtitle="Writers, designers, students, and anyone else keeping files in git"></webui-data>

## Git without the command line

<webui-page-segment elevation="10">

Git isn't only for code. Writers keep books and documentation in it, designers keep assets, researchers keep data and papers, and students hand in coursework through it. Most of the time you only need a few things: see what changed, save a version, and share it.

Task Proxy's **Git Controller** does those in plain buttons, and stops you before anything would lose your work.

</webui-page-segment>

## See exactly what changed

<webui-page-segment elevation="10">

Every file you changed is listed, marked **Add**, **Modify**, or **Delete**. Click one to see the old and new versions side by side, with changed lines highlighted.

<webui-loop-video src="/video/loops/git-changes.mp4" poster="/video/loops/git-changes.webp" alt="The Git Controller listing four changed files, with the old and new versions of cart.js side by side"></webui-loop-video>

</webui-page-segment>

## Save a version, then share it

<webui-page-segment elevation="10">

1. Write a short note about what you changed.
2. Click **Commit** to save a version.
3. Click **Sync** to get everyone else's changes and send yours.

Turn on **Sync after commit** and step 3 happens on its own.

<webui-flex align="center" justify="center">
<video controls playsinline preload="none" poster="/video/git-commit-sync.webp">
    <source src="/video/git-commit-sync.mp4" type="video/mp4">
</video>
</webui-flex>

<webui-flex gap="var(--padding)" wrap>
    <webui-link href="/tutorials/commit-and-sync" icon="emoji-octopus" theme="primary">Tutorial: Review, commit, and sync</webui-link>
</webui-flex>

</webui-page-segment>

## Mistakes are easy to undo

<webui-page-segment elevation="10">

- **Undo a file:** click the trash can beside it to put it back the way it was at your last commit.
- **Set work aside:** **Stash** saves your changes and clears them away, and **Pop Stash** brings them back.
- **Safe updates:** **Pull** and switching branches stop rather than overwrite changes you haven't saved yet.

</webui-page-segment>

## Try ideas on a branch

<webui-page-segment elevation="10">

A branch is a separate copy of your work to try something out. Create one from the **Branches** tab, switch between them with one click, and merge the one you keep.

<webui-flex gap="var(--padding)" wrap>
    <webui-link href="/tutorials/branches" icon="emoji-deciduous_tree" theme="primary">Tutorial: Work with branches</webui-link>
</webui-flex>

</webui-page-segment>

## Edit markdown with a preview

<webui-page-segment elevation="10">

Documentation and notes in markdown? The **Docs Manager** shows the formatted result beside the text as you type.

<webui-flex gap="var(--padding)" wrap>
    <webui-link href="/tutorials/docs" icon="emoji-books" theme="primary">Tutorial: Edit your project's docs</webui-link>
</webui-flex>

</webui-page-segment>

## Getting connected

<webui-page-segment elevation="10">

To sync with a service such as GitHub, Task Proxy needs a personal access token, a kind of password made for apps. Your git host's settings let you create one. Task Proxy asks for it the first time it's needed, encrypts it, and keeps it on your computer.

<webui-flex gap="var(--padding)" wrap>
    <webui-link href="/tutorials/first-project" icon="emoji-rocket" theme="primary">Tutorial: Set up Task Proxy</webui-link>
</webui-flex>

</webui-page-segment>
