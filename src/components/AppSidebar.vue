<script setup lang="ts">
import { LogOut } from "lucide-vue-next"
import { useRouter } from "vue-router"

import NavMain from "@/components/NavMain.vue"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
} from "@/components/ui/sidebar"

const router = useRouter()

const logout = () => {
  localStorage.removeItem("authToken")
  localStorage.removeItem("currentUser")
  router.replace("/login")
}

const navMain = [
  {
    title: "Posts",
    isActive: true,
    items: [
      { title: "All Posts", url: "/dashboard/posts" },
      { title: "Create Post", url: "/dashboard/create" },
    ],
  },
]
</script>

<template>
  <Sidebar collapsible="icon">
    <SidebarContent>
      <NavMain :items="navMain" />
    </SidebarContent>

    <SidebarFooter>
      <SidebarMenu>
        <SidebarMenuItem>
          <SidebarMenuButton
            class="text-red-600 hover:bg-red-50 hover:text-red-700"
            @click="logout"
          >
            <LogOut class="mr-2 h-4 w-4" />
            Logout
          </SidebarMenuButton>
        </SidebarMenuItem>
      </SidebarMenu>
    </SidebarFooter>
  </Sidebar>
</template>
