<webui-data data-page-title="Task Proxy for Developers" data-page-subtitle="Less context switching between your editor, terminal, and notes" data-page-description="Run scripts, find stray processes, review commits, and keep tokens out of your code, all from one window beside your editor."></webui-data>

## Everything around the code, in one window

<webui-page-segment elevation="10">

A typical day jumps between an editor, a few terminals, a git tool, a notes file of commands you can never remember, and a password manager for the tokens those commands need. Task Proxy brings the parts that aren't the editor together, per project, and remembers where you left each one.

</webui-page-segment>

## Run scripts without remembering their flags

<webui-page-segment elevation="10">

Open any `.ps1` file in your project in the **Script Manager**. Task Proxy reads its `param()` block and gives you an input for each parameter, then shows the exact command it will run.

Scripts run in a real terminal, so test runners, build tools, and progress bars look the same as in your own. When a script asks a question, click the terminal and type the answer. Ctrl+C stops it.

A script that starts your dev servers can open each one as a terminal in Task Proxy, rather than a window of its own, with one line of PowerShell:

```pwsh
Start-TaskProxyTerminal -Name 'api' -Command "& './scripts/run-api.ps1'" -Replace
```

<webui-flex align="center" justify="center">
<video controls playsinline preload="none" poster="/video/script-prompt.webp">
    <source src="/video/script-prompt.mp4" type="video/mp4">
</video>
</webui-flex>

<webui-flex gap="var(--padding)" wrap>
    <webui-link href="/tutorials/run-scripts" icon="terminal" theme="primary">Tutorial: Run scripts and answer their prompts</webui-link>
    <webui-link href="/tutorials/script-terminals" icon="layers" theme="primary">Tutorial: Open terminals from your scripts</webui-link>
    <webui-link href="/tutorials/favorites" icon="star" theme="secondary">Tutorial: Run your favorite scripts in one click</webui-link>
</webui-flex>

</webui-page-segment>

## Find what is still running

<webui-page-segment elevation="10">

A dev server that outlived its terminal can hold a port and keep every later run from starting. The **Task Manager** lists every process you run, wherever it started, with presets for terminal processes, orphaned ones, servers on a port, and what runs in your projects, plus filters of your own. Stop one, or force close it with everything it started, from the same place.

<webui-loop-video src="/video/loops/task-manager.mp4" poster="/video/loops/task-manager.webp" alt="The Task Manager's Orphaned preset finding a Storybook server left running"></webui-loop-video>

<webui-flex gap="var(--padding)" wrap>
    <webui-link href="/tutorials/task-manager" icon="gauge" theme="primary">Tutorial: Find and stop what is still running</webui-link>
</webui-flex>

</webui-page-segment>

## Review and commit quickly

<webui-page-segment elevation="10">

The **Git Controller** lists every change with a side-by-side diff. Step through files with the arrow keys, leave files out of a commit, and see how many files and lines you're about to commit. **Sync** pulls and pushes in one click, and **Sync after commit** does it for you.

Your commit message is kept per project and repository until the commit succeeds, so switching tasks never loses it.

With an AI provider set up, such as Claude Code or a local model in Ollama, **Write with AI** drafts the message from the files you included, and the **Review** tab reviews your changes, or the whole project, before you commit. Every draft is yours to change, and nothing is committed by itself.

<webui-loop-video src="/video/loops/git-commit-ready.mp4" poster="/video/loops/git-commit-ready.webp" alt="The Git Controller, showing changed files, a commit message, and a side-by-side diff"></webui-loop-video>

<webui-flex gap="var(--padding)" wrap>
    <webui-link href="/tutorials/commit-and-sync" icon="code-commit" theme="primary">Tutorial: Review, commit, and sync</webui-link>
    <webui-link href="/tutorials/branches" icon="code-branch" theme="secondary">Tutorial: Work with branches</webui-link>
    <webui-link href="/tutorials/ai" icon="sparkles" theme="secondary">Tutorial: Write with AI</webui-link>
</webui-flex>

</webui-page-segment>

## Keep tokens out of your scripts

<webui-page-segment elevation="10">

Stop pasting tokens into terminals and `.env` files. Set them once as global variables, encrypted on your computer, and Task Proxy fills them into page scripts when they run. Environments switch a project between dev, staging, and prod in one click.

<webui-flex gap="var(--padding)" wrap>
    <webui-link href="/tutorials/variables-and-environments" icon="brackets-curly" theme="primary">Tutorial: Use variables, secrets, and environments</webui-link>
</webui-flex>

</webui-page-segment>

## Turn your notes into pages

<webui-page-segment elevation="10">

That notes file of commands works better as a page: headings, a sentence on when to use each command, and a run button beside it. Keep it to yourself, or commit it and the whole team has it.

<webui-flex gap="var(--padding)" wrap>
    <webui-link href="/tutorials/team-pages" icon="file" theme="primary">Tutorial: Build a page</webui-link>
</webui-flex>

</webui-page-segment>

## Many projects, one app

<webui-page-segment elevation="10">

Add every repository you work on and switch between them from the **Project** dropdown, a grid of tiles with each project's icon and git status. Each one keeps its own pages, variables, terminals, and commit message. A project with several repositories inside it, such as a front end and an API, shows each one in the Git Controller's **Repo** dropdown, with its CI result.

Away from your desk? Turn on **Remote Connections**, and check on a build from a browser on your laptop or phone.

<webui-flex gap="var(--padding)" wrap>
    <webui-link href="/tutorials/remote-connections" icon="desktop" theme="primary">Tutorial: Use Task Proxy from another computer</webui-link>
</webui-flex>

</webui-page-segment>
