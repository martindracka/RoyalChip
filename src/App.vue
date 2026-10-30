<script setup>
import { isConfigured } from '@/lib/appwrite'
import AppHeader from '@/components/layout/AppHeader.vue'
import AppFooter from '@/components/layout/AppFooter.vue'
import ToastContainer from '@/components/ui/ToastContainer.vue'
import ConfirmDialog from '@/components/ui/ConfirmDialog.vue'
import SetupNotice from '@/components/layout/SetupNotice.vue'
</script>

<template>
  <a class="skip-link" href="#main">Skip to content</a>
  <SetupNotice v-if="!isConfigured" />
  <template v-else>
    <AppHeader />
    <main id="main" class="container main">
      <RouterView v-slot="{ Component }">
        <Transition name="fade" mode="out-in">
          <component :is="Component" />
        </Transition>
      </RouterView>
    </main>
    <AppFooter />
  </template>
  <ToastContainer />
  <ConfirmDialog />
</template>

<style scoped>
.main {
  min-height: calc(100vh - 160px);
  padding-block: 2rem 3rem;
}
</style>
