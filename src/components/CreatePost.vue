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

  // Frontend validation
  if (!form.value.title || !form.value.body) {
    errorMessage.value = "Title and body are required"
    return
  }

  loading.value = true

  try {
    const token = localStorage.getItem("authToken")
    if (!token) {
      throw new Error("Not authenticated")
    }

    await axios.post(
      "http://192.168.18.141:8000/api/posts",
      form.value,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
        timeout: 8000, // prevents hanging requests
      }
    )

    // SUCCESS
    successMessage.value = "Post created successfully"

    form.value.title = ""
    form.value.body = ""

  } catch (err: any) {

    // API RESPONDED WITH ERROR
    if (err.response) {
      if (err.response.status === 401) {
        errorMessage.value = "Session expired. Please login again."
      } else if (err.response.status === 422) {
        // Laravel / validation errors
        const errors = err.response.data?.errors
        errorMessage.value =
          errors?.title?.[0] ||
          errors?.body?.[0] ||
          err.response.data?.message ||
          "Validation failed"
      } else {
        errorMessage.value =
          err.response.data?.message ||
          "Server error while creating post"
      }

    // REQUEST MADE BUT NO RESPONSE (SERVER OFF / NETWORK)
    } else if (err.request) {
      errorMessage.value = err.message || "Cannot connect to server. Please check your internet connection."

    // ANY OTHER ERROR
    } else {
      errorMessage.value = err.message || "Unexpected error occurred"
    }

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
