<template>
  <div>
    <v-card class="mb-4">
      <v-card-text>
        <div class="search-row" style="max-width: 1200px">
          <wt-select
            width="240"
            :filterable="true"
            class="mr"
            v-model="search.countries"
            :label="i18n('Country')"
            multiple
          >
            <wt-option
              v-for="item in meta.countries"
              :key="item.iso2"
              :value="item.iso2"
              :label="getCountryText(item)"
            />
          </wt-select>
          <wt-select
            width="240"
            class="mr"
            v-model="search.parent_channels"
            :label="i18n('Channel')"
            :filterable="true"
            multiple
          >
            <wt-option
              v-for="item in meta.channels"
              :key="item.code"
              :value="item.code"
              :label="getChannelText(item)"
            />
          </wt-select>
          <div v-if="role == 'admin'">
            <wt-select
              width="240"
              class="mr"
              :filterable="true"
              v-model="search.logistic_channel"
              :label="i18n('实际渠道')"
            >
              <wt-option
                v-for="item in meta.channels"
                :key="item.code"
                :value="item.code"
                :label="getChannelText(item)"
              />
            </wt-select>
          </div>
          <wt-select width="240" class="mr" v-model="search.order_state" :label="i18n('订单状态')">
            <wt-option
              v-for="item in meta.order_states_categories"
              :key="item.name"
              :value="item.id"
              :label="item.name"
            />
          </wt-select>
          <div class="demo-container">
            <wt-date-picker
              width="275"
              class="mr"
              label="开始日期 ~ 结束日期"
              type="datetimerange"
              format="yyyy-MM-dd HH:mm"
              v-model="datePicker"
              :time-picker-options="{ format: 'HH:mm:ss' }"
            />
          </div>
          <wt-select width="240" class="mr" v-model="search.id_field_obj" :label="i18n('指定ID名称')">
            <wt-option
              v-for="item in meta.id_field_names"
              :key="item.field_name"
              :value="item.field_name"
              :label="item.name"
            />
          </wt-select>
          <wt-input v-model="search.id_value" :label="getFieldNames"></wt-input>
        </div>
        <v-row>
          <v-col>
            <wt-button type="primary" class="mr" @click="searchOrders(true)" :loading="loading">
              <div v-if="meta.archive_info.is_archive_env">{{ i18n('搜索档案') }}</div>
              <div v-else>{{ i18n('搜索') }}</div>
            </wt-button>
            <wt-button type="secondary" @click="exportOrders()" :loading="exporting">
              {{ i18n('导出') }}
            </wt-button>
          </v-col>
        </v-row>
      </v-card-text>
    </v-card>
    <v-alert
      dismissible
      dense
      color="primary"
      type="info"
      border="left"
      colored-border
      elevation="2"
      v-if="role == 'user'"
    >
      <h4>关于“申请取消订单”操作流程调整</h4>
      <div class="body-2">
        物流商回传第一条有效物流跟踪记录后，将关闭“取消订单”功能，在此之前商户可以申请取消物流订单。
      </div>
      <div class="body-2">
        如由于商户操作失误而需要在关闭功能后取消订单的，请自行与物流商沟通，并确保物流商不揽收包裹或在物流商出仓前退回，同时双方线下处理揽收费用。
      </div>
      <div class="body-2">
        如商户没有通知物流商，或物流商因操作失误将商户联系取消的包裹运出揽收仓，则WishPost正常收费，造成费用损失由物流商和商户沟通自行联系解决。
      </div>
    </v-alert>
    <v-alert
      dismissible
      dense
      color="primary"
      type="info"
      border="left"
      colored-border
      elevation="2"
      v-if="role == 'user'"
    >
      <div v-if="!meta.archive_info.is_archive_env">
        <h4>早于 {{ meta.archive_info.archive_date }} 的订单信息已被移至 Wish Archive 网站</h4>
        <div class="body-2">
          如需查询 {{ meta.archive_info.archive_date }} 之前的订单，请至
          <a href="https://archive.wishpost.cn">https://archive.wishpost.cn</a>
          获取数据。
        </div>
      </div>
      <div v-if="meta.archive_info.is_archive_env">
        <h4>此页面仅可查询早于 {{ meta.archive_info.archive_date }} 的订单信息</h4>
        <div class="body-2">
          如需查询 {{ meta.archive_info.archive_date }} 之后的订单，请至
          <a href="https://www.wishpost.cn">https://www.wishpost.cn</a>
          获取数据。
        </div>
      </div>
    </v-alert>
    <v-card class="mb-4">
      <v-card-text>
        <v-row>
          <v-col cols="12" v-if="show_group_tab">
            <v-tabs grow v-model="current_tab">
              <v-tab v-for="(group, index) in groups" @click="switchGroup(group.id)" :key="index">
                {{ group.name }}
              </v-tab>
            </v-tabs>
          </v-col>
          <v-col cols="12">
            <wt-button type="secondary" v-if="role == 'user'" class="mr-2" @click="batchDownloadOrderLabels(true)">
              {{ i18n('批量打印(本地语言)') }}
            </wt-button>
            <wt-button type="secondary" v-if="role == 'user'" class="mr-2" @click="batchDownloadOrderLabels(false)">
              {{ i18n('批量打印(英语)') }}
            </wt-button>
            <span v-if="role == 'user'">
              {{ i18n('*打印尺寸: 10*10') }}
            </span>
            <wt-button v-if="role == 'admin'" type="secondary" class="mr-2" @click="openCancelModal()">
              {{ i18n('批量取消') }}
            </wt-button>
          </v-col>
          <v-col cols="12">
            <v-data-table
              v-model="selected_orders"
              :headers="headers"
              :items="orders"
              item-key="order_id"
              :loading="loading"
              :loading-text="i18n('Loading... Please wait')"
              :options.sync="options"
              :server-items-length="total_order"
              locale="zh"
              show-select
              disable-sort
              :footer-props="{
                prevIcon: 'keyboard_arrow_left',
                nextIcon: 'keyboard_arrow_right',
                itemsPerPageText: i18n('Rows per page'),
                itemsPerPageOptions: [50, 80, 100],
              }"
            >
              <template v-slot:item.refund_guarantee="{ item }">
                <v-tooltip bottom>
                  <template v-slot:activator="{ on, attrs }">
                    <v-icon v-if="item.is_refund_guarantee" style="color: #ef8d2e" dense v-bind="attrs" v-on="on">
                      mdi-check-decagram
                    </v-icon>
                  </template>
                  <span>A+ 物流退款保障计划</span>
                </v-tooltip>
              </template>
              <template v-slot:item.order_state="{ item }">
                <v-alert class="mb-0 state-dense" :color="getStateTextColor(item)" text dense>
                  {{ item.order_state }}
                </v-alert>
              </template>
              <template v-slot:item.order_state_info="{ item }">
                <v-tooltip bottom v-if="item.invalid_reason_msg || !item.can_cancel">
                  <template v-slot:activator="{ on, attrs }">
                    <v-icon v-if="item.invalid_reason_msg || !item.can_cancel" dense v-bind="attrs" v-on="on" small>
                      mdi-help-circle
                    </v-icon>
                  </template>
                  <span>{{ item.invalid_reason_msg }}</span>
                  <span v-if="!item.can_cancel">无法取消，因为：{{ item.cant_cancel_reason }}</span>
                </v-tooltip>
              </template>
              <template v-slot:item.action="{ item }">
                <a :href="getOrderLink(item)" target="_blank" class="text-decoration-none">
                  <v-icon small>mdi-eye</v-icon>
                </a>
                <v-icon
                  v-if="item.can_cancel && !meta.archive_info.is_archive_env"
                  @click="openCancelModal(item.order_id)"
                  small
                >
                  mdi-close-circle
                </v-icon>
                <a
                  v-if="role == 'user' && item.is_accepted && !item.is_abnormal && !meta.archive_info.is_archive_env"
                  :href="'/label?order_ids[]=' + item.order_id + '&format=10&inline=true'"
                  target="_blank"
                  class="text-decoration-none"
                >
                  <v-icon small>mdi-download</v-icon>
                </a>
                <v-icon
                  v-if="item.is_collection_option_pending_order"
                  @click="openPickupServiceModal(item.wish_standard_tracking_id)"
                  small
                >
                  mdi-dump-truck
                </v-icon>
              </template>
            </v-data-table>
          </v-col>
        </v-row>
      </v-card-text>
    </v-card>
    <updatePickupService :show="show_pickup_dialog" :wosp_id="pickup_wosp_id"></updatePickupService>
    <wt-dialog v-model="show_cancel_dialog" max-width="560" title="取消订单">
      <v-card>
        <v-card-text>
          <div v-if="selected_orders.length" class="mt-2 mb-4">将要取消{{ selected_orders.length }}单</div>
          <wt-select
            width="240"
            v-model="cancel_reason_obj.category"
            :label="i18n('取消类别')"
            @change="updateCancelOrderCategory"
          >
            <wt-option v-for="item in meta.cancel_category_list" :key="item.id" :value="item.id" :label="item.name" />
          </wt-select>
          <wt-select
            width="240"
            v-if="cancel_reason_obj.category != meta.cancel_category_customized_id"
            v-model="cancel_reason_obj.reason"
            valueKey="code"
            :label="i18n('具体原因')"
            @change="show"
          >
            <wt-option v-for="item in meta.cancel_reason_list" :key="item.code" :value="item" :label="item.name" />
          </wt-select>
          <wt-input
            v-if="cancel_reason_obj.category == meta.cancel_category_customized_id"
            v-model="cancel_reason_obj.customized_reason"
            type="textarea"
            :label="i18n('取消原因')"
            :placeholder="i18n('必填，不超过200个字符')"
          />
        </v-card-text>
      </v-card>
      <div slot="footer">
        <wt-button type="primary" @click="cancelOrder" :loading="cancel_loading">{{ i18n('确认取消') }}</wt-button>
        <wt-button type="secondary" @click="close" style="margin-left: 8px">{{ i18n('Cancel') }}</wt-button>
      </div>
    </wt-dialog>
  </div>
</template>
<script>
import req from '@utils/request';
import URL from './url';
import { getOrderStateGroup } from './meta';
import updatePickupService from './updatePickupService';
export default {
  name: 'orderList',
  components: { updatePickupService },
  props: {
    role: { type: String, default: 'user' },
    tab: { type: String, default: null },
  },
  data: function () {
    return {
      menu: {
        start: null,
        end: null,
      },
      groups: [
        { id: getOrderStateGroup().AWAITING_DISPATCH, name: '待发货' },
        { id: getOrderStateGroup().IN_TRANSMISSION, name: '运输中' },
        { id: getOrderStateGroup().DELIVERED, name: '已妥投' },
      ],
      datePicker: [],
      current_group: getOrderStateGroup().AWAITING_DISPATCH,
      selected_orders: [],
      show_cancel_dialog: false,
      show_pickup_dialog: false,
      pickup_wosp_id: null,
      search: {
        start_date: null,
        end_date: null,
        parent_channels: null,
        logistic_channel: null,
        countries: null,
        status: null,
        id_field_obj: null,
        id_value: null,
        order_state: null,
      },
      loading: false,
      exporting: false,
      check_export_interval: null,
      meta: {
        export_columns: [],
        countries: [],
        channels: [],
        order_states: [],
        id_field_names: [
          { field_name: 'tracking_id', name: this.i18n('Tracking Number') },
          { field_name: 'wish_standard_tracking_id', name: this.i18n('WishPost Order ID') },
          { field_name: 'wish_transaction_id', name: this.i18n('Wish Order ID') },
        ],
        cancel_category_list: [],
        cancel_reason_list: [],
        cancel_category_customized_id: -9999999,
        // whether this is an archive page and the date for archive
        archive_info: {
          is_archive_env: false,
          archive_date: null,
        },
      },
      headers: [],
      options: {
        page: 1,
        itemsPerPage: 50,
      },
      cancel_loading: false,
      total_order: 0,
      all_orders: [],
      orders: [],
      cancel_reason_obj: {
        order_id: '',
        category: null,
        reason: {},
        customized_reason: null,
      },
      show_group_tab: false,
    };
  },
  computed: {
    getFieldNames() {
      let result = '';
      if (this.search.id_field_obj) {
        switch (this.search.id_field_obj) {
          case 'tracking_id':
            result = this.i18n('Tracking Number');
            break;
          case 'wish_standard_tracking_id':
            result = this.i18n('WishPost Order ID');
            break;
          case 'wish_transaction_id':
            result = this.i18n('Wish Order ID');
            break;
          case 'user_id':
            result = this.i18n('User ID');
            break;
          case 'username':
            result = this.i18n('Username');
            break;
          default:
            result = '';
            break;
        }
        return result;
      } else {
        return result;
      }
    },
  },
  watch: {
    options: {
      handler() {
        this.searchOrders();
      },
      deep: true,
    },
  },
  mounted() {
    this.headers = [
      { text: this.i18n('WOSP Order ID'), value: 'wish_standard_tracking_id' },
      { text: '', value: 'refund_guarantee' },
      { text: this.i18n('Tracking ID'), value: 'tracking_id' },
      { text: this.i18n('物流状态'), value: 'tracking_status', width: '120' },
      { text: this.i18n('状态'), value: 'order_state', width: '80' },
      { text: '', value: 'order_state_info' },
      { text: this.i18n('渠道号'), value: 'parent_channel' },
    ];
    const admin_extra_elements = [];
    if (this.role == 'admin') {
      admin_extra_elements.push({ text: this.i18n('实际渠道'), value: 'channel' });
      this.meta.id_field_names.push({ field_name: 'user_id', name: this.i18n('User ID') });
      this.meta.id_field_names.push({ field_name: 'username', name: this.i18n('Username') });
    }
    this.headers = this.headers.concat(admin_extra_elements, [
      { text: this.i18n('收件人'), value: 'receiver_name' },
      { text: this.i18n('创建时间'), value: 'created_time', width: '120' },
      { text: this.i18n('Action'), value: 'action', width: '100' },
    ]);
    this.datePicker.push(this.$moment().add(-1, 'hours').toDate());
    this.datePicker.push(this.$moment().toDate());
    this.search.id_field_obj = this.meta.id_field_names[0].field_name;
    this.getMeta();
    if (this.tab == 'in_progress') {
      this.current_group = getOrderStateGroup().IN_PROGRESS;
      this.current_tab = 3; // v-tab index starts from 0.
      this.searchOrders();
    }
  },
  methods: {
    show() {},
    getOrderLink(item) {
      const path = this.role == 'user' ? '/home/#/user/order/' : '/order-information?order_id=';
      return path + item.order_id;
    },
    getCountryText: item => `${item.country_name_cn}/${item.country_name_en} (${item.iso3}/${item.iso2})`,
    getChannelText: item => `${item.local_name} - ${item.code}`,
    getStateTextColor(item) {
      let color = 'blue';
      if (item.is_failed) {
        color = 'red';
      } else if (item.is_accepted) {
        color = 'green';
      }
      return `${color}`;
    },
    async exportOrders() {
      const params = this.getParams();
      params.columns = JSON.stringify(this.meta.export_columns);
      this.exporting = true;
      // this.api.exportOrders(params).then(
      //   res => {
      //     const key = res.data.key;
      //     let time_remaining = 180; // 180s.
      //     this.check_export_interval = setInterval(
      //       function () {
      //         time_remaining -= 5;
      //         this.api.checkExportOrderStatus({ key: key }).then(res => {
      //           if (res.data.uploaded) {
      //             location.href = res.data.url;
      //             this.exporting = false;
      //             this.$wt.notify({
      //               type: 'error',
      //               message: this.i18n('导出成功'),
      //             });
      //             clearInterval(this.check_export_interval);
      //           } else if (time_remaining < 0) {
      //             clearInterval(this.check_export_interval);
      //             this.exporting = false;
      //             this.$wt.notify({
      //               type: 'error',
      //               message: this.i18n('下载失败请稍后再试'),
      //             });
      //           }
      //         });
      //       }.bind(this),
      //       5000,
      //     );
      //   },
      //   err => {
      //     this.$wt.notify({
      //       type: 'error',
      //       message: err.msg,
      //     });
      //   },
      // );
      try {
        const { data } = await req(URL.exportOrders, params);
        const key = data.key;
        let time_remaining = 180; // 180s.
        this.check_export_interval = setInterval(
          async function () {
            time_remaining -= 5;
            const { data } = await req(URL.checkExportOrderStatus, { key: key });
            if (data.uploaded) {
              location.href = data.url;
              this.exporting = false;
              this.$wt.notify({
                type: 'error',
                message: this.i18n('导出成功'),
              });
              clearInterval(this.check_export_interval);
            } else if (time_remaining < 0) {
              clearInterval(this.check_export_interval);
              this.exporting = false;
              this.$wt.notify({
                type: 'error',
                message: this.i18n('下载失败请稍后再试'),
              });
            }
          }.bind(this),
          5000,
        );
      } catch (err) {
        this.$wt.notify({
          type: 'error',
          message: err.msg,
        });
      }
    },
    getParams() {
      const { page, itemsPerPage } = this.options;
      const params = {};
      for (const key in this.search) {
        if (this.search[key] != null) {
          params[key] = this.search[key];
        }
      }
      params.start = (page - 1) * itemsPerPage;
      params.count = itemsPerPage;
      const format = 'YYYY-MM-DD HH:mm:ss';
      params.start_date = this.$moment(this.datePicker[0]).format(format);
      params.end_date = this.$moment(this.datePicker[1]).format(format);
      if (params.id_field_obj && params.id_value) {
        params[params.id_field_obj] = params.id_value;
      }
      params.id_field_obj = null;
      params.id_value = null;
      params.page = page;
      params.items_per_page = itemsPerPage;
      return params;
    },
    async searchOrders(reset_page) {
      this.loading = true;
      if (reset_page) {
        this.options.page = 1;
      }
      const params = this.getParams();
      // if this is not an archvie page, validate the start date is not earlier than archive date
      if (
        !this.meta.archive_info.is_archive_env &&
        this.$moment(params.start_date).isBefore(this.meta.archive_info.archive_date)
      ) {
        this.$wt.confirm({
          type: 'error',
          message: `该页面无法查询早于 ${this.meta.archive_info.archive_date} 的订单，请至 https://archive.wishpost.cn 查询！`,
          okButtonText: 'OK',
        });
        this.loading = false;
        return;
      }
      // this.api.searchOrders(params).then(
      //   res => {
      //     this.all_orders = res.data.results.rows;
      //     if (this.search.order_state == 'success') {
      //       this.switchGroup(this.current_group);
      //       this.show_group_tab = true;
      //     } else {
      //       this.orders = this.all_orders;
      //       this.show_group_tab = false;
      //     }
      //     this.total_order = res.data.results.num_results;
      //     this.loading = false;
      //   },
      //   err => {
      //     this.$wt.notify({
      //       type: 'error',
      //       message: err.msg,
      //     });
      //     this.loading = false;
      //   },
      // );
      try {
        const { data } = await req(URL.searchOrders, params);
        this.all_orders = data.results.rows;
        if (this.search.order_state == 'success') {
          this.switchGroup(this.current_group);
          this.show_group_tab = true;
        } else {
          this.orders = this.all_orders;
          this.show_group_tab = false;
        }
        this.total_order = data.results.num_results;
        this.loading = false;
      } catch (err) {
        this.$wt.notify({
          type: 'error',
          message: err.msg,
        });
        this.loading = false;
      }
    },
    resetCancelOrderModal() {
      this.cancel_reason_obj.order_id = null;
      this.cancel_reason_obj.category = null;
      this.cancel_reason_obj.reason = null;
      this.cancel_reason_obj.customized_reason = null;
    },
    updateCancelOrderCategory() {
      this.cancel_reason_obj.reason = null;
      this.meta.cancel_reason_list = this.meta.cancel_category_list.find(
        entry => entry.id == this.cancel_reason_obj.category,
      ).reasons;
    },
    close() {
      this.show_cancel_dialog = false;
    },
    async cancelOrder() {
      const is_batch = !this.cancel_reason_obj.order_id;
      const customized_reason = this.cancel_reason_obj.customized_reason;
      if (
        !this.cancel_reason_obj.category ||
        (this.cancel_reason_obj.category != this.meta.cancel_category_customized_id &&
          !this.cancel_reason_obj.reason) ||
        (this.cancel_reason_obj.category == this.meta.cancel_category_customized_id &&
          !this.cancel_reason_obj.customized_reason)
      ) {
        this.$wt.notify({
          type: 'error',
          message: this.i18n('请选择/填写取消原因'),
        });
        return;
      }
      const params = {
        invalid_reason: customized_reason ? customized_reason : this.cancel_reason_obj.reason.name,
        cancel_reason_code: this.cancel_reason_obj.reason ? this.cancel_reason_obj.reason.code : null,
      };
      let method;
      if (is_batch) {
        params['oids[]'] = this.selected_orders.map(entry => entry.order_id);
        method = 'batchInvalidateOrder';
      } else {
        params.oid = this.cancel_reason_obj.order_id;
        method = 'invalidateOrder';
      }
      this.cancel_loading = true;
      // this.api[method](params).then(
      //   () => {
      //     this.cancel_loading = false;
      //     this.$wt.notify({
      //       type: 'success',
      //       message: this.i18n('取消成功'),
      //     });
      //     this.searchOrders();
      //     this.show_cancel_dialog = false;
      //   },
      //   err => {
      //     this.cancel_loading = false;
      //     this.$wt.notify({
      //       type: 'error',
      //       message: err.msg,
      //     });
      //   },
      // );
      try {
        await req(URL[method], params);
        this.cancel_loading = false;
        this.$wt.notify({
          type: 'success',
          message: this.i18n('取消成功'),
        });
        this.searchOrders();
        this.show_cancel_dialog = false;
      } catch (err) {
        this.cancel_loading = false;
        this.$wt.notify({
          type: 'error',
          message: err.msg,
        });
      }
    },
    openCancelModal(order_id) {
      this.resetCancelOrderModal();
      this.cancel_reason_obj.order_id = order_id;
      this.show_cancel_dialog = true;
    },
    openPickupServiceModal(wosp_id) {
      this.pickup_wosp_id = wosp_id;
      // TODO: reset the show_pickup_dialog to false can awake the dialog again.
      this.show_pickup_dialog = false;
      this.show_pickup_dialog = true;
    },
    async getMeta() {
      // this.api.getOrdersMeta().then(res => {
      //   this.meta.countries = res.data.result.countries;
      //   this.meta.channels = res.data.result.channels;
      //   this.meta.order_states_categories = res.data.result.order_states_categories;
      //   this.meta.archive_info = res.data.result.archive_info;
      //   this.meta.export_columns = res.data.result.export_columns;
      // });
      try {
        const { data } = await req(URL.getOrdersMeta);
        this.meta.countries = data.result.countries;
        this.meta.channels = data.result.channels;
        this.meta.order_states_categories = data.result.order_states_categories;
        this.meta.archive_info = data.result.archive_info;
        this.meta.export_columns = data.result.export_columns;
      } catch (err) {
        this.$wt.notify({
          type: 'error',
          message: err.message,
        });
      }
      // this.api.getCancelOrderReasonCategoryList().then(res => {
      //   this.meta.cancel_category_list.push({
      //     id: null,
      //     name: this.i18n('请选择'),
      //   });
      //   this.meta.cancel_category_list = this.meta.cancel_category_list.concat(res.data);
      //   this.meta.cancel_category_list.push({
      //     id: this.meta.cancel_category_customized_id,
      //     name: this.i18n('以上都不是'),
      //   });
      // });
      try {
        const { data } = await req(URL.getCancelOrderReasonCategoryList);
        this.meta.cancel_category_list.push({
          id: null,
          name: this.i18n('请选择'),
        });
        this.meta.cancel_category_list = this.meta.cancel_category_list.concat(data);
        this.meta.cancel_category_list.push({
          id: this.meta.cancel_category_customized_id,
          name: this.i18n('以上都不是'),
        });
      } catch (err) {
        this.$wt.notify({
          type: 'error',
          message: err.message,
        });
      }
    },
    batchDownloadOrderLabels: function (is_local) {
      if (!this.selected_orders.length) {
        this.$wt.notify({
          type: 'error',
          message: this.i18n('请选择订单'),
        });
        return;
      }
      const url_param = '&order_ids[]=' + this.selected_orders.map(entry => entry.order_id).join('&order_ids[]=');
      window.open(`/label?format=10${is_local ? '&use_local=true' : ''}${url_param}`, '_blank');
    },
    switchGroup(group) {
      this.current_group = group;
      this.orders = this.all_orders.filter(entry => entry.group == group);
    },
  },
};
</script>
<style scoped lang="scss">
.state-dense {
  padding: 2px;
  font-size: 14px;
  display: flex;
  justify-content: center;
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
  .text-filed-wrapper {
    width: 250px;
  }
}
.mr {
  margin-right: 20px;
}
::v-deep .wt-select {
  .wt-select-search-field {
    font-size: 14px;
    font-weight: 400;
  }
  .wt-select-choice .wt-tag span {
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }
}
.wt-btn-primary {
  color: #fff !important;
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
::v-deep .wt-popper .wt-picker-panel-body-wrapper .wt-picker-confirm {
  .wt-btn-primary {
    color: #fff !important;
    .wt-btn-before {
      color: #fff;
    }
  }
}
</style>
