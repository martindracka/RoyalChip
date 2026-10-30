<script setup>
import EmptyState from '@/components/ui/EmptyState.vue'
import BaseButton from '@/components/ui/BaseButton.vue'
</script>

<template>
  <EmptyState icon="🃏" title="404 – This card is not in the deck" message="The page you are looking for does not exist.">
    <BaseButton to="/">Back to the lobby</BaseButton>
  </EmptyState>
</template>
