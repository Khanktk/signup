<script setup lang="ts">
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
import axios from "axios"
import { useRouter } from "vue-router"

const router = useRouter()
const url = "http://192.168.18.141:8000/api"

// Form fields
const name = ref("")
const email = ref("")
const password = ref("")
const confirmPassword = ref("")

// Messages
const successMessage = ref("")
const networkErrorMessage = ref("")
const backendErrors = ref<any>(null)

// Field-specific error messages
const emptyName = ref("")
const emptyEmail = ref("")
const emptyPassword = ref("")
const emptyConfirmPassword = ref("")

// Watchers to clear field errors on input
watch(name, () => {
  if (name.value) {
    emptyName.value = ""
    if (backendErrors.value?.name) backendErrors.value.name = null
  }
})
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
watch(confirmPassword, () => {
  if (confirmPassword.value) {
    emptyConfirmPassword.value = ""
    if (backendErrors.value?.confirm_password) backendErrors.value.confirm_password = null
  }
})

async function createUser() {
  successMessage.value = ""
  networkErrorMessage.value = ""
  emptyName.value = ""
  emptyEmail.value = ""
  emptyPassword.value = ""
  emptyConfirmPassword.value = ""
  backendErrors.value = null
  
  try {
    const res = await axios.post(`${url}/register`, {
      name: name.value,
      email: email.value,
      password: password.value,
      confirm_password: confirmPassword.value
    })

    if (res.data.data) {
      successMessage.value = res.data.message
      name.value = ""
      email.value = ""
      password.value = ""
      confirmPassword.value = ""
      backendErrors.value = null
    }
    setTimeout(() => {  
      router.push("/login") 
    }, 3000)

  } catch (err: any) {
    console.log(err.response);
    if (err.response?.data?.errors) {
      backendErrors.value = err.response.data.errors

      if (backendErrors.value.name?.[0]) {
        emptyName.value = backendErrors.value.name[0]
      } else if (backendErrors.value.email?.[0]) {
        emptyEmail.value = backendErrors.value.email[0]
      } else if (backendErrors.value.password?.[0]) {
        emptyPassword.value = backendErrors.value.password[0]
      } else if (backendErrors.value.confirm_password?.[0]) {
        emptyConfirmPassword.value = backendErrors.value.confirm_password[0]
      }

    } else {
      networkErrorMessage.value = err.message || "Network error or server is unreachable."
      console.log(err);
    }
  }
}
</script>

<template>
  <Card>
    <CardHeader>
      <CardTitle>Create an account</CardTitle>
      <CardDescription>
        Enter your information below to create your account
      </CardDescription>
    </CardHeader>
    <CardContent>
      <form @submit.prevent="createUser">
        <FieldGroup>
          <Field>
            <FieldLabel for="name">
              Full Name
            </FieldLabel>
            <Input id="name" type="text" placeholder="John Doe" v-model="name" />
            <p v-if="emptyName" class="text-red-600 text-center text-sm mt-2">{{ emptyName }}</p>
          </Field>
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
            <FieldDescription>
              We'll use this to contact you. We will not share your email with
              anyone else.
            </FieldDescription>
            <p v-if="emptyName" class="text-red-600 text-center text-sm mt-2">{{ emptyEmail }}</p>
          </Field>
          <Field>
            <FieldLabel for="password">
              Password
            </FieldLabel>
            <Input id="password" type="password" v-model="password" />
            <FieldDescription>Must be at least 8 characters long.</FieldDescription>
            <p v-if="emptyName" class="text-red-600 text-center text-sm mt-2">{{ emptyPassword }}</p>
          </Field>
          <Field>
            <FieldLabel for="confirm-password">
              Confirm Password
            </FieldLabel>
            <Input id="confirm-password" type="password" v-model="confirmPassword" />
            <FieldDescription>Please confirm your password.</FieldDescription>
            <p v-if="emptyName" class="text-red-600 text-center text-sm mt-2">{{ emptyConfirmPassword }}</p>
          </Field>
          <!-- SUCCESS MESSAGE -->
          <p v-if="successMessage" class="text-green-600 text-center text-sm mt-2">{{ successMessage }}</p>

          <!-- NETWORK ERROR -->
          <p v-if="networkErrorMessage" class="text-red-600 text-center text-sm mt-2">{{ networkErrorMessage }}</p>
          <FieldGroup>
            <Field>
              <Button type="submit">
                Create Account
              </Button>
              <Button variant="outline" type="button">
                Sign up with Google
              </Button>
              <FieldDescription class="px-6 text-center">
                Already have an account? 
                <RouterLink to="/login">
                  Sign in
                </RouterLink>
              </FieldDescription>
            </Field>
          </FieldGroup>
        </FieldGroup>
      </form>
    </CardContent>
  </Card>
</template>
