<script setup lang="ts">
import AppSidebar from "../components/AppSidebar.vue"
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar"
import { Separator } from "@/components/ui/separator"

</script>

<template>
  <SidebarProvider>
    <AppSidebar />

    <SidebarInset>
      <header class="flex h-16 items-center gap-2 px-4">
        <SidebarTrigger class="-ml-1" />
        <Separator orientation="vertical" class="h-4" />
        <h1 class="text-xl font-semibold">Dashboard</h1>
      </header>

      <div class="p-4">
        <RouterView />
      </div>

    </SidebarInset>
  </SidebarProvider>
</template>
