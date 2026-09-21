<script setup>
import { ref } from 'vue'

const props = defineProps({
  question: { type: String, required: true },
  answers: { type: Array, required: true },
  correct: { type: Number, required: true },
})

const selected = ref(null)
</script>

<template>
  <section class="quiz">
    <p><strong>{{ question }}</strong></p>
    <button
      v-for="(answer, index) in answers"
      :key="answer"
      type="button"
      :class="{ selected: selected === index }"
      @click="selected = index"
    >
      {{ answer }}
    </button>
    <p v-if="selected !== null" aria-live="polite">
      {{ selected === correct ? 'Correct.' : 'Try again.' }}
    </p>
  </section>
</template>

<style scoped>
.quiz {
  padding: 1rem;
  border: 1px solid var(--vp-c-border);
  border-radius: 0.75rem;
}

button {
  display: block;
  width: 100%;
  margin: 0.5rem 0;
  padding: 0.65rem 0.8rem;
  text-align: left;
  cursor: pointer;
  background: var(--vp-c-bg-alt);
  border: 1px solid var(--vp-c-border);
  border-radius: 0.4rem;
}

button.selected {
  border-color: var(--vp-c-accent);
}
</style>
