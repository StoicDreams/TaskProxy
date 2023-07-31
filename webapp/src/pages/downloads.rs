use crate::prelude::*;

/// Downloads page
pub(crate) fn page_downloads(_contexts: Contexts) -> Html {
    set_title("Web UI Demo & Documentation");
    html! {
        <>
            <MarkdownContent href="/d/en-US/downloads.md" />
            <NextPageButton url="/" />
        </>
    }
}
