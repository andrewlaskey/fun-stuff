<script setup lang="ts">
import { onMounted, ref } from 'vue';
import { App } from '../control/App';
import Scoreboard from './Scoreboard.vue';

const app = ref<App | null>(null);

onMounted(() => {
    app.value = new App(document, '#canvas');
    app.value.preload().then(() => {
        console.log('preload complete');
        app.value!.manager.start();
    }).catch((e) => {
        console.error('failed to start app', e);
    });
});

</script>

<template>
    <div class="app-container">
        <Scoreboard :num-mellings="app?.manager.uiState.mellingsCount || 0" :level="app?.manager.uiState.level || 0" />
        <canvas id="canvas"></canvas>
    </div>
</template>