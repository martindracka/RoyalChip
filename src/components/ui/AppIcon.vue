<script setup>
import { computed } from 'vue'
import {
  ArrowLeft, ArrowRight, Ban, Bell, Bird, Check, Cherry, CircleCheck, CircleDot, CircleHelp, Citrus, Clock,
  Coins, Construction, Copy, Crown, Dices, Flame, Gamepad2, Gem, Gift, Info, Landmark, LayoutDashboard, Link,
  Lock, Mail, Medal, Menu, PartyPopper, Play, RefreshCw, ScrollText, Search, Share2, ShieldCheck, Spade,
  Sparkles, Star, Target, TrendingUp, TriangleAlert, Trophy, UserPlus, Users, Wallet, X, Zap, Banknote, Hand
} from 'lucide-vue-next'

// One place that maps short icon names to Lucide SVG icons,
// so components can pass icons around as plain strings (e.g. <StatCard icon="wallet">).
const ICONS = {
  'arrow-left': ArrowLeft,
  'arrow-right': ArrowRight,
  ban: Ban,
  banknote: Banknote,
  bell: Bell,
  bird: Bird,
  check: Check,
  cherry: Cherry,
  'circle-check': CircleCheck,
  'circle-dot': CircleDot,
  clock: Clock,
  coins: Coins,
  construction: Construction,
  copy: Copy,
  crown: Crown,
  dices: Dices,
  flame: Flame,
  gamepad: Gamepad2,
  gem: Gem,
  gift: Gift,
  hand: Hand,
  help: CircleHelp,
  info: Info,
  landmark: Landmark,
  dashboard: LayoutDashboard,
  lemon: Citrus,
  link: Link,
  lock: Lock,
  mail: Mail,
  medal: Medal,
  menu: Menu,
  party: PartyPopper,
  play: Play,
  refresh: RefreshCw,
  scroll: ScrollText,
  search: Search,
  share: Share2,
  shield: ShieldCheck,
  spade: Spade,
  sparkles: Sparkles,
  star: Star,
  target: Target,
  trending: TrendingUp,
  warning: TriangleAlert,
  trophy: Trophy,
  'user-plus': UserPlus,
  users: Users,
  wallet: Wallet,
  x: X,
  zap: Zap
}

const props = defineProps({
  name: { type: String, required: true },
  size: { type: [Number, String], default: 20 },
  strokeWidth: { type: [Number, String], default: 2 }
})

const component = computed(() => ICONS[props.name] || Sparkles)
</script>

<template>
  <component :is="component" :size="size" :stroke-width="strokeWidth" class="app-icon" aria-hidden="true" />
</template>

<style scoped>
.app-icon {
  flex-shrink: 0;
  vertical-align: middle;
}
</style>
