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
        repo: 'NaturalSelectionLabs/RSS3-Docs',
        editLinks: true,
        lastUpdated: true,
        sidebarDepth: 2,
        locales: {
            '/': {
                lang: 'en-US',
                label: 'English',
                editLinkText: 'Edit this page on GitHub',
                lastUpdated: 'Last Updated',
                nav: [
                    {
                        text: 'Protocol',
                        link: '/protocol/',
                    },
                    {
                        text: 'SDK',
                        link: '/sdk/'
                    },
                    {
                        text: 'Node',
                        link: '/node'
                    },
                    {
                        text: 'Data',
                        link: '/data'
                    },
                    {
                        text: 'Applications',
                        link: '/apps/'
                    },
                    {
                        text: 'Partners',
                        link: '/partners'
                    },
                ],
                sidebar: {
                    '/protocol/': [
                        {
                            title: 'Protocol',
                            collapsable: false,
                            children: [
                                '',
                                'CHANGELOG',
                                'v0.3.1',
                                'v0.3.0',
                                'v0.2.0',
                                'v0.1.1',
                                'v0.1.0',
                                'v0.1.0-alpha.0',
                            ],
                        },
                    ],
                    '/sdk/': [
                        {
                            title: 'SDK',
                            collapsable: false,
                            children: [
                                '',
                                'JavaScript',
                            ],
                        },
                    ],
                    '/apps/': [
                        {
                            title: 'Applications',
                            collapsable: false,
                            children: [
                                '',
                                'revery',
                                'pass',
                                'reid',
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
