<template>
  <header>
    <v-card :height="props.height">
      <v-img :src="props.background" class="blur-image" :max-height="props.height" cover />
      <div class="overlay">
        <v-card-title class="text-center" style="font-size: 2rem;" text>{{ props.title }}</v-card-title>
        <v-card-subtitle class="text-center" style="font-size: 1rem;">{{ props.description }}</v-card-subtitle>
      </div>
    </v-card>
  </header>
</template>

<script setup lang="ts">
import { Shared } from '@/types/Shared';

const props = defineProps({
  background: {
    type: String,
    required: false,
    default: () => Shared.background
  },
  title: {
    type: String,
    required: false,
    default: () => Shared.info.value.title
  },
  description: {
    type: String,
    required: false,
    default: () => Shared.info.value.bio
  },
  height: {
    type: Number,
    required: false,
    default: 200
  },
});
</script>

<style>
.blur-image {
  filter: blur(3px);
}

.overlay {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  color: white;
  background-color: rgba(0, 0, 0, 0.4);
}
</style>
