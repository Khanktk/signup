<script setup lang="ts">
import { RouterView, useRoute } from 'vue-router'

const route = useRoute()
</script>

<template>
  <div>
    <!-- Wrap only signup and login -->
    <div v-if="route.name === 'signup' || route.name === 'login'" class="flex min-h-svh w-full items-center justify-center p-6 md:p-10">
      <div class="w-full max-w-sm">
        <RouterView />
      </div>
    </div>

    <!-- Dashboard or other full-width pages -->
    <div v-else>
      <RouterView />
    </div>
  </div>
</template>
