<script setup lang="ts">
import { ref, computed, onMounted, useTemplateRef, watch, onBeforeMount } from 'vue'
import { draw } from 'radash';
import { gsap } from "gsap";
import Avatar from './components/Avatar.vue';

const inputNameField = ref('');
const randomStr = ref('');
const isPaused = ref(false);
const pauseButton = useTemplateRef('pause-toggle');
const inputEl = useTemplateRef('input-name');
const COLORS = [
    '#26a4b1',
    '#75c364',
    '#ff0a00',
    '#2ddfe4',
    '#ff9400',
    '#d93800',
    '#833167',
    '#8b8277'
];
const CYCLE_SPEED = 1.5 * 1000;

// https://www.geeksforgeeks.org/random-string-generator-using-javascript/
const randomStringGenerator = (): string => {
    const min = 2;
    const max = 25;
    const length = Math.floor(Math.random() * (max - min) + min);
    let result = '';

    for(let i = 0; i < length; i++) {
        result += 
        String.fromCharCode(97 + Math.floor(Math.random() * 26));
    }

    return result;
}

const avatarInput = computed(() => {
    return inputNameField.value.length > 0 ? inputNameField.value : randomStr.value;
});

const pauseButtonClick = () => {
    isPaused.value = !isPaused.value;
}

onBeforeMount(() => {
    randomStr.value = randomStringGenerator();
});

onMounted(() => {
    setInterval(() => {
        if (!isPaused.value && inputNameField.value.length === 0) {
            randomStr.value = randomStringGenerator();

            // const picked = draw(COLORS);
            // gsap.to(pauseButton.value, {
            //     backgroundColor: picked,
            //     duration: 0.25
            // });
            // gsap.to(inputEl.value, {
            //     borderColor: picked,
            //     duration: 0.25
            // });
        }
    }, CYCLE_SPEED);
});
</script>

<template>
    <div class="avatar-editor">
        <Avatar :input-name="avatarInput"/>
        <input ref="input-name" class="text-input" v-model="inputNameField" type="text" placeholder="Your name"/>
        <button
            ref="pause-toggle"
            @click="pauseButtonClick"
            type="button"
            class="pause-toggle-btn"
        >
            <span v-show="!isPaused">⏸</span>
            <span v-show="isPaused">⏵</span>
        </button>
        <!-- <Avatar input-name="test" :render-single-variant="true" /> -->
    </div>
</template>

<style scoped>
.avatar-editor {
    display: flex;
    align-items: center;
    flex-direction: column;
    position: relative;
}

.text-input {
    position: relative;
    padding: 0.5em 1em;
    font-size: 2em;
    border: 5px solid #74898c;
    border-radius: 5px;
    outline: none;
    font-family: "Jua", Arial, sans-serif;
}

.pause-toggle-btn {
    position: absolute;
    top: 0;
    left: 0;
    border: none;
    width: 2em;
    height: 2em;
    border-radius: 50%;
    background: #26a4b1;
    font-size: 1.2em;
    color: white;
    opacity: 0;
    line-height: 2em;
}

.avatar-editor:hover .pause-toggle-btn {
    opacity: 1;
}
</style>