<script setup>
import { ref, computed, onBeforeUnmount } from 'vue'
import { useForm, required, minLength, maxLength, minValue, integer } from '@/composables/useForm'
import { getImageUrl, MAX_IMAGE_SIZE, ALLOWED_IMAGE_TYPES } from '@/services/storageService'
import { GAME_TYPES } from '@/lib/format'
import FormField from '@/components/ui/FormField.vue'
import BaseButton from '@/components/ui/BaseButton.vue'

const props = defineProps({
  game: { type: Object, default: null }, // null = create mode
  // async (data, imageFile) => void – provided by the parent view, which talks to Appwrite
  save: { type: Function, required: true }
})

const { values, errors, submitting, handleSubmit, validateField } = useForm(
  {
    name: props.game?.name ?? '',
    type: props.game?.type ?? 'slots',
    description: props.game?.description ?? '',
    minBet: props.game?.minBet ?? 10,
    maxBet: props.game?.maxBet ?? 500,
    isActive: props.game?.isActive ?? true
  },
  {
    name: [required(), minLength(3), maxLength(60)],
    type: [required()],
    description: [maxLength(1000)],
    minBet: [required(), integer(), minValue(1)],
    maxBet: [required(), integer(), (v, all) => (Number(v) < Number(all.minBet) ? 'Must be ≥ minimum bet' : '')]
  }
)

// ---- image upload (Appwrite Storage) ----
const imageFile = ref(null)
const imageError = ref('')
const previewUrl = ref(null)
const currentImage = computed(() => previewUrl.value || getImageUrl(props.game?.imageId))

function onFileChange(event) {
  const file = event.target.files[0]
  imageError.value = ''
  if (!file) return
  if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
    imageError.value = 'Only PNG, JPG, WEBP or GIF images are allowed'
  } else if (file.size > MAX_IMAGE_SIZE) {
    imageError.value = 'The image must be smaller than 2 MB'
  }
  if (imageError.value) {
    event.target.value = ''
    return
  }
  imageFile.value = file
  if (previewUrl.value) URL.revokeObjectURL(previewUrl.value)
  previewUrl.value = URL.createObjectURL(file)
}

onBeforeUnmount(() => previewUrl.value && URL.revokeObjectURL(previewUrl.value))

// The form only validates and prepares clean data; the parent view does the saving.
const submit = () =>
  handleSubmit(async (v) => {
    const data = {
      name: v.name.trim(),
      type: v.type,
      description: v.description.trim(),
      minBet: Number(v.minBet),
      maxBet: Number(v.maxBet),
      isActive: v.isActive
    }
    await props.save(data, imageFile.value)
  })
</script>

<template>
  <form class="card" novalidate @submit.prevent="submit">
    <div class="form-grid">
      <FormField id="name" label="Name" :error="errors.name" class="full">
        <template #default="{ describedby }">
          <input id="name" v-model="values.name" :aria-describedby="describedby" @blur="validateField('name')" />
        </template>
      </FormField>

      <FormField id="type" label="Game type" :error="errors.type">
        <template #default="{ describedby }">
          <select id="type" v-model="values.type" :aria-describedby="describedby">
            <option v-for="t in GAME_TYPES" :key="t.value" :value="t.value">{{ t.label }}</option>
          </select>
        </template>
      </FormField>

      <FormField id="minBet" label="Minimum bet" :error="errors.minBet">
        <template #default="{ describedby }">
          <input id="minBet" v-model.number="values.minBet" type="number" min="1" :aria-describedby="describedby" @blur="validateField('minBet')" />
        </template>
      </FormField>

      <FormField id="maxBet" label="Maximum bet" :error="errors.maxBet">
        <template #default="{ describedby }">
          <input id="maxBet" v-model.number="values.maxBet" type="number" min="1" :aria-describedby="describedby" @blur="validateField('maxBet')" />
        </template>
      </FormField>

      <FormField id="description" label="Description" :error="errors.description" hint="Max 1000 characters" class="full">
        <template #default="{ describedby }">
          <textarea id="description" v-model="values.description" rows="4" :aria-describedby="describedby" @blur="validateField('description')"></textarea>
        </template>
      </FormField>

      <FormField id="image" label="Cover image" :error="imageError" hint="PNG, JPG, WEBP or GIF, max 2 MB" class="full">
        <template #default="{ describedby }">
          <div class="image-row">
            <img v-if="currentImage" :src="currentImage" alt="Cover preview" class="preview" />
            <input id="image" type="file" accept="image/*" :aria-describedby="describedby" @change="onFileChange" />
          </div>
        </template>
      </FormField>

      <label class="check full">
        <input v-model="values.isActive" type="checkbox" />
        Visible to players
      </label>
    </div>

    <div class="form-actions">
      <BaseButton variant="secondary" :to="{ name: 'admin-games' }">Cancel</BaseButton>
      <BaseButton type="submit" :loading="submitting">{{ game ? 'Save changes' : 'Create game' }}</BaseButton>
    </div>
  </form>
</template>

<style scoped>
.image-row {
  display: flex;
  align-items: center;
  gap: 1rem;
}
.preview {
  width: 160px;
  aspect-ratio: 16 / 9;
  object-fit: cover;
  border-radius: var(--radius-sm);
}
.check {
  display: flex;
  align-items: center;
  gap: 0.6rem;
  font-weight: 600;
}
</style>
