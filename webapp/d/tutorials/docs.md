<webui-data data-page-title="Edit Your Project's Docs" data-page-subtitle="Tutorial: about 5 minutes" data-page-description="Edit your project's markdown docs with a live preview, and turn a folder of markdown files into Task Proxy pages."></webui-data>

## Edit markdown with a live preview

<webui-page-segment elevation="10">

The **Docs Manager** edits the markdown files already in your project, such as `README.md` or the files in a `docs` folder. Open it from the books icon at the bottom of the left navigation.

1. Choose a file from the **File** dropdown. It lists the markdown files in your project, with the README first.
2. Edit the markdown on the right. The rendered result on the left updates as you type.
3. Click **Save** to write the file, or **Reset** to throw away your changes and reload it.

<webui-loop-video src="/video/loops/docs-manager.mp4" poster="/video/loops/docs-manager.webp" alt="The Docs Manager with README.md open, the rendered page on the left and its markdown on the right"></webui-loop-video>

</webui-page-segment>

## Turn your docs into pages

<webui-page-segment elevation="10">

Already have a `docs` folder? Task Proxy can turn its markdown files into pages, nested in the navigation the way the files are nested in their folders.

1. Open **Settings** from the Task Proxy logo at the top left, and choose the **Import** tab.
2. Pick the **Folder** to import, or **The whole project**.
3. Under **Place the pages**, choose **In a new folder**, and give it a **Folder name**, or **At the top of the navigation**.
4. Click **Import Pages**.

Links between the files open their new pages, and images and videos the files show by relative address, such as `images/setup.png`, show on the pages too. The files themselves are only read, never changed.

With AI set up, **Suggest with AI** proposes each page's title, description, and navigation folder before you import. Change anything you like first. See [Write with AI](/tutorials/ai).

<webui-loop-video src="/video/loops/page-import.mp4" poster="/video/loops/page-import.webp" alt="Settings' Import tab, importing a folder of markdown files as pages"></webui-loop-video>

</webui-page-segment>

## Bring one file into a page

<webui-page-segment elevation="10">

To add a single file to a page you already have, click **Import** at the top of the page, choose the **Markdown file**, and whether it goes **Before this page's content** or **After this page's content**. An empty page takes the file as its content.

</webui-page-segment>

## Then commit it

<webui-page-segment elevation="10">

Your edits, and imported pages, are ordinary file changes, so they show up in the **Git Controller**, ready to review and commit. See [Review, commit, and sync your changes](/tutorials/commit-and-sync).

Docs or pages? Use docs for things people read anywhere, such as on GitHub. Use [Task Proxy pages](/tutorials/team-pages) for steps people carry out in Task Proxy, with scripts they can run.

</webui-page-segment>

<webui-flex justify="flex-end">
    <webui-button href="/tutorials/plugins" theme="primary" end-icon="chevrons-right">Continue to Add a plugin</webui-button>
</webui-flex>
