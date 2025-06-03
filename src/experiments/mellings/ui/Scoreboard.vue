<script setup lang="ts">
    import { defineProps } from 'vue';

    interface ScoreboardProps {
        numMellings: number;
        level: number;
    }

    const { numMellings = 0, level = 0 } = defineProps<ScoreboardProps>();

</script>

<template>
    <div class="scoreboard">
        <span>{{ numMellings }}</span>
        <span>{{ level }}</span>
    </div>
</template>

<style>
.scoreboard {
    display: flex;
    justify-content: space-between;
    align-items: center;
}
</style>