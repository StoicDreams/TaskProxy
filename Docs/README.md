# Task Proxy

[Version: 0.1.22](https://github.com/StoicDreams/TaskProxy)

[WebUI](https://github.com/StoicDreams/WebUI)

Companion website for Task Proxy desktop application.

## Ideas

* Keep simple and easy to use.
* Create custom Views based on tags

## Development

### Setup

Before running this project, follow the [Web CLI Setup](https://webui.stoicdreams.com/tools/cli) guide and the [Web UI Rust Tools Setup](https://webui.stoicdreams.com/tools/rust) guide to install the necessary tools and dependencies.

### Running the Project

To run the project locally, you can use the following command:

```terminal:Run the project from the root directory
./PowerShell/RunLocal.ps1 -port 3210
```

### Images and videos

The site's loops and tutorial videos are recorded from the Task Proxy app itself, by `tools/capture/` in the [TaskProxyApp](https://github.com/StoicDreams/TaskProxyApp) checkout beside this one. Its `PowerShell/Publish.ps1` re-records all of them into `webapp/root_files/video` on every publish (skip with `-SkipScreenshots`), so commit them here when they changed enough to be worth it.

- Anything that shows an action is a short loop, embedded with `<webui-loop-video src="/video/loops/<name>.mp4" poster="/video/loops/<name>.webp" alt="...">`, which plays muted while on screen and respects reduced motion. Use a still image only where nothing happens.
- The page screenshots in `webapp/root_files/img/screenshots/pages` come from this site's own `PowerShell/screenshots.ps1`.

## Author

**[Erik Gassler](https://www.erikgassler.com) - [Stoic Dreams](https://www.stoicdreams.com)** - Forging solutions for tomorrow's software development.

**Support** - Visit [Stoic Dreams' GitHub Sponsor page](https://github.com/sponsors/StoicDreams) if you would like to provide support to Stoic Dreams.

## License

[MIT](LICENSE)
