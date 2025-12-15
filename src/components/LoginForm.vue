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

import { ref, watch } from "vue"
import { useRouter } from "vue-router"
import axios from "axios"

const props = defineProps<{
  class?: HTMLAttributes["class"]
}>()

const router = useRouter()
const url = "http://192.168.18.141:8000/api"

// Form fields
const email = ref("")
const password = ref("")

// Errors
const emptyEmail = ref("")
const emptyPassword = ref("")
const backendErrors = ref<any>(null)
const networkErrorMessage = ref("")

// Clear errors while typing
watch(email, () => {
  if (email.value) {
    emptyEmail.value = ""
    if (backendErrors.value?.email) backendErrors.value.email = null
  }
})

watch(password, () => {
  if (password.value) {
    emptyPassword.value = ""
    if (backendErrors.value?.password) backendErrors.value.password = null
  }
})

async function loginUser() {
  emptyEmail.value = ""
  emptyPassword.value = ""
  backendErrors.value = null
  networkErrorMessage.value = ""

  try {
    const res = await axios.post(`${url}/login`, {
      email: email.value,
      password: password.value,
    })

    if (res.data?.data) {

      const token = res.data.data.token
      console.log('go get token',res.data);
      const user = res.data.data.user

      localStorage.setItem("authToken", token)
      localStorage.setItem("currentUser",JSON.stringify(res.data.data.user))
      router.push("/dashboard")
    }

  } catch (err: any) {
    if (err.response?.data?.errors) {
      backendErrors.value = err.response.data.errors

      if (backendErrors.value.email?.[0]) {
        emptyEmail.value = backendErrors.value.email[0]
      } else if (backendErrors.value.password?.[0]) {
        emptyPassword.value = backendErrors.value.password[0]
      }

    } else if (err.response?.data?.message) {
      // Invalid credentials or other auth error
      emptyPassword.value = err.response.data.message

    } else {
      networkErrorMessage.value =
        err.message || "Network error or server is unreachable."
    }

    password.value = ""
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

            <!-- EMAIL -->
            <Field>
              <FieldLabel for="email">Email</FieldLabel>
              <Input
                id="email"
                type="email"
                placeholder="m@example.com"
                v-model="email"
              />
              <p v-if="emptyEmail" class="text-red-600 text-sm mt-2 text-center">
                {{ emptyEmail }}
              </p>
            </Field>

            <!-- PASSWORD -->
            <Field>
              <div class="flex items-center">
                <FieldLabel for="password">Password</FieldLabel>
                <a
                  href="#"
                  class="ml-auto inline-block text-sm underline-offset-4 hover:underline"
                >
                  Forgot your password?
                </a>
              </div>

              <Input id="password" type="password" v-model="password" />

              <p
                v-if="emptyPassword"
                class="text-red-600 text-sm mt-2 text-center"
              >
                {{ emptyPassword }}
              </p>
            </Field>

            <!-- NETWORK ERROR -->
            <p
              v-if="networkErrorMessage"
              class="text-red-600 text-sm mt-2 text-center"
            >
              {{ networkErrorMessage }}
            </p>

            <Field>
              <Button type="submit">Login</Button>
              <Button variant="outline" type="button">
                Login with Google
              </Button>

              <FieldDescription class="text-center">
                Don't have an account?
                <RouterLink to="/">Sign up</RouterLink>
              </FieldDescription>
            </Field>

          </FieldGroup>
        </form>
      </CardContent>
    </Card>
  </div>
</template>
