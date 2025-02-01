<script setup lang="ts">
import { defineProps, computed } from 'vue'
import AvatarElement from './AvatarElement.vue';

export interface AvatarProps {
    inputName?: string;
}

const { inputName = '' } = defineProps<AvatarProps>();

const numVariants = 14;
const numBeardVariants = 6;

const strToNum = (str: string, multiplier: number, offset: number): number => {
    let result = 0;
    for (let i = 0; i < str.length; i++) {
        const code = str.charCodeAt(i);
        result += (code * multiplier) + offset;
    }

    return result;
};

const faceIndex = computed(() => {
    return strToNum(inputName, 17, 6);
});
const beardIndex = computed(() => {
    return strToNum(inputName, 3, 2);
});
const hairIndex = computed(() => {
    return strToNum(inputName, 8, 1);
});
const eyesIndex = computed(() => {
    return strToNum(inputName, 22, 9);
});
const noseIndex = computed(() => {
    return strToNum(inputName, 4, 7);
});
const mouthIndex = computed(() => {
    return strToNum(inputName, 11, 4);
});
</script>

<template>
    <div class="avatar">
        <AvatarElement element-type="faces" file-name="face" :active-index="faceIndex" :num-variants="numVariants" />
        <AvatarElement
            element-type="beards"
            file-name="beard"
            :active-index="beardIndex"
            :num-variants="numBeardVariants"
            :empty-slots="numVariants - numBeardVariants"
        />
        <AvatarElement element-type="noses" file-name="nose" :active-index="noseIndex" :num-variants="numVariants" />
        <AvatarElement element-type="eyes" file-name="eye" :active-index="eyesIndex" :num-variants="numVariants" />
        <AvatarElement element-type="mouths" file-name="mouth" :active-index="mouthIndex" :num-variants="numVariants" />
        <AvatarElement element-type="hair" file-name="hair" :active-index="hairIndex" :num-variants="numVariants" />
    </div>
</template>

<style>
    .avatar {
        position: relative;
        width: 400px;
        height: 500px;
    }
</style>