<template>
  <div class="user-page order-page">
    <v-container>
      <div class="h2 mb-4">{{ i18n('搜索订单') }}</div>
      <orderList role="admin"></orderList>
    </v-container>
  </div>
</template>
<script>
import orderList from './orderList';
export default {
  name: 'adminOrderList',
  components: { orderList },
};
</script>
<style scoped>
.order-page {
  padding: 24px;
}
</style>
