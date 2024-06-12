use crate::prelude::*;

pub fn nav_content(contexts: &Contexts) -> Html {
    html! {
        <>
            <webui-flex justify="center" slot="header">
                <webui-stoic-dreams-logo title="Task Proxy Logo" text="Task" text2="Proxy"></webui-stoic-dreams-logo>
            </webui-flex>
            <NavDisplay routes={get_nav_routing(contexts)} class="d-flex flex-column pa-1" />
        </>
    }
}

pub(crate) fn get_nav_routing(_contexts: &Contexts) -> Vec<NavRoute> {
    let nav_routes = vec![
        NavLinkInfo::link(
            "Home",
            "/",
            &FaIcon::duotone("house"),
            roles::PUBLIC,
            page_home,
        ),
        NavGroupInfo::link(
            "App",
            &FaIcon::duotone("cube"),
            roles::USER,
            vec![NavLinkInfo::link(
                "Downloads",
                "/downloads",
                &FaIcon::duotone("download"),
                roles::USER,
                page_downloads,
            )],
        ),
        NavLinkInfo::link(
            "About",
            "/about",
            &FaIcon::duotone("circle-info"),
            roles::PUBLIC,
            page_about_stoic_dreams,
        ),
        NavLinkInfo::link(
            "Terms",
            "/terms",
            &FaIcon::duotone("handshake"),
            roles::PUBLIC,
            starter_page_terms,
        ),
        NavLinkInfo::link(
            "Privacy",
            "/privacy",
            &FaIcon::duotone("shield-exclamation"),
            roles::PUBLIC,
            starter_page_privacy,
        ),
    ];
    nav_routes.to_owned()
}
