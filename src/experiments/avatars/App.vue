<script setup lang="ts">
import { ref } from 'vue'
import Avatar from './components/Avatar.vue';

const inputName = ref('');
</script>

<template>
    <div class="avatar-editor">
        <Avatar :input-name="inputName"/>
        <input class="text-input" v-model="inputName" type="text" placeholder="Your name"/>
    </div>
</template>

<style scoped>
.avatar-editor {
    display: flex;
    align-items: center;
    flex-direction: column;
}

.text-input {
    position: relative;
    padding: 0.5em 1em;
    font-size: 2em;
    border: 5px solid #74898c;
    border-radius: 5px;
}
</style>