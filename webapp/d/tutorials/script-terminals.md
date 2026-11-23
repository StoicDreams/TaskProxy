<webui-data data-page-title="Open Terminals From Your Scripts" data-page-subtitle="Tutorial: about 5 minutes" data-page-description="Open a terminal from a script, keep it running outside Task Proxy, restart several servers at once, and handle one that can't open."></webui-data>

## What it does

<webui-page-segment elevation="10">

Some scripts start other scripts: one that launches a dev server for each of your sites, or a build watcher beside an API. Run from a terminal, they usually open a window for each one.

Run from Task Proxy, the same script can open each one as a terminal in the **Terminal Manager** instead. Each has its own name, output, and **Stop** button, and you can answer its prompts there. Run the script again, and it can stop the old ones before it starts new ones.

Every script Task Proxy runs gets a `TaskProxy` PowerShell module with two commands:

| Command | What it does |
|:---|:---|
| `Start-TaskProxyTerminal` | Opens a terminal in the Terminal Manager that runs a command. It returns once the command has started, and the terminal keeps running after your script ends. |
| `Test-TaskProxy` | Says whether the script was started by Task Proxy. |

</webui-page-segment>

## 1. Open a terminal

<webui-page-segment elevation="10">

Give the terminal a name and the PowerShell to run:

```pwsh
Start-TaskProxyTerminal -Name 'api' -Command "& './scripts/run-api.ps1'"
```

Run the script from the **Script Manager** or a page, then open the **Terminal Manager** and choose **api** in the **Script** dropdown. The terminal opens in the same project as the script.

| Parameter | What it does |
|:---|:---|
| `-Name` | The terminal's name in the Terminal Manager. Required. |
| `-Command` | The PowerShell to run, as you would pass to `pwsh -Command`. Required. |
| `-WorkingDirectory` | The folder the command starts in. Defaults to the script's current folder. |
| `-Replace` | Stops what is still running in a terminal of that name, and waits for it to end, before starting the command. Without it, the call fails while that terminal runs. |

</webui-page-segment>

## 2. Keep it working outside Task Proxy

<webui-page-segment elevation="10">

Scripts started anywhere else, such as by a teammate who doesn't use Task Proxy, don't have the module. Check for it, and open a window as before when it's missing:

```pwsh
$command = "& './scripts/run-api.ps1'"
if (Get-Command Start-TaskProxyTerminal -ErrorAction SilentlyContinue) {
    Start-TaskProxyTerminal -Name 'api' -Command $command -Replace
}
else {
    Start-Process pwsh -ArgumentList '-NoExit', '-Command', $command
}
```

If you would rather not change a script your team shares, copy it into a script of your own, open its terminals with `Start-TaskProxyTerminal` there, and run yours from Task Proxy.

</webui-page-segment>

## 3. Restart several servers at once

<webui-page-segment elevation="10">

With `-Replace`, running the script again stops each server still running from the last time and waits for it to end, so the new one starts on a free port:

```pwsh
param(
    [string[]]$Sites = @('web', 'admin', 'api'),
    [switch]$Watch
)

foreach ($site in $Sites) {
    $command = "& './run-$site.ps1'"
    if ($Watch) { $command += ' -Watch' }
    Start-TaskProxyTerminal -Name $site -Command $command -WorkingDirectory "$PSScriptRoot/sites/$site" -Replace | Out-Null
}
Write-Host "Started $($Sites -join ', ') in the Terminal Manager." -ForegroundColor Green
```

Because the script has a `param()` block, the Script Manager gives you an input for **Sites** and a switch for **Watch**.

</webui-page-segment>

## 4. Handle a terminal that can't open

<webui-page-segment elevation="10">

`Start-TaskProxyTerminal` throws an error that says why it couldn't open a terminal, such as one of that name still running without `-Replace`. Catch it to carry on with the rest:

```pwsh
try {
    Start-TaskProxyTerminal -Name 'worker' -Command 'dotnet run --project ./Worker' | Out-Null
}
catch {
    Write-Host "Could not open the worker: $($_.Exception.Message)" -ForegroundColor Red
}
```

To do something only when Task Proxy runs the script, check with `Test-TaskProxy`:

```pwsh
$inTaskProxy = [bool](Get-Command Test-TaskProxy -ErrorAction SilentlyContinue) -and (Test-TaskProxy)
if ($inTaskProxy) {
    Write-Host 'Opening each site in the Terminal Manager.'
}
```

</webui-page-segment>

<webui-flex justify="flex-end">
    <webui-button href="/tutorials/task-manager" theme="primary" end-icon="chevrons-right">Continue to Find and stop what is still running</webui-button>
</webui-flex>
