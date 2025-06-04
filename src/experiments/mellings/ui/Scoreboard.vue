<script setup lang="ts">
import { defineProps, ref, watch, Ref } from "vue";
import { gsap } from "gsap";

interface ScoreboardProps {
  alive: number;
  saved: number;
  level: number;
}

const { alive = 0, saved = 0, level = 0 } = defineProps<ScoreboardProps>();
const aliveRef = ref<HTMLElement>();
const savedRef = ref<HTMLElement>();
const displayAlive = ref(alive);
const displaysaved = ref(saved);

const animateScore = async (
  newVal: number,
  refObj: Ref<number>,
  el: HTMLElement
) => {
  if (el) {
    const tl = gsap.timeline();

    tl.to(el, {
      scale: 1.3,
      duration: 0.2,
      ease: "back.out(2)"
    })
      .set(el, {
        onComplete: () => {
          refObj.value = newVal;
        },
      })
      .to(el, {
        scale: 1,
        duration: 0.3,
        ease: "elastic.out(1, 0.5)",
      });
  }
};

watch(
  () => alive,
  async (newVal, oldVal) => {
    if (!aliveRef.value || newVal === oldVal) return;

    await animateScore(newVal, displayAlive, aliveRef.value);
  }
);

watch(
  () => saved,
  async (newVal, oldVal) => {
    if (!savedRef.value || newVal === oldVal) return;

    await animateScore(newVal, displaysaved, savedRef.value);
  }
);
</script>

<template>
  <div class="scoreboard">
    <div class="melling-score">
      <div class="score">
        🦔<span ref="aliveRef">{{ displayAlive }}</span>
      </div>
      <div class="score">
        🏁<span ref="savedRef">{{ displaysaved }}</span>
      </div>
    </div>
    <span class="score">Level: {{ level }}</span>
  </div>
</template>

<style>
.scoreboard {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.melling-score {
  display: flex;
  gap: 10px;
}

.score {
  display: inline-block;
  font-weight: bold;
  font-size: 2em;
}

.score span {
  display: inline-block;
  transform-style: preserve-3d;
  backface-visibility: hidden;
}
</style>
