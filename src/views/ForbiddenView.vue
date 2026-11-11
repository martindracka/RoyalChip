<script setup>
import EmptyState from '@/components/ui/EmptyState.vue'
import BaseButton from '@/components/ui/BaseButton.vue'
</script>

<template>
  <EmptyState icon="ban" title="No access" message="Your account does not have permission to open this page.">
    <BaseButton to="/">Back to the lobby</BaseButton>
  </EmptyState>
</template>
