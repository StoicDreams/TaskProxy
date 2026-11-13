<webui-data data-page-title="Run Scripts and Answer Their Prompts" data-page-subtitle="Tutorial: about 5 minutes"></webui-data>

## Watch it first

<webui-page-segment elevation="10">

<webui-flex align="center" justify="center">
<video controls playsinline preload="none" poster="/video/script-prompt.webp">
    <source src="/video/script-prompt.mp4" type="video/mp4">
    Your browser can't play this video. The steps below cover the same thing.
</video>
</webui-flex>

</webui-page-segment>

## Before you start

<webui-page-segment elevation="10">

Task Proxy runs PowerShell scripts (`.ps1` files), from your project's root folder. PowerShell 7 runs on Windows, Mac, and Linux. If Task Proxy can't find it, the Terminal Manager explains how to install it, and can install it for you on some systems.

Open the **Script Manager** from the scroll icon at the bottom of the left navigation.

</webui-page-segment>

## 1. Pick a script

<webui-page-segment elevation="10">

The **Script** dropdown lists every `.ps1` file in your project. Choose one to load it into the editor below. You can change it there, then **Save** it, **Save As** a new file, or **Reset** it to what's on disk. **New Script** starts an empty one.

</webui-page-segment>

## 2. Fill in its parameters

<webui-page-segment elevation="10">

If the script starts with a `param()` block, Task Proxy gives each parameter its own input: a text box for values, and a switch for `[switch]` parameters.

```pwsh
param(
    [ValidateSet('unit', 'e2e', 'all')]
    [string]$Suite = 'unit',
    [string]$Filter = '',
    [switch]$Watch
)
```

The blue bar shows the exact command that will run, with your values in it. Turn on **Full Path** to see the script's full path rather than its path in the project. **Clear Params** empties every input.

<webui-loop-video src="/video/loops/script-manager.mp4" poster="/video/loops/script-manager.webp" alt="The Script Manager with the test script loaded, Suite set to e2e and Filter set to checkout"></webui-loop-video>

</webui-page-segment>

## 3. Run it and watch the output

<webui-page-segment elevation="10">

Click **Run**, then open the **Terminal Manager** from the pager icon at the top right.

Choose the script in the **Script** dropdown to see its output. Scripts run in a real terminal, so colors, progress bars, and lines that redraw look the way they do in your own terminal window. Output is kept after a script finishes, so you can come back to it later.

<webui-loop-video src="/video/loops/terminal-output.mp4" poster="/video/loops/terminal-output.webp" alt="The Terminal Manager showing a test run with green check marks for each passing test"></webui-loop-video>

</webui-page-segment>

## 4. Answer a prompt

<webui-page-segment elevation="10">

When a script asks a question, for example with `Read-Host` or a "Continue? [Y/N]" prompt, click in the terminal and type your answer, then press Enter.

- **Ctrl+C** with text selected copies it. With nothing selected, it stops the script, as in any terminal.
- **Stop** asks the script to stop the same way. If it's still running a few seconds later, Task Proxy ends it.
- **Kill All** ends every running script straight away.
- **Clear Output** empties the terminal.

</webui-page-segment>

## Next steps

<webui-page-segment elevation="10">

- [Build a page for your team](/tutorials/team-pages), to put scripts beside the steps they belong to.
- [Use variables, secrets, and environments](/tutorials/variables-and-environments), to keep tokens out of your scripts.

</webui-page-segment>
