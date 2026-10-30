<script setup>
import { ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { useToast } from '@/composables/useToast'
import { useForm, required, email } from '@/composables/useForm'
import { toMessage } from '@/lib/errors'
import AuthCard from '@/components/layout/AuthCard.vue'
import FormField from '@/components/ui/FormField.vue'
import BaseButton from '@/components/ui/BaseButton.vue'

const auth = useAuthStore()
const route = useRoute()
const router = useRouter()
const toast = useToast()
const formError = ref('')

const { values, errors, submitting, handleSubmit, validateField } = useForm(
  { email: '', password: '' },
  { email: [required(), email()], password: [required()] }
)

const submit = () =>
  handleSubmit(async ({ email, password }) => {
    formError.value = ''
    try {
      await auth.login(email, password)
      toast.success(`Welcome back, ${auth.user.name || 'player'}!`)
      // Only allow redirects inside the app (prevents open-redirect tricks)
      const redirect = String(route.query.redirect || '')
      const isInternal = redirect.startsWith('/') && !redirect.startsWith('//')
      router.push(isInternal ? redirect : auth.isStaff ? '/admin' : '/games')
    } catch (e) {
      formError.value = e.code === 401 ? 'Wrong e-mail or password.' : toMessage(e)
    }
  })
</script>

<template>
  <AuthCard title="Log in" subtitle="Players and administrators log in here.">
    <form novalidate @submit.prevent="submit">
      <p v-if="formError" class="form-error" role="alert">{{ formError }}</p>
      <FormField id="email" label="E-mail" :error="errors.email">
        <template #default="{ describedby }">
          <input
            id="email"
            v-model="values.email"
            type="email"
            autocomplete="email"
            :aria-describedby="describedby"
            @blur="validateField('email')"
          />
        </template>
      </FormField>
      <FormField id="password" label="Password" :error="errors.password">
        <template #default="{ describedby }">
          <input
            id="password"
            v-model="values.password"
            type="password"
            autocomplete="current-password"
            :aria-describedby="describedby"
          />
        </template>
      </FormField>
      <BaseButton type="submit" size="lg" :loading="submitting">Log in</BaseButton>
    </form>
    <p class="switch">New here? <RouterLink to="/register">Create an account</RouterLink></p>
  </AuthCard>
</template>
