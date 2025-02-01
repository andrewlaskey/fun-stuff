<script setup lang="ts">
import { defineProps, computed } from 'vue';

export interface AvatarElementProps {
    fileName: string,
    elementType?: string,
    activeIndex?: number,
    numVariants?: number,
    emptySlots?: number,
}

const {
    fileName = 'face',
    elementType = 'faces',
    activeIndex = 0,
    numVariants = 14,
    emptySlots = 0
} = defineProps<AvatarElementProps>();

const totalVariants = computed(() => {
    return numVariants + emptySlots;
})

const safeActiveIndex = computed(() => {
    return (activeIndex % totalVariants.value) + 1;
})

</script>

<template>
    <div class="element" :class="elementType">
        <ul class="variants">
            <li v-for="n in totalVariants" :class="(n === safeActiveIndex ? 'active' : 'hidden')">
                <img v-if="n <= numVariants"
                    :src="`./avatar_shapes/${elementType}/${fileName}_${n}.png`"
                />
            </li>
        </ul>
    </div>
</template>

<style lang="css">
.variants {
    margin: 0;
    padding: 0;
    list-style-type: none;
}

.variants li {
    margin: 0;
    padding: 0;
}

.hidden {
    display: none;
}

.faces,
.hair,
.beards,
.noses,
.eyes,
.mouths {
    position: absolute;
    top: 0;
    left: 0;
}

.noses {
    transform: translateX(-10%);
}
</style>