<template>
  <div class="user-page">
    <v-container fluid>
      <v-container>
        <captcha ref="captcha"></captcha>
        <div class="h2 mb-4">{{ i18n('物流咨询工具') }}</div>
        <wt-tooltip content="物流咨询工具" placement="top">
          <v-icon dense small>mdi-help-circle</v-icon>
        </wt-tooltip>
        <v-card>
          <v-container fluid style="padding: 16px">
            <v-form ref="form" v-model="valid">
              <div class="search-row">
                <wt-select class="mr" :filterable="true" v-model="selected_country" :placeholder="i18n('目的国')">
                  <wt-option v-for="item in countries" :key="item.text" :value="item.val" :label="item.text" />
                </wt-select>
                <wt-select class="mr" v-model="selected_sensitivity_type" :placeholder="i18n('商品属性')">
                  <wt-option v-for="item in sensitivityTypes" :key="item.text" :value="item.val" :label="item.text" />
                </wt-select>
                <span class="text-filed-wrapper" style="width: 260px">
                  <v-text-field
                    class="mr"
                    v-model="value"
                    :label="i18n('商品价值')"
                    :prefix="currency"
                    type="number"
                    min="0"
                    max="9999"
                    outlined
                    dense
                  ></v-text-field>
                </span>
                <span class="text-filed-wrapper">
                  <v-text-field
                    v-model="weight"
                    :label="i18n('商品重量')"
                    suffix="kg"
                    type="number"
                    min="0.001"
                    max="9999"
                    outlined
                    :rules="weight_rules"
                    hint="最多支持３位小数，如3.435"
                    dense
                  ></v-text-field>
                </span>
              </div>
              <div>
                <wt-button
                  class="search-btn"
                  type="primary"
                  :loading="searching"
                  :disabled="isDisabled"
                  @click="searchWospService"
                  style="margin-right: 20px"
                >
                  {{ i18n('Search') }}
                </wt-button>
                <wt-button class="clear-btn" type="secondary" @click="clearSearchFilter">
                  {{ i18n('Clear') }}
                </wt-button>
              </div>
            </v-form>
          </v-container>
        </v-card>
        <br />
        <v-card>
          <v-card-title>
            <div class="search-row">
              <div class="search-left">
                <wt-select
                  v-model="selected_carriers"
                  :placeholder="i18n('物流商')"
                  :label="i18n('物流商')"
                  multiple
                  :disabled="disableFilter"
                  class="mr"
                  :filterable="true"
                >
                  <wt-option v-for="item in carriers" :key="item.text" :value="item.val" :label="item.text" />
                </wt-select>
                <wt-select class="mr" :disabled="disableFilter" v-model="selected_register" :label="i18n('妥投政策')">
                  <wt-option v-for="item in register_policy" :key="item.text" :value="item.val" :label="item.text" />
                </wt-select>
                <wt-select class="mr" :disabled="disableFilter" v-model="selected_limit" :label="i18n('限量政策')">
                  <wt-option v-for="item in limit_policy" :key="item.text" :value="item.val" :label="item.text" />
                </wt-select>
                <wt-input class="mr" v-model="search_keyword" :label="i18n('Search')" :placeholder="i18n('Search')">
                  <wt-icon name="search" slot="suffix" />
                </wt-input>
              </div>
              <div class="search-right">
                <v-btn
                  :class="delivery_ttd_sort ? 'blue--text' : 'grey--text'"
                  class="mr"
                  rounded
                  small
                  :color="delivery_ttd_sort ? '#ECF8FD' : '#F9F9F9'"
                  @click="deliveryTtdSort"
                  :disabled="disableFilter"
                >
                  {{ i18n('时效快优先') }}
                </v-btn>
                <v-btn
                  :class="refund_rate_sort ? 'blue--text' : 'grey--text'"
                  class="mr"
                  rounded
                  small
                  :color="refund_rate_sort ? '#ECF8FD' : '#F9F9F9'"
                  @click="refundRateSort"
                  :disabled="disableFilter"
                >
                  {{ i18n('低退款率优先') }}
                </v-btn>
                <v-btn
                  :class="fee_sort ? 'blue--text' : 'grey--text'"
                  class="mr"
                  rounded
                  small
                  :color="fee_sort ? '#ECF8FD' : '#F9F9F9'"
                  @click="feeSort"
                  :disabled="disableFilter"
                >
                  {{ i18n('低价优先') }}
                </v-btn>
              </div>
            </div>
          </v-card-title>
          <v-data-table
            :headers="headers"
            :items="filteredChannels"
            :loading="searching"
            :loading-text="i18n('Loading... Please wait')"
            :search="search_keyword"
            multi-sort
            disable-sort
            locale="zh"
            :items-per-page="items_per_page"
            :footer-props="{
              prevIcon: 'keyboard_arrow_left',
              nextIcon: 'keyboard_arrow_right',
              itemsPerPageText: i18n('Rows per page'),
              itemsPerPageOptions: [20, 40, 60],
            }"
          >
            <template v-slot:item.fee="{ item }">
              <v-col>
                <v-row style="margin-top: 1px">
                  <span>{{ item.fee }}</span>
                  <!-- <template v-slot:activator="{ on, attrs }">
                    <wt-tooltip :content="item.message" placement="top">
                      <v-icon v-if="!item.success" dense v-bind="attrs" v-on="on" small>mdi-help-circle</v-icon>
                    </wt-tooltip>
                  </template> -->
                  <wt-tooltip :content="item.message" placement="top">
                    <v-icon v-if="!item.success" dense small style="vertical-align: -10%">mdi-help-circle</v-icon>
                  </wt-tooltip>
                </v-row>
              </v-col>
            </template>
            <template v-slot:item.local_name="{ item }">
              <v-col>
                <v-row style="margin-top: 1px">
                  <h3>{{ item.local_name }}</h3>
                  <v-chip
                    v-if="item.is_registered"
                    class="ma-2"
                    color="#D1EDAF"
                    text-color="#4E8B05"
                    style="bottom: 10px"
                    small
                  >
                    {{ i18n('妥投') }}
                  </v-chip>
                  <v-chip v-else class="ma-2" color="#FFE6EA" text-color="#A61C32" style="bottom: 10px" small>
                    {{ i18n('非妥投') }}
                  </v-chip>
                  <v-chip
                    v-if="item.is_limited"
                    class="ma-2"
                    color="#EF8D2E"
                    text-color="white"
                    style="bottom: 10px"
                    small
                  >
                    {{ i18n('限量') }}
                  </v-chip>
                </v-row>
                <v-row>
                  <span class="text-caption text-uppercase">
                    退款率
                    <b
                      :style="{
                        color: colors[item.refund_rate_in_90_rank - 1],
                      }"
                    >
                      {{ label[item.refund_rate_in_90_rank - 1] }}
                    </b>
                  </span>
                </v-row>
                <v-row style="margin-bottom: 2px">
                  <v-progress-linear
                    :value="item.refund_rate_in_90_rank * 10"
                    :color="colors[item.refund_rate_in_90_rank - 1]"
                    background-color="grey"
                    height="6"
                    buffer-value="50"
                  ></v-progress-linear>
                </v-row>
              </v-col>
            </template>
            <template v-slot:item.delivered_in_15_rate="{ item }">
              <v-row style="margin-top: 8px">
                <v-col>
                  {{ item.delivered_in_15_rate }}
                  <p style="font-size: 10px" color="#ddd">{{ i18n('15天') }}</p>
                </v-col>
                <v-col>
                  {{ item.delivered_in_30_rate }}
                  <p style="font-size: 10px" color="#ddd">{{ i18n('30天') }}</p>
                </v-col>
                <v-col>
                  {{ item.delivered_in_45_rate }}
                  <p style="font-size: 10px" color="#ddd">{{ i18n('45天') }}</p>
                </v-col>
                <v-col>
                  {{ item.delivered_in_60_rate }}
                  <p style="font-size: 10px" color="#ddd">{{ i18n('60天') }}</p>
                </v-col>
              </v-row>
            </template>
          </v-data-table>
        </v-card>
      </v-container>
    </v-container>
  </div>
</template>
<script>
import captcha from '@component/captcha';
import req from '@utils/request';
import URL from './url';
export default {
  name: 'advisorTool',
  components: { captcha },
  data() {
    return {
      valid: true,
      params: {},
      searching: false,
      refund_rate_sort: false,
      delivery_ttd_sort: false,
      fee_sort: false,
      colors: ['#018f12', '#fcd303', '#ff7300', '#ff0000', '#8f0101'],
      label: ['低', '偏低', '中', '偏高', '高'],
      search_keyword: '',
      countries: [],
      eu_countries: [],
      sensitivityTypes: [
        // {text: i18n("全选"), val: -1},
        { text: this.i18n('普货'), val: 0 },
        { text: this.i18n('带电'), val: 1 },
        { text: this.i18n('敏感货'), val: 2 },
      ],
      carriers: [],
      register_policy: [
        { text: this.i18n('默认'), val: null },
        { text: this.i18n('妥投'), val: true },
        { text: this.i18n('非妥投'), val: false },
      ],
      limit_policy: [
        { text: this.i18n('默认'), val: null },
        { text: this.i18n('限量'), val: true },
        { text: this.i18n('不限量'), val: false },
      ],
      user: null,
      selected_sensitivity_type: null,
      selected_country: null,
      selected_carriers: [],
      selected_register: null,
      selected_limit: null,
      weight: 0.1,
      value: 1.0,
      items_per_page: 20,
      channels: [],
      headers: [
        { text: this.i18n('渠道名称'), value: 'local_name' },
        { text: this.i18n('估算费用'), value: 'fee' },
        { text: this.i18n('API下单代码'), value: 'api_code' },
        { text: this.i18n('已妥投订单平均时效'), value: 'delivery_ttd' },
        { text: this.i18n('妥投率'), value: 'delivered_in_15_rate' },
      ],
      weight_rules: [
        v => {
          if (!v) {
            return '必填';
          }
          const v_str = v.toString();
          const dot_index = v_str.indexOf('.');
          if (dot_index != -1) {
            if (v_str.slice(dot_index + 1).length > 3) {
              return '最多支持三位小数';
            }
          }
          return true;
        },
      ],
    };
  },
  computed: {
    currency() {
      if (!this.selected_country) return '$';
      else if (this.selected_country == 'GBR') return '£';
      else if (this.eu_countries.includes(this.selected_country)) return '€';
      else return '$';
    },
    isDisabled() {
      return this.searching || !this.selected_country || this.selected_sensitivity_type === null;
    },
    disableFilter() {
      return this.channels.length == 0;
    },
    filteredChannels() {
      if (this.channels.length == 0) return [];
      let result = this.channels;
      if (this.selected_register != null) {
        result = result.filter(el => el.is_registered === this.selected_register);
        // eslint-disable-next-line
        _hmt.push([
          '_trackEvent',
          'advisor_tool',
          'register_selector',
          this.selected_register.toString(),
          this.user && this.user.id,
        ]);
      }
      if (this.selected_limit != null) {
        result = result.filter(el => el.is_limited === this.selected_limit);
        // eslint-disable-next-line
        _hmt.push([
          '_trackEvent',
          'advisor_tool',
          'limit_selector',
          this.selected_limit.toString(),
          this.user && this.user.id,
        ]);
      }
      if (this.selected_carriers.length != 0) {
        result = result.filter(el => this.selected_carriers.includes(el.carrier_code));
        // eslint-disable-next-line
        _hmt.push([
          '_trackEvent',
          'advisor_tool',
          'carrier_selector',
          this.selected_carriers.join(', '),
          this.user && this.user.id,
        ]);
      }
      return result;
    },
  },
  mounted() {
    this.init();
  },
  methods: {
    async init() {
      this.user = this.$store.state.user;
      try {
        const { data } = await req(URL.getCarriersAndCountries);
        const carriers = data.result.carrier,
          countries = data.result.country,
          eu_countries = data.result.eu_country;
        carriers.forEach(el => {
          this.carriers.push({
            text: el.carrier_name,
            val: el.carrier_code,
          });
        });
        countries.forEach(el => {
          this.countries.push({
            text: `${el.country_name_cn} (${el.country_name_en})`,
            val: el.iso3,
          });
        });
        this.eu_countries = eu_countries;
      } catch (err) {
        this.$wt.notify({
          type: 'error',
          message: err.msg,
        });
      }
    },
    getParams() {
      return {
        sensitivity_type: this.selected_sensitivity_type,
        country: this.selected_country,
        weight: this.weight,
        value: this.value,
      };
    },
    searchWospService() {
      this.$refs.form.validate();
      if (!this.valid) {
        return;
      }
      this.searching = true;
      this.channels = [];
      this.params = this.getParams();
      // eslint-disable-next-line
      _hmt.push([
        '_trackEvent',
        'advisor_tool',
        'search_criteria',
        JSON.stringify(this.params),
        this.user && this.user.id,
      ]);
      this.params['api_name'] = 'advisor-tool/wosp-service/search';
      if (this.user && this.user.is_admin) {
        this.submit(this.params);
      } else {
        this.$refs.captcha.captcha_dialog = true;
        this.$refs.captcha.captcha_value = '';
        const version = new Date().toString();
        this.$refs.captcha.captcha_img = '/get-new-captcha?version=' + version;
      }
    },
    async submit(params) {
      try {
        const { data } = await req(URL.searchWospService, params);
        this.searching = false;
        this.$refs.captcha.captcha_dialog = false;
        this.$refs.captcha.captcha_value = '';
        const result = data.result;
        result.forEach(el => {
          this.channels.push({
            local_name: el.local_name,
            api_code: el.api_code,
            refund_rate_in_90_rank: el.refund_rate_in_90_rank,
            is_registered: el.is_registered,
            is_limited: el.is_limited,
            carrier_code: el.carrier_code,
            ttd_50pct_in_90: el.ttd_50pct_in_90,
            ttd_90pct_in_90: el.ttd_90pct_in_90,
            fee: el.fee,
            success: el.success,
            message: el.message,
            delivery_ttd:
              el.ttd_50pct_in_90 && el.ttd_90pct_in_90
                ? parseInt(el.ttd_50pct_in_90) + '~' + parseInt(el.ttd_90pct_in_90) + '天'
                : '暂无数据',
            delivered_in_15_rate: el.delivered_in_15_rate ? (el.delivered_in_15_rate * 100).toFixed(2) + '%' : '--',
            delivered_in_30_rate: el.delivered_in_30_rate ? (el.delivered_in_30_rate * 100).toFixed(2) + '%' : '--',
            delivered_in_45_rate: el.delivered_in_45_rate ? (el.delivered_in_45_rate * 100).toFixed(2) + '%' : '--',
            delivered_in_60_rate: el.delivered_in_60_rate ? (el.delivered_in_60_rate * 100).toFixed(2) + '%' : '--',
          });
        });
        this.channels.sort(function (a, b) {
          if (a.delivered_in_30_rate == '--') return 1;
          if (b.delivered_in_30_rate == '--') return -1;
          return parseFloat(b.delivered_in_30_rate) - parseFloat(a.delivered_in_30_rate);
        });
      } catch (err) {
        this.searching = false;
        this.$wt.notify({
          type: 'error',
          message: this.i18n(err.message),
        });
      }
    },
    clearSearchFilter() {
      this.selected_country = null;
      this.selected_sensitivity_type = null;
      this.channels = [];
    },
    deliveryTtdSort() {
      this.refund_rate_sort = false;
      this.fee_sort = false;
      this.delivery_ttd_sort = true;
      this.channels.sort(function (a, b) {
        if (!a.ttd_50pct_in_90 || !a.ttd_90pct_in_90) return 1;
        if (!b.ttd_50pct_in_90 || !b.ttd_90pct_in_90) return -1;
        return a.ttd_50pct_in_90 + a.ttd_90pct_in_90 - (b.ttd_50pct_in_90 + b.ttd_90pct_in_90);
      });
      // eslint-disable-next-line
      _hmt.push(['_trackEvent', 'advisor_tool', 'ttd_sort', 'opt_value', this.user && this.user.id]);
    },
    refundRateSort() {
      this.delivery_ttd_sort = false;
      this.fee_sort = false;
      this.refund_rate_sort = true;
      this.channels.sort(function (a, b) {
        if (!a.refund_rate_in_90_rank) return 1;
        if (!b.refund_rate_in_90_rank) return -1;
        return a.refund_rate_in_90_rank - b.refund_rate_in_90_rank;
      });
      // eslint-disable-next-line
      _hmt.push(['_trackEvent', 'advisor_tool', 'refund_rate_sort', 'opt_value', this.user && this.user.id]);
    },
    feeSort() {
      this.refund_rate_sort = false;
      this.delivery_ttd_sort = false;
      this.fee_sort = true;
      this.channels.sort(function (a, b) {
        const a_fee = a.fee,
          b_fee = b.fee;
        if (a_fee == 'N/A') return 1;
        if (b_fee == 'N/A') return -1;
        return parseInt(a_fee.substr(0, a_fee.length - 4)) - parseInt(b_fee.substr(0, b_fee.length - 4));
      });
      // eslint-disable-next-line
      _hmt.push(['_trackEvent', 'advisor_tool', 'price_sort', 'opt_value', this.user && this.user.id]);
    },
  },
};
</script>
<style scoped lang="scss">
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
    width: 240px;
  }
}
::v-deep .wt-select {
  width: 240px;
  .wt-input-box {
    .wt-input-wrapper {
      border-radius: 4px;
      border-color: rgba(0, 0, 0, 0.38);
    }
  }
  .wt-select-search-field {
    font-size: 14px;
    font-weight: 400;
  }
}
.wt-btn-primary {
  color: #fff;
}
.wt-btn-secondary {
  color: #305bef;
}
.wt-btn-disabled {
  color: #bfcdd4;
}
::v-deep .wt-select-tags {
  .wt-select-tags-ul {
    padding-left: 0;
    padding-right: 20px;
  }
}
::v-deep .wt-input-box {
  margin-bottom: 30px;
  .wt-input-wrapper {
    min-width: 240px;
    border-radius: 4px;
    border-color: rgba(0, 0, 0, 0.38);
    &.wt-input-with-label {
      .wt-input-con {
        margin-top: -10px;
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
