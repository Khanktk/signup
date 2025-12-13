<script setup lang="ts">
import { ref } from "vue"
import axios from "axios"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

/* =============================
   STATE
============================= */
const loading = ref(false)

const form = ref({
  title: "",
  body: "",
})

const successMessage = ref("")
const errorMessage = ref("")

/* =============================
   CLEAR MESSAGES ON USER INPUT
============================= */
const clearMessages = () => {
  successMessage.value = ""
  errorMessage.value = ""
}

/* =============================
   ACTION
============================= */
const createPost = async () => {
  successMessage.value = ""
  errorMessage.value = ""

  if (!form.value.title || !form.value.body) {
    errorMessage.value = "Title and body are required"
    return
  }

  loading.value = true

  try {
    const token = localStorage.getItem("authToken")
    if (!token) throw new Error("Not authenticated")

    await axios.post(
      "http://192.168.18.141:8000/api/posts",
      form.value,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    )

    successMessage.value = "Post created successfully"

    // reset form AFTER success message is set
    form.value.title = ""
    form.value.body = ""
  } catch (err: any) {
    errorMessage.value =
      err?.response?.data?.message ?? "Failed to create post"
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <div class="mx-auto max-w-3xl rounded-xl border bg-white p-8">
    <h2 class="mb-6 text-xl font-semibold text-center">
      Create Post
    </h2>

    <div class="space-y-4">
      <Input
        v-model="form.title"
        placeholder="Post title"
        @input="clearMessages"
      />

      <textarea
        v-model="form.body"
        @input="clearMessages"
        class="w-full rounded-md border p-3 text-sm focus:outline-none focus:ring-2 focus:ring-gray-500"
        rows="8"
        placeholder="Post body"
      />

      <!-- SUCCESS MESSAGE -->
      <p
        v-if="successMessage"
        class="text-center text-sm font-medium text-green-600"
      >
        {{ successMessage }}
      </p>

      <!-- ERROR MESSAGE -->
      <p
        v-if="errorMessage"
        class="text-center text-sm font-medium text-red-600"
      >
        {{ errorMessage }}
      </p>

      <!-- BUTTON -->
      <div class="flex justify-center">
        <Button
          :disabled="loading"
          class="w-48"
          @click="createPost"
        >
          {{ loading ? "Creating..." : "Create Post" }}
        </Button>
      </div>
    </div>
  </div>
</template>
