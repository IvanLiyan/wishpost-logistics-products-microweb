<template>
  <v-dialog v-model="captcha_dialog" max-width="500px">
    <v-card>
      <v-card-title>{{ i18n('Please input verification code') }}</v-card-title>
      <v-card-text>
        <v-row>
          <v-img :src="captcha_img" width="200px" @click="getNewCaptcha"></v-img>
        </v-row>
        <v-row>
          <v-col cols="12">
            <v-text-field :label="i18n('verification code*')" v-model="captcha_value" required></v-text-field>
          </v-col>
        </v-row>
      </v-card-text>
      <v-card-actions>
        <wt-button @click="submitCaptcha" :loading="submitLoading" style="margin-right: 15px">
          {{ i18n('Submit') }}
        </wt-button>
        <wt-button
          type="third"
          @click="
            captcha_dialog = false;
            captcha_value = '';
          "
        >
          {{ i18n('Cancel') }}
        </wt-button>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>
<script>
export default {
  name: 'captcha',
  data: () => ({
    captcha_dialog: false,
    submitLoading: false,
    captcha_img: '',
    captcha_value: '',
  }),
  methods: {
    submitCaptcha: async function () {
      this.submitLoading = true;
      try {
        const params = this.$parent.params;
        params['captcha'] = this.captcha_value;
        await this.$parent.submit(params);
        this.submitLoading = false;
      } catch (error) {
        console.log(error);
      }
    },
    getNewCaptcha: function () {
      const version = new Date().toString();
      this.captcha_img = '/get-new-captcha?version=' + version;
    },
  },
};
</script>
<style lang="scss" scoped>
.wt-btn-primary {
  color: #fff;
}
.wt-btn-secondary {
  color: #305bef;
}
</style>
