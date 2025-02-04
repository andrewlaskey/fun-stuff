<script setup lang="ts">
import { defineProps, computed, onMounted, watch, useTemplateRef } from 'vue';
import { gsap } from "gsap";
import { debounce } from 'lodash';

export interface AvatarElementProps {
    fileName: string;
    elementType?: string;
    activeIndex?: number;
    numVariants?: number;
    emptySlots?: number;
    delay?: number;
    renderSingleVariant?: boolean;
}

const DEBOUNCE_MS = 300;

const {
    fileName = 'face',
    elementType = 'faces',
    activeIndex = 0,
    numVariants = 14,
    emptySlots = 0,
    delay = 0,
    renderSingleVariant = false
} = defineProps<AvatarElementProps>();
const variants = useTemplateRef('variants');

const totalVariants = computed(() => {
    return numVariants + emptySlots;
});

const safeActiveIndex = computed(() => {
    return (activeIndex % totalVariants.value);
});

const animateVariantsFn = () => {
    if (variants.value) {
        variants.value.forEach((variantEl, i) => {
            if (gsap.isTweening(variantEl)) {
                gsap.killTweensOf(variantEl);
            }

            if (i === safeActiveIndex.value) {
                gsap.set(variantEl, { scale: 0.7, autoAlpha: 1 })
                gsap.to(variantEl, {
                    delay,
                    duration: 0.5,
                    ease: "elastic.inOut(1.5,0.3)",
                    scale: 1,
                });
            } else {
                const tl = gsap.timeline();
                tl.to(variantEl,
                    {
                        duration: 0.15,
                        scale: 0.8,
                        ease: "power4.out"
                    }
                )
                .to(variantEl, { autoAlpha: 0, duration: 0.05 });
            }
        });
    }
};

onMounted(() => {
    animateVariantsFn();
});

watch(() => activeIndex, debounce(animateVariantsFn, DEBOUNCE_MS));

</script>

<template>
    <div class="element" :class="elementType">
        <div class="variant" v-if="renderSingleVariant">
            <img
                v-if="safeActiveIndex + 1 < numVariants"
                :src="`./avatar_shapes/${elementType}/${fileName}_${safeActiveIndex + 1}.png`"
            />
        </div>
        <ul class="variants" v-else>
            <li
                v-for="n in totalVariants"
                ref="variants"
                class="variant"
            >
                <img v-if="n <= numVariants"
                    :src="`./avatar_shapes/${elementType}/${fileName}_${n}.png`"
                />
            </li>
        </ul>
    </div>
</template>

<style lang="css">
.element,
.variant {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
}

.variants {
    margin: 0;
    padding: 0;
    list-style-type: none;
}

.variants li {
    margin: 0;
    padding: 0;
}

.variant img {
    width: 100%;
}
</style>