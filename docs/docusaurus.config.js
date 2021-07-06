const lightCodeTheme = require('prism-react-renderer/themes/github');
const darkCodeTheme = require('prism-react-renderer/themes/dracula');

/** @type {import('@docusaurus/types').DocusaurusConfig} */
module.exports = {
    title: 'stocked',
    tagline: 'Tiny state management library for React',
    url: 'https://artiomtr.github.io',
    baseUrl: '/',
    onBrokenLinks: 'throw',
    onBrokenMarkdownLinks: 'warn',
    favicon: 'img/favicon.ico',
    organizationName: 'ArtiomTr',
    projectName: 'stocked',
    themeConfig: {
        announcementBar: {
            id: 'development_only',
            content: 'This library currently is not ready for the production use. Be careful!',
            backgroundColor: 'var(--ifm-color-danger-darkest)',
            textColor: '#FFF',
            isCloseable: false,
        },
        navbar: {
            title: 'stocked',
            logo: {
                alt: 'Stocked Logo',
                src: 'img/stocked.svg',
            },
            items: [
                {
                    type: 'doc',
                    docId: 'intro/getting-started',
                    position: 'left',
                    label: 'Docs',
                },
                {
                    href: 'https://github.com/ArtiomTr/stocked',
                    label: 'GitHub',
                    position: 'right',
                },
            ],
        },
        footer: {
            style: 'dark',
            links: [
                {
                    title: 'Docs',
                    items: [
                        {
                            label: 'Tutorial',
                            to: '/docs/getting-started',
                        },
                    ],
                },
                {
                    title: 'Community',
                    items: [
                        {
                            label: 'Stack Overflow',
                            href: 'https://stackoverflow.com/questions/tagged/docusaurus',
                        },
                        {
                            label: 'Discord',
                            href: 'https://discordapp.com/invite/docusaurus',
                        },
                        {
                            label: 'Twitter',
                            href: 'https://twitter.com/docusaurus',
                        },
                    ],
                },
                {
                    title: 'More',
                    items: [
                        {
                            label: 'Blog',
                            to: '/blog',
                        },
                        {
                            label: 'GitHub',
                            href: 'https://github.com/ArtiomTr/stocked',
                        },
                    ],
                },
            ],
            copyright: `Copyright © ${new Date().getFullYear()} Stocked, Inc. Built with Docusaurus.`,
        },
        prism: {
            theme: lightCodeTheme,
            darkTheme: darkCodeTheme,
        },
    },
    presets: [
        [
            '@docusaurus/preset-classic',
            {
                docs: {
                    sidebarPath: require.resolve('./sidebars.js'),
                    editUrl: 'https://github.com/ArtiomTr/stocked/edit/master/website/',
                },
                blog: {
                    showReadingTime: true,
                    editUrl: 'https://github.com/ArtiomTr/stocked/edit/master/website/blog/',
                },
                theme: {
                    customCss: require.resolve('./src/css/custom.css'),
                },
            },
        ],
    ],
};
