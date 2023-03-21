<template>
  <div>
    <r-button type="primary">antd react 按钮组件</r-button>
    <r-hello-react name="xiaohua"></r-hello-react>
  </div>
</template>
<script>
import { Button } from 'antd';
import commonUrl from '@common/url';
import req from '@utils/request';
import HelloReact from './helloReact.jsx';
import URL from './url';
export default {
  name: 'demo',
  username: 'xiaohua',
  components: { 'r-button': Button, 'r-hello-react': HelloReact },
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
