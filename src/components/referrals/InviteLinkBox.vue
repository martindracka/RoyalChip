<script setup>
import { ref } from 'vue'
import { useToast } from '@/composables/useToast'
import BaseButton from '@/components/ui/BaseButton.vue'

const props = defineProps({ link: { type: String, required: true } })

const toast = useToast()
const copied = ref(false)
const canShare = typeof navigator !== 'undefined' && Boolean(navigator.share)

async function copy() {
  try {
    await navigator.clipboard.writeText(props.link)
    copied.value = true
    toast.success('Invite link copied – send it to your friends!')
    setTimeout(() => (copied.value = false), 2000)
  } catch {
    toast.error('Could not copy automatically. Please select the link and copy it.')
  }
}

// Opens the phone's native share menu (WhatsApp, Messenger, …) where supported.
async function share() {
  try {
    await navigator.share({
      title: 'Royal Chip Casino',
      text: 'Join me at Royal Chip Casino and get extra free chips!',
      url: props.link
    })
  } catch {
    // the user closed the share menu – nothing to do
  }
}
</script>

<template>
  <div class="invite-box">
    <label for="invite-link" class="label">Your personal invite link</label>
    <div class="row">
      <input id="invite-link" :value="link" readonly @focus="$event.target.select()" />
      <BaseButton @click="copy">{{ copied ? '✔ Copied' : 'Copy link' }}</BaseButton>
      <BaseButton v-if="canShare" variant="secondary" @click="share">Share</BaseButton>
    </div>
  </div>
</template>

<style scoped>
.label {
  display: block;
  font-weight: 600;
  font-size: 0.9rem;
  margin-bottom: 0.5rem;
}
.row {
  display: flex;
  gap: 0.6rem;
  flex-wrap: wrap;
}
input {
  flex: 1;
  min-width: 220px;
  font-family: ui-monospace, 'Cascadia Code', Consolas, monospace;
  font-size: 0.9rem;
  color: var(--gold-strong);
}
</style>
