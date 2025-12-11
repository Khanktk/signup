<script setup lang="ts">
import type { HTMLAttributes } from "vue"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field"
import { Input } from "@/components/ui/input"

const props = defineProps<{
  class?: HTMLAttributes["class"]
}>()

import { ref, watch } from "vue"
import { useRouter } from "vue-router"

import axios from "axios"

const router = useRouter()
const url = "http://192.168.18.141:8000/api"

// Form fields
const email = ref("")
const password = ref("")

// Messages
const errorMessage = ref("")

// Clear error when typing
watch(email, () => {
  if (email.value) errorMessage.value = ""
})
watch(password, () => {
  if (password.value) errorMessage.value = ""
})

async function loginUser() {
  errorMessage.value = ""

  try {
    const res = await axios.post(`${url}/login`, {
      email: email.value,
      password: password.value
    })

    if (res.data && res.data.data) {
      // Save user and redirect
      localStorage.setItem("currentUser", JSON.stringify(res.data.data))
      router.push("/dashboard")
    } else {
      errorMessage.value = res.data.message || "Invalid credentials"
      password.value = ""
    }

  } catch (err: any) {
    if (err.response?.data?.message) {
      errorMessage.value = err.response.data.message
    } else {
      errorMessage.value = err.message || "Network error, please try again"
    }
    password.value = ""
    console.log(err)
  }
}

</script>

<template>
  <div :class="cn('flex flex-col gap-6', props.class)">
    <Card>
      <CardHeader>
        <CardTitle>Login to your account</CardTitle>
        <CardDescription>
          Enter your email below to login to your account
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form @submit.prevent="loginUser">
          <FieldGroup>
            <Field>
              <FieldLabel for="email">
                Email
              </FieldLabel>
              <Input
                id="email"
                type="email"
                placeholder="m@example.com"
                v-model="email"
              />
            </Field>
            <Field>
              <div class="flex items-center">
                <FieldLabel for="password">
                  Password
                </FieldLabel>
                <a
                  href="#"
                  class="ml-auto inline-block text-sm underline-offset-4 hover:underline"
                >
                  Forgot your password?
                </a>
              </div>
              <Input id="password" type="password" v-model="password" />
            </Field>
            <!-- ERROR MESSAGE -->
              <p v-if="errorMessage" class="text-red-600 text-center text-sm mt-2">
              {{ errorMessage }}
            </p>
            <Field>
              <Button type="submit">
                Login
              </Button>
              <Button variant="outline" type="button">
                Login with Google
              </Button>
              <FieldDescription class="text-center">
                Don't have an account?
                <RouterLink to="/">
                  Sign up
                </RouterLink>

              </FieldDescription>
            </Field>
          </FieldGroup>
        </form>
      </CardContent>
    </Card>
  </div>
</template>
