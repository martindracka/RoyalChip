<script setup>
import { ref } from 'vue'
import { useAuthStore } from '@/stores/auth'
import { useAsync } from '@/composables/useAsync'
import { useToast } from '@/composables/useToast'
import { useConfirm } from '@/composables/useConfirm'
import { listPromotions, deletePromotion } from '@/services/promotionService'
import { formatChips, formatDate } from '@/lib/format'
import { toMessage } from '@/lib/errors'
import BaseButton from '@/components/ui/BaseButton.vue'
import StatusBadge from '@/components/ui/StatusBadge.vue'
import LoadingState from '@/components/ui/LoadingState.vue'
import ErrorState from '@/components/ui/ErrorState.vue'
import EmptyState from '@/components/ui/EmptyState.vue'

const auth = useAuthStore()
const toast = useToast()
const { confirm } = useConfirm()
const { data: promotions, loading, error, run } = useAsync(() => listPromotions(), { initialData: [] })
const busyId = ref(null)

function status(promo) {
  const now = Date.now()
  if (!promo.isActive) return { tone: 'neutral', label: 'Disabled' }
  if (new Date(promo.startsAt) > now) return { tone: 'warning', label: 'Scheduled' }
  if (new Date(promo.endsAt) <= now) return { tone: 'danger', label: 'Expired' }
  return { tone: 'success', label: 'Running' }
}

async function remove(promo) {
  const ok = await confirm({ title: `Delete "${promo.title}"?`, message: 'This cannot be undone.', confirmLabel: 'Delete' })
  if (!ok) return
  busyId.value = promo.$id
  try {
    await deletePromotion(promo.$id)
    toast.success('Promotion deleted.')
    await run()
  } catch (e) {
    toast.error(toMessage(e))
  } finally {
    busyId.value = null
  }
}
</script>

<template>
  <div>
    <header class="page-header">
      <div>
        <h1>Promotions</h1>
        <p>Bonus campaigns players can claim once.</p>
      </div>
      <BaseButton :to="{ name: 'admin-promotion-new' }">+ New promotion</BaseButton>
    </header>

    <LoadingState v-if="loading" />
    <ErrorState v-else-if="error" :message="error" @retry="run" />
    <EmptyState v-else-if="!promotions.length" icon="🎁" title="No promotions yet">
      <BaseButton :to="{ name: 'admin-promotion-new' }">+ New promotion</BaseButton>
    </EmptyState>
    <div v-else class="table-wrap">
      <table>
        <thead>
          <tr>
            <th scope="col">Title</th>
            <th scope="col">Bonus</th>
            <th scope="col">Valid</th>
            <th scope="col">Status</th>
            <th scope="col"><span class="sr-only">Actions</span></th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="promo in promotions" :key="promo.$id">
            <td><strong>{{ promo.title }}</strong></td>
            <td>{{ formatChips(promo.bonusAmount) }}</td>
            <td>{{ formatDate(promo.startsAt) }} → {{ formatDate(promo.endsAt) }}</td>
            <td><StatusBadge v-bind="status(promo)" /></td>
            <td class="actions">
              <BaseButton size="sm" variant="secondary" :to="{ name: 'admin-promotion-edit', params: { id: promo.$id } }">
                Edit
              </BaseButton>
              <BaseButton
                v-if="auth.hasPermission('delete:content')"
                size="sm"
                variant="danger"
                :loading="busyId === promo.$id"
                @click="remove(promo)"
              >
                Delete
              </BaseButton>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>
