<template>
  <wt-dialog v-model="show" title="请完成您的头程选择">
    <v-form class="pickup_form">
      <v-row>
        <v-col cols="3">
          <wt-select v-model="collection_option_info.doorpickup" :label="i18n('揽收方式')">
            <wt-option v-for="item in pickup_method" :key="item.val" :value="item.val" :label="item.text" />
          </wt-select>
        </v-col>
      </v-row>
      <v-form v-show="collection_option_info.doorpickup == 1" style="min-width: 1030px">
        <v-row>
          <v-col cols="3">
            <wt-select v-model="collection_option_info.pickup_service" :label="i18n('揽收服务')">
              <wt-option v-for="item in pickup_service" :key="item.val" :value="item.val" :label="item.text" />
            </wt-select>
          </v-col>
        </v-row>
        <v-row>
          <v-col cols="3">
            <wt-input label="揽收人姓名" v-model="collection_option_info.pickup_address.pickup_from_local" />
          </v-col>
          <v-col cols="3">
            <wt-input label="揽收人电话" v-model="collection_option_info.pickup_address.pickup_phone" />
          </v-col>
          <v-col cols="3">
            <wt-input label="邮编" v-model="collection_option_info.pickup_address.pickup_zipcode" />
          </v-col>
          <v-col cols="3">
            <wt-input label="揽收地址" v-model="collection_option_info.pickup_address.pickup_address_local" />
          </v-col>
        </v-row>
        <v-row>
          <v-col cols="3">
            <wt-input label="省份" v-model="collection_option_info.pickup_address.pickup_province_local" />
          </v-col>
          <v-col cols="3">
            <wt-input label="城市" v-model="collection_option_info.pickup_address.pickup_city_local" />
          </v-col>
          <v-col cols="3">
            <wt-input label="区/县" v-model="collection_option_info.pickup_address.pickup_district_local" />
          </v-col>
        </v-row>
      </v-form>
      <v-row>
        <v-col cols="3">
          <wt-select v-model="collection_option_info.return_action_in_country" :label="i18n('退件处理方式')">
            <wt-option v-for="item in return_action_in_country" :key="item.val" :value="item.val" :label="item.text" />
          </wt-select>
        </v-col>
      </v-row>
      <v-form v-show="collection_option_info.return_action_in_country > 0">
        <v-row>
          <v-col cols="3">
            <wt-select v-model="collection_option_info.reverse_logistics_mode" :label="i18n('退回方式')">
              <wt-option v-for="item in reverse_logistics_mode" :key="item.val" :value="item.val" :label="item.text" />
            </wt-select>
          </v-col>
        </v-row>
        <v-form v-show="collection_option_info.return_action_in_country > 2" style="min-width: 1030px">
          <v-row class="section-header">退货地址信息</v-row>
          <v-row>
            <v-col cols="3">
              <wt-input label="退货收件人姓名" v-model="collection_option_info.return_address.return_name_local" />
            </v-col>
            <v-col cols="3">
              <wt-input label="退货收件人电话" v-model="collection_option_info.return_address.return_phone" />
            </v-col>
            <v-col cols="3">
              <wt-input label="退货收件人邮编" v-model="collection_option_info.return_address.return_zipcode" />
            </v-col>
            <v-col cols="3">
              <wt-input label="退货收件人地址" v-model="collection_option_info.return_address.return_address_local" />
            </v-col>
          </v-row>
          <v-row>
            <v-col cols="3">
              <wt-input label="退货收件人省份" v-model="collection_option_info.return_address.return_province_local" />
            </v-col>
            <v-col cols="3">
              <wt-input label="退货收件人城市" v-model="collection_option_info.return_address.return_city_local" />
            </v-col>
            <v-col cols="3">
              <wt-input label="退货收件人区/县" v-model="collection_option_info.return_address.return_district_local" />
            </v-col>
          </v-row>
        </v-form>
      </v-form>
    </v-form>
    <div slot="footer">
      <wt-button @click="submitPickupService" :loading="loading">确认</wt-button>
      <wt-button type="secondary" @click="show = false">取消</wt-button>
    </div>
  </wt-dialog>
</template>
<script>
import req from '@utils/request';
import URL from './url';
export default {
  name: 'updatePickupService',
  props: ['wosp_id', 'show'],
  data() {
    return {
      pickup_method: [
        { text: this.i18n('自寄'), val: 0 },
        { text: this.i18n('上门揽收'), val: 1 },
      ],
      pickup_service: [
        { text: this.i18n('燕文揽收'), val: '42-0' },
        { text: this.i18n('万色揽收'), val: '27-1' },
      ],
      return_action_in_country: [
        { text: this.i18n('销毁'), val: 0 },
        { text: this.i18n('退回揽收地址'), val: 2 },
        { text: this.i18n('退回退货地址'), val: 3 },
      ],
      reverse_logistics_mode: [
        { text: this.i18n('揽收商退回'), val: 1 },
        { text: this.i18n('快递预付退回'), val: 3 },
      ],
      rules: {
        required: value => !!value || 'Required',
      },
      collection_option_info: {
        access_token: null,
        wish_standard_tracking_id: this.wosp_id,
        doorpickup: null,
        pickup_service: null,
        pickup_address: {
          pickup_address_local: null,
          pickup_city_local: null,
          pickup_district_local: null,
          pickup_from_local: null,
          pickup_phone: null,
          pickup_province_local: null,
          pickup_zipcode: null,
        },
        return_action_in_country: null,
        reverse_logistics_mode: null,
        return_address: {
          return_address_local: null,
          return_city_local: null,
          return_district_local: null,
          return_name_local: null,
          return_phone: null,
          return_province_local: null,
          return_zipcode: null,
        },
      },
      loading: false,
    };
  },
  watch: {
    wosp_id: {
      immediate: true,
      handler: function (newVal) {
        this.collection_option_info.wish_standard_tracking_id = newVal;
      },
    },
    // TODO: parts below for remove unreasonable combinations, should move to function.
    'collection_option_info.doorpickup': function (newVal) {
      if (newVal == 0) {
        this.return_action_in_country = [
          { text: this.i18n('销毁'), val: 0 },
          { text: this.i18n('退回退货地址'), val: 3 },
        ];
      } else {
        this.return_action_in_country = [
          { text: this.i18n('销毁'), val: 0 },
          { text: this.i18n('退回揽收地址'), val: 2 },
          { text: this.i18n('退回退货地址'), val: 3 },
        ];
      }
      console.log(444, this.return_action_in_country);
    },
    'collection_option_info.return_action_in_country': function (newVal) {
      if (newVal == 3 && this.collection_option_info.doorpickup == 0) {
        this.reverse_logistics_mode.splice(0, 1);
      } else {
        if (this.reverse_logistics_mode.length === 1) {
          this.reverse_logistics_mode.splice(0, 0, { text: this.i18n('揽收商退回'), val: 1 });
        }
      }
    },
  },
  mounted() {
    this.getTempAccessToken();
  },
  methods: {
    async submitPickupService() {
      this.loading = true;
      // this.api.confirmCollectionOption(this.collection_option_info).then(
      //   () => {
      //     this.loading = false;
      //     this.$wt.notify({
      //       type: 'success',
      //       message: '更新揽收信息成功，页面将自动刷新',
      //     });
      //     window.location.reload();
      //   },
      //   err => {
      //     this.loading = false;
      //     this.$wt.notify({
      //       type: 'error',
      //       message: err.message,
      //     });
      //   },
      // );
      try {
        await req(URL.confirmCollectionOption, this.collection_option_info);
        this.loading = false;
        this.$wt.notify({
          type: 'success',
          message: '更新揽收信息成功，页面将自动刷新',
        });
        window.location.reload();
      } catch (err) {
        this.loading = false;
        this.$wt.notify({
          type: 'error',
          message: err.message,
        });
      }
    },
    async getTempAccessToken() {
      // this.api.getTempAccessToken().then(
      //   res => {
      //     this.collection_option_info.access_token = res.data.access_token;
      //   },
      //   err => {
      //     this.$wt.notify({
      //       type: 'error',
      //       message: err.message,
      //     });
      //   },
      // );
      try {
        const { data } = await req(URL.getTempAccessToken);
        this.collection_option_info.access_token = data.access_token;
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
<style scoped lang="scss">
.pickup_form {
  background: white;
  padding: 20px;
}
.section-header {
  font-size: 20px;
  line-height: 30px;
  font-weight: 500;
  margin: 10px 0;
}
.search-row {
  display: flex;
  flex-wrap: wrap;
  .search-left {
    display: flex;
    flex-wrap: wrap;
  }
  .search-right {
    flex: 1;
    display: flex;
    align-items: flex-start;
    padding-top: 10px;
  }
  .mr {
    margin-right: 20px;
  }
  .text-filed-wrapper {
    width: 250px;
  }
}
::v-deep .wt-select {
  .wt-select-search-field {
    font-size: 14px;
    font-weight: 400;
  }
}
.wt-btn-primary {
  color: #fff;
  .wt-btn-before {
    color: #fff;
  }
}
.wt-btn-secondary {
  color: #305bef;
}
.wt-btn-disabled {
  color: #bfcdd4;
  background: #305bef;
}
::v-deep .wt-select-tags {
  .wt-select-tags-ul {
    padding-left: 0;
    padding-right: 20px;
  }
}
::v-deep .wt-dialog {
  .wt-btn-primary {
    color: #fff !important;
    .wt-btn-content {
      color: #fff !important;
    }
  }
}
::v-deep .wt-input-box {
  margin-bottom: 30px;
  .wt-input-wrapper {
    &.wt-input-with-label {
      .wt-input-con {
        margin-top: -11px;
      }
    }
  }
}
::v-deep .v-input {
  .v-input__control {
    .v-input_slot {
      min-height: 36px !important;
    }
  }
}
</style>
