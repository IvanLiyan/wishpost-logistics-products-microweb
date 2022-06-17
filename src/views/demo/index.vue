<template>
  <div>
    <wt-card title="Demo page title" subtitle="demo page subtitle">Demo page content</wt-card>
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
