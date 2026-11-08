<webui-data data-page-title="Task Proxy for Developers" data-page-subtitle="Less context switching between your editor, terminal, and notes"></webui-data>

## Everything around the code, in one window

<webui-page-segment elevation="10">

A typical day jumps between an editor, a few terminals, a git tool, a notes file of commands you can never remember, and a password manager for the tokens those commands need. Task Proxy brings the parts that aren't the editor together, per project, and remembers where you left each one.

</webui-page-segment>

## Run scripts without remembering their flags

<webui-page-segment elevation="10">

Open any `.ps1` file in your project in the **Script Manager**. Task Proxy reads its `param()` block and gives you an input for each parameter, then shows the exact command it will run.

Scripts run in a real terminal, so test runners, build tools, and progress bars look the same as in your own. When a script asks a question, click the terminal and type the answer. Ctrl+C stops it.

<webui-flex align="center" justify="center">
<video controls playsinline preload="none" poster="/video/script-prompt.webp">
    <source src="/video/script-prompt.mp4" type="video/mp4">
</video>
</webui-flex>

<webui-flex gap="var(--padding)" wrap>
    <webui-link href="/tutorials/run-scripts" icon="emoji-scroll" theme="primary">Tutorial: Run scripts and answer their prompts</webui-link>
</webui-flex>

</webui-page-segment>

## Review and commit quickly

<webui-page-segment elevation="10">

The **Git Controller** lists every change with a side-by-side diff. Step through files with the arrow keys, leave files out of a commit, and see how many files and lines you're about to commit. **Sync** pulls and pushes in one click, and **Sync after commit** does it for you.

Your commit message is kept per project and repository until the commit succeeds, so switching tasks never loses it.

![The Git Controller, showing changed files, a commit message, and a side-by-side diff](/img/tutorials/git-commit-ready.webp)

<webui-flex gap="var(--padding)" wrap>
    <webui-link href="/tutorials/commit-and-sync" icon="emoji-octopus" theme="primary">Tutorial: Review, commit, and sync</webui-link>
    <webui-link href="/tutorials/branches" icon="emoji-deciduous_tree" theme="secondary">Tutorial: Work with branches</webui-link>
</webui-flex>

</webui-page-segment>

## Keep tokens out of your scripts

<webui-page-segment elevation="10">

Stop pasting tokens into terminals and `.env` files. Set them once as global variables, encrypted on your computer, and Task Proxy fills them into page scripts when they run. Environments switch a project between dev, staging, and prod in one click.

<webui-flex gap="var(--padding)" wrap>
    <webui-link href="/tutorials/variables-and-environments" icon="emoji-key" theme="primary">Tutorial: Use variables, secrets, and environments</webui-link>
</webui-flex>

</webui-page-segment>

## Turn your notes into pages

<webui-page-segment elevation="10">

That notes file of commands works better as a page: headings, a sentence on when to use each command, and a run button beside it. Keep it to yourself, or commit it and the whole team has it.

<webui-flex gap="var(--padding)" wrap>
    <webui-link href="/tutorials/team-pages" icon="emoji-page_facing_up" theme="primary">Tutorial: Build a page</webui-link>
</webui-flex>

</webui-page-segment>

## Many projects, one app

<webui-page-segment elevation="10">

Add every repository you work on and switch between them from the **Project** dropdown. Each one keeps its own pages, variables, terminals, and commit message. A project with several repositories inside it, such as a front end and an API, shows each one in the Git Controller's **Repo** dropdown.

</webui-page-segment>
