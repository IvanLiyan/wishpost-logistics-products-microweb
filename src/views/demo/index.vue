<template>
  <div>
    <wt-card title="Demo page title" subtitle="demo page subtitle">Demo page content</wt-card>
    <wt-button @click="openDefaultConfirm">默认样式</wt-button>
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
  data: () => ({
    loading: false,
    pageData: {},
    msg: '这是VNode节点这是VNode节点这是VNode节点,这是VNode节点这是VNode节点.',
  }),
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
    openDefaultConfirm() {
      this.$wt
        .confirm({
          title: '确认提交审核？',
          message: `<div>${this.msg}</div>`,
          useHTMLString: true,
          width: '430px',
          okButtonText: '确定',
          showCancelButton: true,
        })
        .catch(err => {
          console.log(err);
        });
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
