use crate::prelude::*;

/// Downloads page
pub(crate) fn page_downloads(_contexts: Contexts) -> Html {
    set_title("Task Proxy Software Developer Solution Helper");
    html! {
        <>
            <MarkdownContent href="/d/en-US/downloads.md" />
            <NextPageButton url="/" />
        </>
    }
}
