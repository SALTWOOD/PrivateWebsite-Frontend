<template>
  <header>
    <v-card class="mx-auto">
      <v-img :src="Shared.background" class="blur-image" max-height="200px" cover></v-img>
      <div class="overlay">
        <v-card-title class="text-center" style="font-size: 2rem;">{{ Shared.info.value.title }}</v-card-title>
        <v-card-subtitle class="text-center" style="font-size: 1rem;">{{ Shared.info.value.bio }}</v-card-subtitle>
      </div>
    </v-card>
  </header>
</template>

<script setup lang="ts">
import { Shared } from '@/types/Shared';
</script>

<style>
.blur-image {
  filter: blur(5px);
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
