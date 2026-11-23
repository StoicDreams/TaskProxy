<webui-data data-page-title="Run Scripts and Answer Their Prompts" data-page-subtitle="Tutorial: about 5 minutes" data-page-description="Pick a script, fill in its parameters, watch the output, answer its prompts, and find an earlier run again in Task Proxy."></webui-data>

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

Click **Run**, then open **Tools**, the toolbox at the top right, and choose its **Terminals** tab. Scripts run from a page or a favorite open it for you, on the new run.

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

## 5. Find a run again

<webui-page-segment elevation="10">

The switch at the top of the Terminal Manager chooses which scripts its **Script** dropdown lists:

| View | Lists |
|:---|:---|
| **Live** | A terminal of your own. Type PowerShell in **Script Content** and click **Run** |
| **Saved** | Every script saved in this project, ready to run from here |
| **Page** | The scripts you ran from this project's pages |
| **Running** | What is running in this project |
| **All Running** | What is running in every project |
| **Finished** | Every run that has ended, in every project, the latest first, saying which failed |

Run a script while another is running, and it waits its turn, then runs. **Remove** takes a finished page script off the list, and **Remove Finished Page Scripts** clears them all. **Select All** copies the whole output.

<webui-loop-video src="/video/loops/terminal-finished.mp4" poster="/video/loops/terminal-finished.webp" alt="The Terminal Manager's Finished view, showing a finished test run and its output"></webui-loop-video>

A script can start something that outlives it, such as a dev server. To open those as terminals here, rather than windows of their own, see the next tutorial, [Open terminals from your scripts](/tutorials/script-terminals). To find and stop processes still running, see [Find and stop what is still running](/tutorials/task-manager).

</webui-page-segment>

## 6. Keep scripts from slowing your computer

<webui-page-segment elevation="10">

A big build or test run can take every core and leave the rest of your computer sluggish. Open **Settings** from the Task Proxy logo, and choose the **Performance** tab:

- **Priority:** **Low** runs scripts below your other programs. **Lowest** gives them only the CPU time nothing else wants.
- **CPU threads:** keeps scripts to some of your computer's threads. Tools that size themselves to the computer, such as cargo, start fewer jobs.

The limits cover the scripts Task Proxy runs, from the Terminal Manager, pages, and favorites, along with everything they start. They apply to scripts started after a change, so a script already running keeps the limits it started with. Scripts opened in a separate terminal window are not limited, and macOS can only lower priority.

<webui-loop-video src="/video/loops/script-performance.mp4" poster="/video/loops/script-performance.webp" alt="Settings' Performance tab, choosing a lower priority and fewer CPU threads for scripts"></webui-loop-video>

Run the same script many times a day? Make it a [favorite](/tutorials/favorites), and run it in one click from any page.

</webui-page-segment>

<webui-flex justify="flex-end">
    <webui-button href="/tutorials/script-terminals" theme="primary" end-icon="chevrons-right">Continue to Open terminals from your scripts</webui-button>
</webui-flex>
