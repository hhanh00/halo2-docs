import { defaultTheme } from '@vuepress/theme-default'
import { viteBundler } from '@vuepress/bundler-vite'
import { markdownMathPlugin } from '@vuepress/plugin-markdown-math'
import { slimsearchPlugin } from '@vuepress/plugin-slimsearch'
import markdownItFootnote from 'markdown-it-footnote'

export default {
  lang: 'en-US',
  title: 'Halo2',
  description: 'Halo2 documentation',
  base: '/',

  bundler: viteBundler(),

  theme: defaultTheme({
    navbar: [
      { text: 'Home', link: '/' },
      { text: 'Guide', link: '/guide/' },
    ],
    sidebar: {
      '/guide/': ['/guide/'],
    },
  }),

  plugins: [
    markdownMathPlugin({ type: 'katex', output: 'html' }),
    slimsearchPlugin({
      indexContent: true,
      suggestion: false,
    }),
  ],

  extendsMarkdown(md) {
    md.use(markdownItFootnote)
  },
}
