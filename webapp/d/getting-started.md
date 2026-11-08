<webui-data data-page-title="Getting Started with Task Proxy" data-page-subtitle="Quickly set up your first project"></webui-data>

## 1. Set Your Security Key
<webui-page-segment elevation="10">
Upon opening Task Proxy for the first time, you will be prompted to create a **Security Key**. 

This acts as a master password used to encrypt and protect sensitive variables (like API tokens and passwords). 
- Task Proxy securely stores this key in your operating system's native credential manager (e.g., Windows Credential Manager or macOS Keychain).
- **Important:** Be sure to back this key up in a password manager. If you move to a new computer, you will need the exact same key to decrypt your project's secure variables.
</webui-page-segment>

## 2. Link a Project Folder
<webui-page-segment elevation="10">
Once your security key is saved, you can add your first project.

1. Click **Select Project Folder** on the welcome screen.
2. Choose the root directory of your code repository.
3. Task Proxy will instantly create a `.taskproxy` folder in that directory to house your custom pages, non-sensitive variables, and UI configurations.

*Tip: Because everything relies on standard JSON and Markdown files in the `.taskproxy` folder, you can seamlessly commit these files to Git and share your Task Proxy workflows with your entire team.*
</webui-page-segment>

## 3. Explore the Modules
<webui-page-segment elevation="10">
With your project loaded, explore the primary management tools located in the left navigation drawer:

- **Docs Manager:** Quickly edit your project's `readme.md` and standard markdown documentation with a live preview.
- **Script & Terminal Manager:** Write `.ps1` scripts, automatically generate input parameters, and execute them in live terminal views directly from the app.
- **Git Controller:** Use the built-in Git interface to commit your work, switch branches, sync with remote repositories, and view line-by-line diffs.
- **Variable Manager:** Click the **$** icon in the top header to define Page, Project, and Global variables for easy injection into your scripts and documentation.
</webui-page-segment>

## 4. Learn by Doing
<webui-page-segment elevation="10">
Each [tutorial](/tutorials) covers one task from start to finish, with screenshots and short videos:

- [Set up Task Proxy and your first project](/tutorials/first-project)
- [Review, commit, and sync your changes](/tutorials/commit-and-sync)
- [Run scripts and answer their prompts](/tutorials/run-scripts)
- [Build a page for your team](/tutorials/team-pages)
- [Use variables, secrets, and environments](/tutorials/variables-and-environments)

To see what Task Proxy shares through git and what stays on your computer, read [How It Works](/how-it-works).
</webui-page-segment>
