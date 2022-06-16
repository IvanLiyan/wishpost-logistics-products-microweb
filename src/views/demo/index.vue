<template>
  <div>
    <wt-card title="Demo page title" subtitle="demo page subtitle">Demo page content1111</wt-card>
    <wt-select v-model="value" style="margin-right: 50px" label="国家1">
      <wt-option
        v-for="item in options1"
        :key="item.value"
        :label="item.label"
        :value="item.value"
        :disabled="item.disabled"
      />
    </wt-select>
    <wt-select multiple v-model="value2" style="margin-right: 50px" label="国家2">
      <wt-option
        v-for="item in options2"
        :key="item.value"
        :label="item.label"
        :value="item.value"
        :disabled="item.disabled"
      />
    </wt-select>
    <wt-breadcrumb>
      <wt-breadcrumb-item tag="router-link" to="/">Home page</wt-breadcrumb-item>
      <wt-breadcrumb-item tag="router-link" to="/">First item</wt-breadcrumb-item>
      <wt-breadcrumb-item tag="router-link" to="/">Second item</wt-breadcrumb-item>
      <wt-breadcrumb-item>Third item</wt-breadcrumb-item>
    </wt-breadcrumb>
  </div>
</template>
<script>
import commonUrl from '@common/url';
import req from '@utils/request';
import URL from './url';
export default {
  name: 'demo',
  username: 'xiaohua',
  components: {},
  data() {
    return {
      options1: [
        {
          value: 'China',
          label: 'China',
        },
        {
          value: 'America',
          label: 'America',
        },
        {
          value: 'Japan',
          label: 'Japan',
          disabled: true,
        },
        {
          value: 'France',
          label: 'France',
        },
        {
          value: 'Russia',
          label: 'Russia',
        },
      ],
      options2: [
        {
          value: 'China',
          label: 'China',
        },
        {
          value: 'America',
          label: 'America',
        },
        {
          value: 'Japan',
          label: 'Japan',
          disabled: true,
        },
        {
          value: 'France',
          label: 'France',
        },
        {
          value: 'Russia',
          label: 'Russia',
        },
      ],
      value: '',
      value2: '',
      loading: false,
      pageData: {},
      activeName: '',
    };
  },
  computed: {},
  created: function () {
    this.getInitData();
  },
  methods: {
    /**
     * 获取用户信息
     */
    async getUserInfo() {
      try {
        await req(commonUrl.getUserData);
      } catch (err) {
        this.$wt.notify({
          type: 'error',
          message: err.message,
        });
      }
    },
    /**
     * 获取页面数据
     */
    getInitData: async function () {
      const params = {
        username: this.username,
      };
      try {
        const data = await req(URL.getData, params);
        this.pageData = data;
      } catch (err) {
        this.$wt.notify({
          type: 'error',
          message: err.message,
        });
      }
    },
  },
};
</script>
<style scoped>
.change-phone {
  width: 480px;
  margin-top: 48px;
  padding-bottom: 40px;
}
</style>
