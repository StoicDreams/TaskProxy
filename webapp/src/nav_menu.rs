use crate::prelude::*;

pub fn nav_menu_info() -> DrawerToggleInfo {
    DrawerToggleInfo::builder(
        |_| String::from("Navigation Menu"),
        |_| html! {FaIcon::solid("bars").to_html()},
        DynContextsHtml::new(nav_menu_render),
    )
    .set_button_class("btn toggle theme-inherit")
    .hide_header()
    .hide_footer()
    .set_drawer(Direction::Left)
    .build()
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

fn nav_menu_render(contexts: &Contexts) -> Html {
    html! {
        <>
            <Paper class="logo d-flex pa-1 justify-center ml-a mr-a">
                <AppLogo text="Task" second="Proxy" />
            </Paper>
            <NavDisplay routes={get_nav_routing(contexts)} class="d-flex flex-column pa-1" />
        </>
    }
}
