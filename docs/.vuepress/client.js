import { defineClientConfig } from 'vuepress/client'
import Quiz from './components/Quiz.vue'
import SectionGrid from './components/SectionGrid.vue'

export default defineClientConfig({
  enhance({ app }) {
    app.component('Quiz', Quiz)
    app.component('SectionGrid', SectionGrid)
  },
})
