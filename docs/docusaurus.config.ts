import { Config } from '@docusaurus/types';
import { themes as prismThemes } from 'prism-react-renderer';

// See: https://docusaurus.io/docs/api/docusaurus-config
const config: Config = {
    title: 'THEOplayer Open Video UI for Web',
    tagline: 'UI component library for the THEOplayer Web SDK',
    // favicon: 'img/favicon.ico',

    // Set the production url of your site here
    url: 'https://theoplayer.github.io',
    // Set the /<baseUrl>/ pathname under which your site is served
    // For GitHub pages deployment, it is often '/<projectName>/'
    baseUrl: '/web-ui/',

    // GitHub pages deployment config.
    // If you aren't using GitHub pages, you don't need these.
    organizationName: 'THEOplayer', // Usually your GitHub org/user name.
    projectName: 'web-ui', // Usually your repo name.

    onBrokenLinks: 'throw',
    onBrokenMarkdownLinks: 'warn',

    // Even if you don't use internationalization, you can use this field to set
    // useful metadata like html lang. For example, if your site is Chinese, you
    // may want to replace "en" with "zh-Hans".
    i18n: {
        defaultLocale: 'en',
        locales: ['en']
    },

    presets: [
        [
            'classic',
            {
                docs: {
                    routeBasePath: '/',
                    sidebarPath: './sidebars.ts',
                    editUrl: 'https://github.com/THEOplayer/web-ui/tree/main/'
                },
                blog: false,
                theme: {
                    customCss: './src/css/custom.css'
                }
            } satisfies import('@docusaurus/preset-classic').Options
        ]
    ],

    themeConfig: {
        // Replace with your project's social card
        image: 'img/docusaurus-social-card.jpg',
        navbar: {
            title: 'THEOplayer Open Video UI for Web',
            logo: {
                alt: 'My Site Logo',
                src: 'img/logo.svg'
            },
            items: [
                {
                    type: 'docSidebar',
                    sidebarId: 'guidesSidebar',
                    position: 'left',
                    label: 'Guides'
                },
                {
                    type: 'docSidebar',
                    sidebarId: 'examplesSidebar',
                    position: 'left',
                    label: 'Examples'
                },
                {
                    href: 'https://github.com/THEOplayer/web-ui',
                    label: 'GitHub',
                    position: 'right'
                }
            ]
        },
        footer: {
            style: 'dark',
            links: [
                {
                    title: 'Docs',
                    items: [
                        {
                            label: 'Guides',
                            to: '/guides/'
                        }
                    ]
                },
                {
                    title: 'More',
                    items: [
                        {
                            label: 'GitHub',
                            href: 'https://github.com/THEOplayer/web-ui'
                        },
                        {
                            label: 'THEOplayer',
                            href: 'https://www.theoplayer.com'
                        }
                    ]
                }
            ],
            copyright: `Copyright © ${new Date().getFullYear()} THEO Technologies. Built with Docusaurus.`
        },
        prism: {
            theme: prismThemes.github,
            darkTheme: prismThemes.dracula
        }
    } satisfies import('@docusaurus/preset-classic').ThemeConfig,

    staticDirectories: ['static', 'node_modules/@theoplayer/web-ui/dist'],

    customFields: {
        theoplayerLibraryLocation: 'https://cdn.theoplayer.com/dash/theoplayer/',
        theoplayerLicense:
            'sZP7IYe6T6Pe3LP63uRr3Zk63oP1FSaz3Sa-CK0rC6zk3S0c0Lg13lhc0l56FOPlUY3zWokgbgjNIOf9fKBz3LBo3DaoFSeZ0Se-3uetIOk60QCZFDao0LA63QXlCL0i0OfVfK4_bQgZCYxNWoryIQXzImf90SbLTu0c3LCi0u5i0Oi6Io4pIYP1UQgqWgjeCYxgflEc3lRi3SerTSai0u0iFOPeWok1dDrLYtA1Ioh6TgV6WQjlCDcEWt3zf6i6UQ1gWtAVCYggb6rlWoz6FOPzdQ4qbQc1sD4ZFKUNUQ1kC6rNWZPUFOPeWok1dDrLYt3qUYPlImf9DZfJf6i6WQjlCDcEWt3zf6i6UQ1gWtAVCYggb6rlWoz6Ymi6box7bZf9DZPEUQkV3mPUFOPLIDreYog-bwPgbt3NWo_6TGxZUDhVfKIgCYxkbK4LflNWYYz'
    }
};

export default config;
