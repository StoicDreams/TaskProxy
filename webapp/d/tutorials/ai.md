<webui-data data-page-title="Write with AI" data-page-subtitle="Tutorial: about 10 minutes" data-page-description="Set up an AI provider, then draft commit messages, code reviews, pages, and scripts that you check before anything is saved."></webui-data>

## What you'll do

<webui-page-segment elevation="10">

1. Add an AI provider, such as Claude Code, Ollama, or an API key.
2. Choose what to use AI for, and which models.
3. Draft a commit message, review your changes, and write page parts and scripts.

Every draft lands in an editor for you to read and change. Task Proxy never saves, commits, or runs a draft by itself.

</webui-page-segment>

## 1. Add a provider

<webui-page-segment elevation="10">

Open **Settings** from the Task Proxy logo at the top left, and choose the **AI** tab. On **Providers**, click **Add Provider** and choose what you want to use:

| Provider | Good for |
|---|---|
| **Claude Code, with a Claude subscription** | Using the Claude plan you already pay for. Choose the models (Sonnet, Opus, Haiku) and whether it may look at other files in the project. |
| **Ollama** or **LM Studio** | Free models that run on your own computer, so nothing leaves it. |
| **OpenAI**, **Anthropic**, or **OpenRouter** | Paste an API key from the provider's site. |
| **Another OpenAI-compatible server** or **Another command** | For those who know how: servers such as Groq or vLLM, or any tool you can call from PowerShell. |

Each choice shows the steps to set it up, with a button to open each site it needs, and a **Run** button for each command, which runs in the Terminal Manager so you can watch it and answer what it asks. Click **Save Providers** to keep your changes, and **Test** to check the provider answers.

API keys are kept encrypted on your computer and are never shown again.

<webui-loop-video src="/video/loops/ai-providers.mp4" poster="/video/loops/ai-providers.webp" alt="Settings' AI tab, adding a provider with Add Provider and following its setup steps until its models are listed"></webui-loop-video>

</webui-page-segment>

## 2. Choose what AI is for

<webui-page-segment elevation="10">

Still on the **AI** tab:

- **Use AI For:** turn on Git commit messages, code reviews, pages, scripts, or importing markdown files. Each shows its own button where it is used, and nowhere else.
- **Default Models:** pick a model for everything, or one for each use, for every project or just this one. You can pick another for a single request.
- **Instructions:** add your own, for every request or for one use, such as how your team writes commit messages. They add to Task Proxy's built-in instructions, never replace them, and a project can have its own.

A useful start for commit messages:

```text
A first line summarizing the change, then one line per change, each starting with Feature: or Bug:. No other text.
```

</webui-page-segment>

## 3. Draft a commit message

<webui-page-segment elevation="10">

In the **Git Controller**, include the files for your next commit, then click **Write with AI** under **Commit Message**. The message is written from the changes you included, following your instructions. Read it, change what you like, and commit as usual.

<webui-loop-video src="/video/loops/ai-commit-message.mp4" poster="/video/loops/ai-commit-message.webp" alt="The Git Controller writing a commit message with Write with AI from the included changes"></webui-loop-video>

</webui-page-segment>

## 4. Review your changes

<webui-page-segment elevation="10">

With code reviews turned on, the Git Controller has a **Review** tab beside **Commit**.

1. Choose whether to review the changes included for the next commit, or the whole project.
2. Optionally, say what to look for this time, such as "security" or "error handling".
3. Click **Review**.

A large review is done in parts and joined into one report. It keeps going while you work on other pages or projects. The report stays until you **Clear** it or review the repo again. **Copy** it, or **Save as Page** to keep it in the project's navigation under **Reviews**.

<webui-loop-video src="/video/loops/git-review.mp4" poster="/video/loops/git-review.webp" alt="The Git Controller's Review tab reviewing the included changes and showing the report"></webui-loop-video>

</webui-page-segment>

## 5. Write pages and scripts

<webui-page-segment elevation="10">

- **Pages:** while editing a part of a page, click **Write with AI** and say what it should say, or how to change what is there now.
- **Scripts:** in the script editor, click **Write with AI** and describe what the script should do. Read every line before you save or run it.
- **Importing markdown:** on Settings' **Import** tab, **Suggest with AI** proposes titles, subtitles, and where each file goes in the navigation. See [Edit your project's docs](/tutorials/docs).

The book button beside each **Write with AI** opens the instructions for that use.

<webui-loop-video src="/video/loops/ai-page-draft.mp4" poster="/video/loops/ai-page-draft.webp" alt="A page part drafted with Write with AI, shown in its editor for review"></webui-loop-video>

</webui-page-segment>

## What is sent

<webui-page-segment elevation="10">

Only what you are working on, with the instructions: the included files' changes, or the whole project for a project review; the page or script being edited; or the files being imported.

- **Ollama** and **LM Studio** keep it on your computer.
- **Claude Code** and the API providers send it to their servers.
- Task Proxy's own variables and secrets are never sent.

<webui-quote theme="warning">

With **Look at the project** on, Claude Code can read any file in the project, including a `.env` file, and what it reads is sent to Anthropic. Leave it off for a project that keeps secrets in its files. Claude Code also only works in a project you have trusted.

</webui-quote>

</webui-page-segment>

<webui-flex justify="flex-end">
    <webui-button href="/tutorials/favorites" theme="primary" end-icon="chevrons-right">Continue to Run your favorite scripts in one click</webui-button>
</webui-flex>
