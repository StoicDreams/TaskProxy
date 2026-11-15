<webui-data data-page-title="Find and Stop What Is Still Running" data-page-subtitle="Tutorial: about 5 minutes"></webui-data>

## What the Task Manager is for

<webui-page-segment elevation="10">

A dev server that outlived its terminal can hold a port and keep the next one from starting. A build left running can keep your computer busy. The **Task Manager** lists every process you run, wherever it started, so you can find these and stop them.

Open it from the gauge button at the top right, beside the **Terminal Manager**'s. It opens on the right, beside whatever you were doing.

- It lists only your own processes, and works the same on Linux, macOS, and Windows.
- It reads processes only while it is open, so it costs nothing the rest of the time.
- **Refresh** reads them now, and the dropdown beside it sets how often they refresh, or pauses them.

<webui-loop-video src="/video/loops/task-manager.mp4" poster="/video/loops/task-manager.webp" alt="The Task Manager's Orphaned preset finding a Storybook server left running, with its details and Stop buttons"></webui-loop-video>

</webui-page-segment>

## 1. Find a process

<webui-page-segment elevation="10">

The first dropdown picks a preset:

| Preset | Shows |
|---|---|
| **Terminal** | What you started from a terminal, or from your editor's terminal |
| **Orphaned** | What kept running after the terminal or editor that started it closed |
| **Listening on a port** | Servers, and anything else waiting for connections |
| **In my projects** | What runs in one of your projects' folders |
| **Started by Task Proxy** | Task Proxy, and the scripts it runs |
| **Busy** and **Large** | What uses more than 5% of the CPU, or more than 500 MB of memory |
| **Started recently** | What started in the last hour |
| **All my processes** | Everything you run |

To find one process, type in **Search**. It matches a name, a command, a folder, a PID, or a port, so typing `5173` finds whatever holds port 5173.

Click a column heading to sort by it, and click it again to reverse the order. Labels beside a name, such as **Terminal** and **Orphaned**, say which presets it belongs to.

<webui-loop-video src="/video/loops/task-manager-search.mp4" poster="/video/loops/task-manager-search.webp" alt="Searching the Task Manager for 5173 finds the Vite dev server, and its details show its command, folder, and port"></webui-loop-video>

</webui-page-segment>

## 2. See what started what

<webui-page-segment elevation="10">

Click **Tree** to show each process under the one that started it, such as your editor, then its terminal, then the dev server and the build tool it started. Click **Tree** again for a flat list.

Click a process for its details: its full command, its folder and project, when it started, the ports it listens on, what started it, and what it started. Click a name under **Started by** or **It started** to jump to that process.

<webui-loop-video src="/video/loops/task-manager-tree.mp4" poster="/video/loops/task-manager-tree.webp" alt="The In my projects preset shown as a tree, with an editor, its terminal, a dev server, and esbuild each under the one that started it"></webui-loop-video>

</webui-page-segment>

## 3. Make a filter of your own

<webui-page-segment elevation="10">

Open **Filter rules** to see what the current filter checks. Presets can't change, so click **Copy to Custom** to start from one.

1. Click **Add a rule**, choose a field, such as **Command**, **Folder**, **Port**, **CPU %**, **Memory (MB)**, or **Running for (minutes)**, and enter what to look for.
2. Choose whether a process must match **every rule** or **any rule**.
3. Type a name and click **Save**. Your filter joins the presets in the first dropdown.

To change a saved filter, choose it, edit its rules, and **Save** it again. **Delete** removes it.

<webui-loop-video src="/video/loops/task-manager-filter.mp4" poster="/video/loops/task-manager-filter.webp" alt="The Listening preset copied, a Project contains Acme rule added, and saved as Storefront servers, which finds the storefront's dev server"></webui-loop-video>

</webui-page-segment>

## 4. Stop it

<webui-page-segment elevation="10">

The buttons under a process's details stop it in four ways. Rest the pointer on one to see what it does and what it leaves running.

| Button | What it does |
|---|---|
| **Stop** | Asks only this process to stop, as Ctrl+C would, so it can save and clean up. What it started may keep running |
| **Stop with children** | Asks this process and everything it started to stop, the deepest first |
| **Force close** | Ends only this process at once, with no clean up. What it started keeps running |
| **Force close with children** | Ends this process and everything it started at once, the deepest first |

The number on the **with children** buttons counts every process under it, and those buttons show only when it started others.

Try **Stop** first, and force close only what doesn't stop. A process stopped on its own can leave what it started running, and that shows as **Orphaned**.

Task Proxy always asks before stopping anything, and it never stops itself. **How stopping works**, at the bottom of the panel, explains the buttons whenever you need a reminder.

<webui-loop-video src="/video/loops/task-manager-stop.mp4" poster="/video/loops/task-manager-stop.webp" alt="Stop with children chosen for an orphaned Storybook server, and Task Proxy asking before it stops the server and the process it started"></webui-loop-video>

</webui-page-segment>

<webui-flex justify="flex-end">
    <webui-button href="/tutorials/team-pages" theme="primary" end-icon="chevrons-right">Continue to Build a page for your team</webui-button>
</webui-flex>
