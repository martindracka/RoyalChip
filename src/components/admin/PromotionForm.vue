<script setup>
import { useForm, required, minLength, maxLength, minValue, integer } from '@/composables/useForm'
import { toDateInput } from '@/lib/format'
import FormField from '@/components/ui/FormField.vue'
import BaseButton from '@/components/ui/BaseButton.vue'

const props = defineProps({
  promotion: { type: Object, default: null }, // null = create mode
  save: { type: Function, required: true } // async (data) => void
})

const inDays = (d) => new Date(Date.now() + d * 86400000).toISOString()

const { values, errors, submitting, handleSubmit, validateField } = useForm(
  {
    title: props.promotion?.title ?? '',
    description: props.promotion?.description ?? '',
    bonusAmount: props.promotion?.bonusAmount ?? 250,
    startsAt: toDateInput(props.promotion?.startsAt ?? new Date().toISOString()),
    endsAt: toDateInput(props.promotion?.endsAt ?? inDays(30)),
    isActive: props.promotion?.isActive ?? true
  },
  {
    title: [required(), minLength(3), maxLength(80)],
    description: [required(), maxLength(500)],
    bonusAmount: [required(), integer(), minValue(1), (v) => (Number(v) > 100000 ? 'Max 100,000 chips' : '')],
    startsAt: [required()],
    endsAt: [required(), (v, all) => (new Date(v) <= new Date(all.startsAt) ? 'End must be after the start' : '')]
  }
)

const submit = () =>
  handleSubmit((v) =>
    props.save({
      title: v.title.trim(),
      description: v.description.trim(),
      bonusAmount: Number(v.bonusAmount),
      startsAt: new Date(v.startsAt).toISOString(),
      endsAt: new Date(v.endsAt).toISOString(),
      isActive: v.isActive
    })
  )
</script>

<template>
  <form class="card" novalidate @submit.prevent="submit">
    <div class="form-grid">
      <FormField id="title" label="Title" :error="errors.title" class="full">
        <template #default="{ describedby }">
          <input id="title" v-model="values.title" :aria-describedby="describedby" @blur="validateField('title')" />
        </template>
      </FormField>
      <FormField id="description" label="Description" :error="errors.description" class="full">
        <template #default="{ describedby }">
          <textarea id="description" v-model="values.description" rows="3" :aria-describedby="describedby" @blur="validateField('description')"></textarea>
        </template>
      </FormField>
      <FormField id="bonusAmount" label="Bonus chips" :error="errors.bonusAmount">
        <template #default="{ describedby }">
          <input id="bonusAmount" v-model.number="values.bonusAmount" type="number" min="1" :aria-describedby="describedby" @blur="validateField('bonusAmount')" />
        </template>
      </FormField>
      <FormField id="startsAt" label="Starts" :error="errors.startsAt">
        <template #default="{ describedby }">
          <input id="startsAt" v-model="values.startsAt" type="datetime-local" :aria-describedby="describedby" @blur="validateField('startsAt')" />
        </template>
      </FormField>
      <FormField id="endsAt" label="Ends" :error="errors.endsAt">
        <template #default="{ describedby }">
          <input id="endsAt" v-model="values.endsAt" type="datetime-local" :aria-describedby="describedby" @blur="validateField('endsAt')" />
        </template>
      </FormField>
      <label class="check full">
        <input v-model="values.isActive" type="checkbox" />
        Active
      </label>
    </div>
    <div class="form-actions">
      <BaseButton variant="secondary" :to="{ name: 'admin-promotions' }">Cancel</BaseButton>
      <BaseButton type="submit" :loading="submitting">{{ promotion ? 'Save changes' : 'Create promotion' }}</BaseButton>
    </div>
  </form>
</template>

<style scoped>
.check {
  display: flex;
  align-items: center;
  gap: 0.6rem;
  font-weight: 600;
}
</style>
