const { description } = require('../../package')

module.exports = {
    locales: {
        '/': {
            lang: 'en-US',
            title: 'RSS3',
            description: description,
        },
    },

    head: [
        ['meta', { name: 'theme-color', content: '#0072ff' }],
        ['meta', { name: 'apple-mobile-web-app-capable', content: 'yes' }],
        ['meta', { name: 'apple-mobile-web-app-status-bar-style', content: 'black' }]
    ],

    themeConfig: {
        repo: 'NaturalSelectionLabs',
        docsRepo: 'NaturalSelectionLabs/RSS3-Docs',
        editLinks: true,
        lastUpdated: true,
        sidebarDepth: 2,
        docsDir: 'src',
        docsBranch: 'main',
        locales: {
            '/': {
                lang: 'en-US',
                label: 'English',
                editLinkText: 'Edit this page on GitHub',
                lastUpdated: 'Last Updated',
                nav: [
                    {
                        text: 'Guide',
                        link: '/guide/',
                    },
                    {
                        text: 'Whitepaper',
                        link: 'https://rss3.io/#/whitepaper'
                    },
                    {
                        text: 'Learn More',
                        items: [
                            {
                                text: 'Events',
                                link: '/events'
                            },
                            {
                                text: 'Blog',
                                link: 'https://rss3.notion.site/'
                            },
                            {
                                text: 'Brand Kit',
                                link: 'https://rss3.notion.site/RSS3-Brand-Kit-251e768345684ba9acd038d79c6899b8'
                            },
                            {
                                text: 'Join Us',
                                link: 'https://rss3.notion.site/Open-Source-Remote-RSS3-Offering-the-Dopest-Positions-Frontend-Full-stack-Decentralized-System--b6fdbffee017449797397f45340de9d4'
                            },
                            {
                                text: 'Support RSS3',
                                link: '/support'
                            },
                        ]
                    },
                ],
                sidebar: {
                    '/guide/': [
                        {
                            title: 'Guide',
                            collapsable: false,
                            children: [
                                '',
                            ],
                        },
                        {
                            title: 'Protocol',
                            collapsable: false,
                            children: [
                                'protocol',
                            ],
                        },
                        {
                            title: 'SDK',
                            collapsable: false,
                            children: [
                                'sdk-list',
                                'rss3-sdk-for-javascript',
                            ],
                        },
                        {
                            title: 'Node',
                            collapsable: false,
                            children: [
                                'api',
                            ],
                        },
                        {
                            title: 'Data',
                            collapsable: false,
                            children: [
                                'data',
                            ],
                        },
                    ],
                },
            },
        },
    },

    /**
     * Apply plugins，ref：https://v1.vuepress.vuejs.org/zh/plugin/
     */
    plugins: [
        '@vuepress/plugin-back-to-top',
        '@vuepress/plugin-medium-zoom',
    ],
}
