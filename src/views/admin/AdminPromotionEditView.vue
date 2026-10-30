<script setup>
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import { useAsync } from '@/composables/useAsync'
import { useToast } from '@/composables/useToast'
import { getPromotion, createPromotion, updatePromotion } from '@/services/promotionService'
import { toMessage } from '@/lib/errors'
import PromotionForm from '@/components/admin/PromotionForm.vue'
import LoadingState from '@/components/ui/LoadingState.vue'
import ErrorState from '@/components/ui/ErrorState.vue'

const props = defineProps({ id: { type: String, default: null } })
const router = useRouter()
const toast = useToast()

const isEdit = computed(() => Boolean(props.id))
const { data: promotion, loading, error, run } = useAsync(() => (props.id ? getPromotion(props.id) : null))

async function save(data) {
  try {
    if (isEdit.value) await updatePromotion(props.id, data)
    else await createPromotion(data)
    toast.success(isEdit.value ? 'Promotion updated.' : 'Promotion created.')
    router.push({ name: 'admin-promotions' })
  } catch (e) {
    toast.error(toMessage(e))
  }
}
</script>

<template>
  <div>
    <header class="page-header">
      <h1>{{ isEdit ? 'Edit promotion' : 'New promotion' }}</h1>
    </header>
    <LoadingState v-if="loading" />
    <ErrorState v-else-if="error" :message="error" @retry="run" />
    <PromotionForm v-else :key="promotion?.$id || 'new'" :promotion="promotion" :save="save" />
  </div>
</template>
