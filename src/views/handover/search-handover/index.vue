<template>
  <v-container fluid class="page-content-layout">
    <div class="page-component-first-block">
      <table>
        <td class="breadcrumb-title-td">
          <label class="text-2xl mb-6 breadcrumb-title">
            {{ i18n('交接管理') }}
          </label>
        </td>
        <td class="breadcrumb-cell-td">
          <div width="1" class="vertical-line" />
        </td>
        <td class="breadcrumb-cell-td">
          <v-breadcrumbs :items="getBreadcrumbItems()" class="pa-0">
            <template v-slot:divider>
              <v-icon>mdi-chevron-right</v-icon>
            </template>
          </v-breadcrumbs>
        </td>
      </table>
    </div>
    <v-card class="page-component-block">
      <v-tabs v-model="tab" background-color="primary" dark>
        <v-tab href="#bag">{{ i18n('Bag') }}</v-tab>
        <v-tab href="#delivery_note">{{ i18n('Delivery Note') }}</v-tab>
      </v-tabs>
      <v-tabs-items v-model="tab">
        <v-tab-item :key="1" value="bag">
          <v-container fluid>
            <v-form class="padding-top-10">
              <wt-row :gutter="20" type="flex" style="min-height: 150px">
                <wt-col span="4" style="min-width: 260px">
                  <wt-select
                    width="100%"
                    :disabled="disableFilter"
                    v-model="selected_id_type"
                    :label="i18n('选择查询单号-可选')"
                    :placeholder="i18n('可选')"
                  >
                    <wt-option
                      v-for="item in id_types"
                      :key="item.id_type_code"
                      :value="item.id_type_code"
                      :label="item.id_type_name"
                    />
                  </wt-select>
                  <wt-input
                    width="238"
                    type="textarea"
                    :label="i18n('填写单号')"
                    placeholder="回车分隔，最多200个"
                    :disabled="selected_id_type == 0 || selected_id_type == null"
                    v-model="bag_id_numbers"
                  />
                </wt-col>
                <wt-col span="20" style="max-width: 900px">
                  <div class="search-row">
                    <wt-select
                      class="mr"
                      :disabled="disableFilter"
                      v-model="selected_bag_type"
                      :label="i18n('大包种类-必选')"
                      @change="initParamsByBagtype"
                    >
                      <wt-option
                        v-for="item in bag_types"
                        :key="item.bag_type_name"
                        :value="item.bag_type_code"
                        :label="item.bag_type_name"
                      />
                    </wt-select>
                    <wt-select
                      class="mr"
                      v-model="selected_upstream"
                      :label="i18n('选择打包方-可选')"
                      :placeholder="i18n('可选')"
                    >
                      <wt-option v-for="item in upstreams" :key="item.name" :value="item.code" :label="item.name" />
                    </wt-select>
                    <wt-select
                      class="mr"
                      v-model="selected_downstream"
                      :label="i18n('选择揽收方-可选')"
                      :placeholder="i18n('可选')"
                    >
                      <wt-option v-for="item in downstreams" :key="item.code" :value="item.code" :label="item.name" />
                    </wt-select>
                    <wt-select
                      class="mr"
                      v-model="selected_bag_state"
                      :label="i18n('大包状态-可选')"
                      :placeholder="i18n('可选')"
                    >
                      <wt-option
                        v-for="item in bag_states"
                        :key="item.state_code"
                        :value="item.state_code"
                        :label="item.state_name"
                      />
                    </wt-select>
                    <wt-date-picker
                      class="mr"
                      width="238"
                      type="date"
                      @input="show_start_tpicker = false"
                      label="大包创建开始日期-必填 00:00:00"
                      v-model="start_date"
                    />
                    <wt-date-picker
                      class="mr"
                      width="238"
                      type="date"
                      @input="show_end_tpicker = false"
                      label="大包创建结束日期-必填 23:59:59"
                      v-model="end_date"
                    />
                  </div>
                </wt-col>
              </wt-row>
              <wt-row :gutter="20" type="flex">
                <wt-col span="12">
                  <wt-button
                    class="search-btn"
                    type="primary"
                    :loading="searchingBags"
                    :disabled="searchingBags"
                    @click="getBags"
                    style="margin-right: 20px"
                  >
                    {{ i18n('Search') }}
                  </wt-button>
                  <wt-button class="clear-btn" type="secondary" @click="clearSearchFilter">
                    {{ i18n('Clear') }}
                  </wt-button>
                </wt-col>
                <wt-col span="12" style="display: flex; justify-content: flex-end">
                  <wt-button class="search-btn" @click="batchDownload">
                    {{ i18n('批量下载') }}
                  </wt-button>
                </wt-col>
              </wt-row>
            </v-form>
          </v-container>
          <v-divider></v-divider>
          <v-container fluid>
            <p class="h3 font-weight-black search-p">
              {{ i18n('查询结果') }}
            </p>
            <wt-table
              :data="bagTableData"
              :emptyText="i18n('No data available')"
              :loading="searchingBags"
              :loadingMessage="i18n('Loading...')"
              :pagination="bags.length > 0 ? bagsPagination : false"
            >
              <wt-table-column prop="bag_number" :label="i18n('大包号')" />
              <wt-table-column prop="state_name" :label="i18n('大包状态')" />
              <wt-table-column prop="ref_bag_number" :label="i18n('ref大包号')" />
              <wt-table-column prop="handover_serial_number" :label="i18n('交接单号')" />
              <wt-table-column prop="declared_weight" :label="i18n('出库重量(KG)')" width="100" />
              <wt-table-column :label="i18n('入库重量(KG)')" width="100">
                <template slot-scope="scope">
                  <div v-if="scope.row.actual_weight_modified == true" style="color: #ef8d2e">
                    <span title="This value has been modified.">&#9888;</span>
                    {{ scope.row.actual_weight }}
                  </div>
                  <div v-else>
                    {{ scope.row.actual_weight }}
                  </div>
                </template>
              </wt-table-column>
              <wt-table-column prop="upstream_name" :label="i18n('创建方')" />
              <wt-table-column prop="downstream_name" :label="i18n('揽收方')" />
              <wt-table-column prop="created_time" :label="i18n('创建时间')" />
              <wt-table-column prop="handover_time" :label="i18n('交接时间')" />
              <wt-table-column prop="handover_ack_time" :label="i18n('入库时间')" />
              <wt-table-column :label="i18n('操作')" width="140">
                <template slot-scope="scope">
                  <wt-button style="margin: 10px" @click="showOrdersDetail(scope.row)">
                    {{ i18n('订单详情') }}
                  </wt-button>
                  <wt-button
                    type="secondary"
                    style="margin: 10px"
                    :href="
                      '/api/v3/packing_bag/download_label?access_token=' +
                      access_token +
                      '&bag_numbers[]=' +
                      scope.row.bag_number
                    "
                  >
                    {{ i18n('面单') }}
                  </wt-button>
                </template>
              </wt-table-column>
            </wt-table>
            <wt-dialog v-model="show_orders_detail_dialog" :title="i18n('大包订单信息')" :closable="true">
              <div>
                <v-list class="transparent">
                  <v-list-item two-line>
                    <v-list-item-title class="col-3 headline">
                      {{ i18n('包含') }}
                    </v-list-item-title>
                    <v-list-item-title class="col-6 headline">
                      {{ i18n('%1$s个订单', selected_bag.item_count) }}
                    </v-list-item-title>
                  </v-list-item>
                </v-list>
                <v-list class="transparent">
                  <v-list-item>
                    <v-list-item-subtitle class="col-3">
                      {{ i18n('订单号') }}
                    </v-list-item-subtitle>
                    <v-list-item-title class="col-10">
                      <ul id="orders">
                        <li class="li-style" v-for="(item, index) in selected_bag.logistics_order_codes" :key="index">
                          {{ item }}
                        </li>
                      </ul>
                    </v-list-item-title>
                  </v-list-item>
                </v-list>
              </div>
              <div slot="footer" class="demo-modal-footer">
                <wt-button @click="show_orders_detail_dialog = false">{{ i18n('close') }}</wt-button>
              </div>
            </wt-dialog>
          </v-container>
        </v-tab-item>
        <v-tab-item :key="2" value="delivery_note">
          <v-container fluid>
            <v-form class="padding-top-10">
              <wt-row :gutter="20" type="flex">
                <wt-col span="8" style="display: flex; flex-direction: column; min-width: 250px">
                  <wt-input :label="i18n('wish大包号')" v-model="dn_bag_number" class="mr">
                    <wt-icon name="search" slot="suffix" />
                  </wt-input>
                </wt-col>
                <wt-col span="8" style="display: flex-end; flex-direction: column; min-width: 250px">
                  <wt-input :label="i18n('wish交接单号')" v-model="dn_number" class="mr">
                    <wt-icon name="search" slot="suffix" />
                  </wt-input>
                </wt-col>
              </wt-row>
              <wt-row :gutter="20" type="flex">
                <wt-col span="12">
                  <div style="display: flex">
                    <wt-button
                      class="search-btn"
                      type="primary"
                      :loading="searchingDeliveryNotes"
                      :disabled="searchingDeliveryNotes"
                      @click="getDeliveryNotes"
                      style="margin-right: 20px"
                    >
                      {{ i18n('Search') }}
                    </wt-button>
                    <wt-button class="clear-btn" type="secondary" @click="clearSearchFilter">
                      {{ i18n('Clear') }}
                    </wt-button>
                  </div>
                </wt-col>
                <wt-col span="12" style="display: flex; justify-content: flex-end">
                  <div style="width: 100%; display: flex; justify-content: flex-end">
                    <wt-button class="search-btn" @click="batchDownload" :loading="downloading" :disabled="downloading">
                      {{ i18n('批量下载') }}
                    </wt-button>
                  </div>
                </wt-col>
              </wt-row>
            </v-form>
          </v-container>
          <v-divider></v-divider>
          <v-container fluid>
            <p class="h3 font-weight-black search-p">
              {{ i18n('查询结果') }}
            </p>
            <wt-table
              :data="deliveryNoteData"
              :emptyText="i18n('No data available')"
              :loading="searchingDeliveryNotes"
              :loadingMessage="i18n('Loading...')"
              :pagination="delivery_notes.length > 0 ? deliveryNotePagination : false"
            >
              <wt-table-column prop="delivery_note_number" :label="i18n('交接单号')" />
              <wt-table-column prop="state" :label="i18n('交接单状态')" />
              <wt-table-column prop="upstream_name" :label="i18n('创建方')" />
              <wt-table-column prop="downstream_name" :label="i18n('揽收方')" />
              <wt-table-column prop="bag_count" :label="i18n('包含大包')" />
              <wt-table-column prop="order_count" :label="i18n('包含订单')" />
              <wt-table-column prop="actual_bag_count" :label="i18n('实际大包数量')" />
              <wt-table-column prop="created_ts" :label="i18n('创建时间')" />
              <wt-table-column prop="handover_ts" :label="i18n('交接时间')" />
              <wt-table-column prop="action" :label="i18n('操作')" width="140">
                <template slot-scope="scope">
                  <wt-button style="margin: 10px" @click="showBagsDetail(scope.row)">
                    {{ i18n('大包详情') }}
                  </wt-button>
                  <wt-button
                    type="secondary"
                    style="margin: 10px"
                    :href="
                      '/api/v3/delivery_note/download_label?access_token=' +
                      access_token +
                      '&delivery_note_numbers[]=' +
                      scope.row.delivery_note_number
                    "
                  >
                    {{ i18n('下载面单') }}
                  </wt-button>
                </template>
              </wt-table-column>
            </wt-table>
            <wt-dialog v-model="show_bags_detail_dialog" :title="i18n('大包信息')" :closable="true">
              <div>
                <v-list class="transparent">
                  <v-list-item two-line>
                    <v-list-item-title class="col-3 headline">
                      {{ i18n('包含') }}
                    </v-list-item-title>
                    <v-list-item-title class="col-6 headline">
                      {{ i18n('%1$s个大包', selected_delivery_note.bag_count) }}
                    </v-list-item-title>
                  </v-list-item>
                </v-list>
                <v-list class="transparent">
                  <v-list-item>
                    <v-list-item-subtitle class="col-3">
                      {{ i18n('大包号') }}
                    </v-list-item-subtitle>
                    <v-list-item-title class="col-10">
                      <ul id="bags">
                        <li class="li-style" v-for="(item, index) in selected_delivery_note.bag_numbers" :key="index">
                          {{ item }}
                        </li>
                      </ul>
                    </v-list-item-title>
                  </v-list-item>
                </v-list>
              </div>
              <div slot="footer" class="demo-modal-footer">
                <wt-button @click="show_bags_detail_dialog = false">{{ i18n('close') }}</wt-button>
              </div>
            </wt-dialog>
          </v-container>
        </v-tab-item>
      </v-tabs-items>
    </v-card>
  </v-container>
</template>
<script>
import i18nMixin from '@utils/i18nMixin';
import req from '@utils/request';
import URL from '../url';
export default {
  name: 'adminHandoverInformation',
  // use i18nMixin for vue component template use i18n function without define
  mixins: [i18nMixin],
  data: function () {
    return {
      tab: null,
      tab_name: 'bag',
      selected_bag_type: null,
      selected_bag_state: null,
      selected_filter_time: { time_type_name: '', time_type_code: null },
      selected_id_type: null,
      selected_bag: { item_count: 0, wish_standard_tracking_ids: [] },
      selected_delivery_note_state: { state_name: '', state_code: null },
      selected_delivery_note: { order_count: 0, bag_count: 0, bag_numbers: [] },
      selected_upstream: null,
      selected_downstream: null,
      start_date: new Date().toISOString().substr(0, 10),
      end_date: new Date().toISOString().substr(0, 10),
      bag_id_numbers: null,
      dn_bag_number: null,
      dn_number: null,
      access_token: null,
      show_start_tpicker: false,
      show_end_tpicker: false,
      bag_types: [],
      bag_states: [{ state_code: null, state_name: i18n('默认') }],
      time_types: [{ time_type_name: i18n('大包创建时间'), time_type_code: 1 }],
      id_types: [
        { id_type_code: 0, id_type_name: i18n('默认不选') },
        { id_type_code: 1, id_type_name: i18n('wishpost订单号') },
        { id_type_code: 2, id_type_name: i18n('物流单号') },
        { id_type_code: 3, id_type_name: i18n('大包号') },
        { id_type_code: 4, id_type_name: i18n('交接单号') },
        { id_type_code: 5, id_type_name: i18n('物流商/仓库大包号') },
      ],
      upstreams: [{ name: '默认全部', code: null }],
      downstreams: [{ name: '默认全部', code: null }],
      delivery_note_states: [{ state_code: null, state_name: '默认' }],
      weight: null,
      bags: [],
      allBags: [],
      delivery_notes: [],
      allDeliveryNotes: [],
      searchingBags: false,
      searchingDeliveryNotes: false,
      downloading: false,
      search_keyword: '',
      show_orders_detail_dialog: false,
      show_bags_detail_dialog: false,
      bagsCurrentPage: 1,
      deliveryNoteCurrentPage: 1,
      delivery_note_headers: [
        { text: i18n('交接单号'), value: 'delivery_note_number' },
        { text: i18n('交接单状态'), value: 'state', width: '120' },
        { text: i18n('创建方'), value: 'upstream_name' },
        { text: i18n('揽收方'), value: 'downstream_name' },
        { text: i18n('包含大包'), value: 'bag_count' },
        { text: i18n('包含订单'), value: 'order_count' },
        { text: i18n('实际大包数量'), value: 'actual_bag_count' },
        { text: i18n('创建时间'), value: 'created_ts', width: '170' },
        { text: i18n('交接时间'), value: 'handover_ts', width: '170' },
        { text: i18n('操作'), value: 'action' },
      ],
      deliveryNotePagination: {
        total: 0,
        showTotal: true,
        showSizeChanger: true,
        currentPage: this.deliveryNoteCurrentPage,
        onChange: this.onDeliveryNotePageChange,
      },
      bagsPagination: {
        total: 0,
        showTotal: true,
        showSizeChanger: true,
        currentPage: this.bagsCurrentPage,
        onChange: this.onBagsPageChange,
      },
    };
  },
  computed: {
    wish_standard_tracking_ids: function () {
      if (this.selected_id_type == 1 && this.bag_id_numbers) return this.bag_id_numbers.split('\n');
      return [];
    },
    tracking_ids: function () {
      if (this.selected_id_type == 2 && this.bag_id_numbers) return this.bag_id_numbers.split('\n');
      return [];
    },
    bag_numbers: function () {
      if (this.selected_id_type == 3 && this.bag_id_numbers) return this.bag_id_numbers.split('\n');
      return [];
    },
    delivery_note_numbers: function () {
      if (this.selected_id_type == 4 && this.bag_id_numbers) return this.bag_id_numbers.split('\n');
      return [];
    },
    ref_bag_numbers: function () {
      if (this.selected_id_type == 5 && this.bag_id_numbers) return this.bag_id_numbers.split('\n');
      return [];
    },
    bagTableData() {
      if (this.bags.length > 0) {
        const data = this.bags.map(item => ({
          bag_number: item.bag_number,
          state_name: item.state_name,
          ref_bag_number: item.ref_bag_number,
          handover_serial_number: item.handover_serial_number,
          declared_weight: item.declared_weight,
          upstream_name: item.upstream_name,
          downstream_name: item.downstream_name,
          created_time: item.created_time,
          handover_time: item.handover_time,
          handover_ack_time: item.handover_ack_time,
          item_count: item.item_count,
          logistics_order_codes: item.logistics_order_codes,
        }));
        return data;
      } else {
        return [];
      }
    },
    deliveryNoteData() {
      if (this.delivery_notes.length > 0) {
        const data = this.delivery_notes.map(item => ({
          delivery_note_number: item.delivery_note_number,
          state: item.state,
          upstream_name: item.upstream_name,
          downstream_name: item.downstream_name,
          bag_count: item.bag_count,
          order_count: item.order_count,
          actual_bag_count: item.actual_bag_count,
          created_ts: item.created_ts,
          handover_ts: item.handover_ts,
          bag_numbers: item.bag_numbers,
        }));
        return data;
      } else {
        return [];
      }
    },
  },
  mounted: function () {
    this.initParams();
    this.getTempAccessToken();
  },
  methods: {
    getBreadcrumbItems: function () {
      return [
        {
          text: ci18n('The home button in the navigation bar of user dashboard', 'Home'),
          to: '/user/homepage',
        },
        {
          text: i18n('交接管理'),
          disabled: true,
          to: 'logistics/logistics-products/handover/search-handover',
        },
      ];
    },
    onBagsPageChange(current, size) {
      if (this.allBags.length > 0) {
        this.bagsPagination.total = this.allBags.length;
        const offset = (current - 1) * size;
        this.bags =
          offset + size >= this.allBags.length
            ? this.allBags.slice(offset, this.allBags.length)
            : this.allBags.slice(offset, offset + size);
      } else {
        this.bags = this.allBags;
      }
    },
    onDeliveryNotePageChange(current, size) {
      if (this.allDeliveryNotes.length > 0) {
        this.deliveryNotePagination.total = this.allDeliveryNotes.length;
        const offset = (current - 1) * size;
        this.delivery_notes =
          offset + size >= this.allDeliveryNotes.length
            ? this.allDeliveryNotes.slice(offset, this.allDeliveryNotes.length)
            : this.allDeliveryNotes.slice(offset, offset + size);
      } else {
        this.delivery_notes = this.allDeliveryNotes;
      }
    },
    async initParams() {
      try {
        const { data: resp_data } = await req(URL.getPackingBagSearchParams, {});
        this.bag_types = resp_data['bag_types'];
        this.bag_states = this.bag_states.concat(resp_data['bag_states']);
        this.delivery_note_states = this.delivery_note_states.concat(resp_data['delivery_note_states']);
        this.setDefaultParams();
        this.initParamsByBagtype();
      } catch (err) {
        this.$wt.notify({
          type: 'error',
          message: err.msg,
        });
      }
    },
    initLogisticsParams: function () {
      this.upstreams = [{ name: '默认全部', code: null }];
      this.downstreams = [{ name: '默认全部', code: null }];
      this.selected_upstream = this.upstreams[0].code;
      this.selected_downstream = this.downstreams[0].code;
      this.setDefaultLogisticsParams();
    },
    async initParamsByBagtype() {
      this.initLogisticsParams();
      const params = { bag_type: this.selected_bag_type };
      try {
        const { data: resp_data } = await req(URL.getBagTypeSearchParams, params);
        if (resp_data['upstreams']) this.upstreams = this.upstreams.concat(resp_data['upstreams']);
        if (resp_data['downstreams']) this.downstreams = this.downstreams.concat(resp_data['downstreams']);
        this.setDefaultLogisticsParams();
      } catch (err) {
        this.$wt.notify({
          type: 'error',
          message: err.msg,
        });
      }
    },
    setDefaultParams: function () {
      if (!this.selected_bag_type) {
        this.selected_bag_type = this.bag_types[0].bag_type_code;
      }
      if (!this.selected_bag_state) {
        this.selected_bag_state = this.bag_states[0].state_code;
      }
      if (!this.selected_delivery_note_state.state_code) {
        this.delivery_note_states = this.delivery_note_states[0];
      }
      if (!this.selected_filter_time.time_type_code) {
        this.selected_filter_time = this.time_types[0];
      }
    },
    setDefaultLogisticsParams: function () {
      if (!this.selected_upstream) {
        this.selected_upstream = this.upstreams[0].code;
      }
      if (!this.selected_downstream) {
        this.selected_downstream = this.downstreams[0].code;
      }
    },
    clearSearchFilter: function () {
      this.selected_bag_state = this.bag_states[0].state_code;
      this.selected_id_type = null;
      this.selected_upstream = this.upstreams[0].code;
      this.selected_downstream = this.downstreams[0].code;
      this.start_date = new Date().toISOString().substr(0, 10);
      this.end_date = new Date().toISOString().substr(0, 10);
      this.bag_id_number = null;
      this.dn_bag_number = null;
      this.dn_number = null;
      this.bag_id_numbers = null;
    },
    closeDialogs: function () {
      this.show_orders_detail_dialog = false;
      this.show_bags_detail_dialog = false;
    },
    showOrdersDetail: function (item) {
      this.show_orders_detail_dialog = true;
      this.selected_bag = item;
    },
    showBagsDetail: function (item) {
      this.show_bags_detail_dialog = true;
      this.selected_delivery_note = item;
    },
    getParams: function () {
      const params = {
        bag_type: this.selected_bag_type,
        bag_state: this.selected_bag_state,
        upstream: this.selected_upstream,
        downstream: this.selected_downstream,
        start_ts: this.start_date + ' 00:00:00',
        end_ts: this.end_date + ' 23:59:59',
        wish_standard_tracking_ids: this.wish_standard_tracking_ids,
        tracking_ids: this.tracking_ids,
        bag_numbers: this.bag_numbers,
        delivery_note_numbers: this.delivery_note_numbers,
        ref_bag_numbers: this.ref_bag_numbers,
      };
      return params;
    },
    async getBags() {
      this.searchingBags = true;
      const params = this.getParams();
      this.selected_bags = [];
      try {
        const { data } = await req(URL.getPackingBagSearch, params);
        this.allBags = data.results.rows;
        this.onBagsPageChange(1, 10);
        this.searchingBags = false;
      } catch (err) {
        this.searchingBags = false;
        this.$wt.notify({
          type: 'error',
          message: err.msg,
        });
      }
    },
    async getDeliveryNotes() {
      this.searchingDeliveryNotes = true;
      const params = {
        bag_number: this.dn_bag_number,
        delivery_note_number: this.dn_number,
      };
      try {
        const { data } = await req(URL.getDeliveryNoteSearch, params);
        this.allDeliveryNotes = data.results;
        this.onDeliveryNotePageChange(1, 10);
        this.searchingDeliveryNotes = false;
      } catch (err) {
        this.searchingDeliveryNotes = false;
        this.$wt.notify({
          type: 'error',
          message: err.msg,
        });
      }
    },
    batchDownload: function () {
      this.downloading = true;
      const params = this.getParams();
      let query = '?';
      for (const param in params) {
        if (params[param] != null) {
          query += '&' + param + '=' + encodeURIComponent(params[param]);
        }
      }
      window.location.href = '/bag_handover/batch_download/bags' + query;
      this.downloading = false;
    },
    async getTempAccessToken() {
      try {
        const { data } = await req(URL.getTempAccessToken);
        this.access_token = data.access_token;
      } catch (err) {
        this.$wt.notify({
          type: 'error',
          message: err.msg,
        });
      }
    },
  },
};
</script>
<style scoped lang="scss">
.user-page {
  min-height: 1000px;
}
.li-style {
  list-style-type: none;
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
    width: 240px;
  }
}
.search-p {
  margin-top: 20px !important;
  margin-bottom: 8px !important;
  padding-left: 10px;
}
.search-btn {
  width: 120px;
  height: 36px;
  border-radius: 4px;
}
.clear-btn {
  width: 120px;
  height: 36px;
  border-radius: 4px;
  color: rgba(47, 183, 236, 1);
}
.padding-0 {
  padding-right: 0;
  padding-left: 0;
}
.padding-left-0 {
  padding-left: 0;
}
.padding-right-0 {
  padding-right: 0;
}
.padding-top-10 {
  padding-top: 10px;
}
.address-input > .v-input__control > .v-input__slot {
  min-height: 38px !important;
}
/* override original vuetify css style */
.v-application .ma-12 {
  margin-top: 20px !important;
}
.v-data-table td {
  font-size: 14px;
}
.v-list-item {
  align-items: flex-start;
}
.v-list-item .v-list-item__title,
.v-list-item .v-list-item__subtitle {
  padding-top: 0px !important;
  padding-bottom: 0px !important;
}
.component-page {
  min-height: 800px;
}
::v-deep .wt-loading-message {
  color: #3f5663;
}
::v-deep .wt-select {
  width: 240px;
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
.page-content-layout {
  padding: 24px 32px;
  background-color: #f7f9fa;
}
.vertical-line {
  height: 24px;
  width: 1px;
  border: 1px solid #bfcdd4;
  border-radius: 0px;
}
.breadcrumb-cell-td {
  padding-left: 6px;
  padding-right: 6px;
  text-align: center;
  vertical-align: middle;
}
.breadcrumb-title-td {
  padding-left: 0;
  padding-right: 6px;
  text-align: center;
  vertical-align: middle;
}
.page-component-first-block {
  padding: 0 0 8px;
}
.page-component-block {
  padding: 8px 0;
}
.breadcrumb-title {
  font-style: normal;
  font-weight: 500;
  font-size: 24px;
  line-height: 32px;
  color: #0e161c;
}
</style>
