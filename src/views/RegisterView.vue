<script setup>
import AppIcon from '@/components/ui/AppIcon.vue'
import { ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { useProfileStore } from '@/stores/profile'
import { useToast } from '@/composables/useToast'
import { useForm, required, email, minLength, maxLength } from '@/composables/useForm'
import { toMessage } from '@/lib/errors'
import { formatChips } from '@/lib/format'
import { STARTING_BALANCE, FRIEND_BONUS, isValidReferralCode } from '@shared/rules.js'
import AuthCard from '@/components/layout/AuthCard.vue'
import FormField from '@/components/ui/FormField.vue'
import BaseButton from '@/components/ui/BaseButton.vue'

const auth = useAuthStore()
const router = useRouter()
const profileStore = useProfileStore()
const route = useRoute()

// Invite link: /register?ref=<user ID of the friend>. The code is checked again when the profile is created.
const referralCode = isValidReferralCode(route.query.ref) ? route.query.ref : null
const startChips = STARTING_BALANCE + (referralCode ? FRIEND_BONUS : 0)
const toast = useToast()
const formError = ref('')

const sameAsPassword = (v, all) => (v !== all.password ? 'Passwords do not match' : '')
const adult = (v) => (!v ? 'You must confirm that you are 18 or older' : '')

const { values, errors, submitting, handleSubmit, validateField } = useForm(
  { name: '', email: '', password: '', confirm: '', adult: false },
  {
    name: [required(), minLength(3), maxLength(30)],
    email: [required(), email()],
    password: [required(), minLength(8)],
    confirm: [required(), sameAsPassword],
    adult: [adult]
  }
)

const submit = () =>
  handleSubmit(async ({ name, email, password }) => {
    formError.value = ''
    try {
      await auth.register(name.trim(), email, password, referralCode)
      toast.success(`Account created – ${formatChips(profileStore.balance)} chips are waiting for you!`)
      router.push('/games')
    } catch (e) {
      formError.value = e.code === 409 ? 'An account with this e-mail already exists.' : toMessage(e)
    }
  })
</script>

<template>
  <AuthCard title="Create account" :subtitle="`Get ${formatChips(startChips)} free chips to start.`">
    <p v-if="referralCode" class="invite-note">
      <AppIcon name="party" :size="18" /> You were invited by a friend – you get <strong>{{ formatChips(FRIEND_BONUS) }} extra chips</strong>!
    </p>
    <form novalidate @submit.prevent="submit">
      <p v-if="formError" class="form-error" role="alert">{{ formError }}</p>
      <FormField id="name" label="Username" :error="errors.name">
        <template #default="{ describedby }">
          <input id="name" v-model="values.name" autocomplete="nickname" :aria-describedby="describedby" @blur="validateField('name')" />
        </template>
      </FormField>
      <FormField id="email" label="E-mail" :error="errors.email">
        <template #default="{ describedby }">
          <input id="email" v-model="values.email" type="email" autocomplete="email" :aria-describedby="describedby" @blur="validateField('email')" />
        </template>
      </FormField>
      <FormField id="password" label="Password" hint="At least 8 characters" :error="errors.password">
        <template #default="{ describedby }">
          <input id="password" v-model="values.password" type="password" autocomplete="new-password" :aria-describedby="describedby" @blur="validateField('password')" />
        </template>
      </FormField>
      <FormField id="confirm" label="Repeat password" :error="errors.confirm">
        <template #default="{ describedby }">
          <input id="confirm" v-model="values.confirm" type="password" autocomplete="new-password" :aria-describedby="describedby" @blur="validateField('confirm')" />
        </template>
      </FormField>
      <div>
        <label class="check">
          <input v-model="values.adult" type="checkbox" />
          I am 18 or older and understand this casino uses virtual chips only.
        </label>
        <p v-if="errors.adult" class="negative" role="alert">{{ errors.adult }}</p>
      </div>
      <BaseButton type="submit" size="lg" :loading="submitting">Create account</BaseButton>
    </form>
    <p class="switch">Already have an account? <RouterLink to="/login">Log in</RouterLink></p>
  </AuthCard>
</template>

<style scoped>
.invite-note {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin: 1rem 0 0;
  padding: 0.75rem 1rem;
  border-radius: var(--radius-sm);
  background: rgb(236 72 153 / 0.12);
  border: 1px solid rgb(236 72 153 / 0.4);
  font-size: 0.92rem;
}
.check {
  display: flex;
  gap: 0.6rem;
  align-items: flex-start;
  font-size: 0.9rem;
}
.check input {
  margin-top: 0.3rem;
}
p.negative {
  margin: 0.3rem 0 0;
  font-size: 0.85rem;
}
</style>
