<template>
  <div class="user-page">
    <v-container fluid>
      <v-container class="ma-12">
        <p class="h2 font-weight-black">{{ i18n('交接管理') }}</p>
        <v-card>
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
                        v-model="selected_id_type.id_type_code"
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
                        :disabled="selected_id_type.id_type_code == null"
                        v-model="bag_id_numbers"
                      />
                    </wt-col>
                    <wt-col span="20" style="max-width: 900px">
                      <div class="search-row">
                        <wt-select
                          class="mr"
                          :disabled="disableFilter"
                          v-model="selected_bag_type.bag_type_code"
                          :label="i18n('大包种类-必选')"
                          @change="initParamsByBagtype"
                        >
                          <wt-option
                            v-for="item in bag_types"
                            :key="item.bag_type_code"
                            :value="item.bag_type_code"
                            :label="item.bag_type_name"
                          />
                        </wt-select>
                        <wt-select
                          class="mr"
                          v-model="selected_upstream.code"
                          :label="i18n('选择打包方-可选')"
                          :placeholder="i18n('可选')"
                        >
                          <wt-option v-for="item in upstreams" :key="item.code" :value="item.code" :label="item.name" />
                        </wt-select>
                        <wt-select
                          class="mr"
                          v-model="selected_downstream.code"
                          :label="i18n('选择揽收方-可选')"
                          :placeholder="i18n('可选')"
                        >
                          <wt-option
                            v-for="item in downstreams"
                            :key="item.code"
                            :value="item.code"
                            :label="item.name"
                          />
                        </wt-select>
                        <wt-select
                          class="mr"
                          v-model="selected_bag_state.state_code"
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
                  <wt-row :gutter="20" type="flex" style="max-width: 1040px">
                    <wt-col span="12">
                      <wt-button
                        class="search-btn"
                        type="primary"
                        :loading="searching"
                        :disabled="searching"
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
                <v-data-table
                  :calculate-widths="true"
                  :headers="bag_headers"
                  :items="bags"
                  :search="search_keyword"
                  :loading-text="i18n('Loading... Please wait')"
                  :footer-props="{
                    prevIcon: 'keyboard_arrow_left',
                    nextIcon: 'keyboard_arrow_right',
                    itemsPerPageText: i18n('Rows per page'),
                    itemsPerPageOptions: [20, 40],
                  }"
                  item-key="bag_number"
                >
                  <template v-slot:item.actual_weight="{ item }">
                    <div v-if="item.actual_weight_modified == true" style="color: #ef8d2e">
                      <span title="This value has been modified.">&#9888;</span>
                      {{ item.actual_weight }}
                    </div>
                    <div v-else>
                      {{ item.actual_weight }}
                    </div>
                  </template>
                  <template v-slot:item.action="{ item }">
                    <wt-button style="margin: 10px" @click="showOrdersDetail(item)">
                      {{ i18n('订单详情') }}
                    </wt-button>
                    <wt-button
                      type="secondary"
                      style="margin: 10px"
                      :href="
                        '/api/v3/packing_bag/download_label?access_token=' +
                        access_token +
                        '&bag_numbers[]=' +
                        item.bag_number
                      "
                    >
                      {{ i18n('面单') }}
                    </wt-button>
                  </template>
                </v-data-table>
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
                            <li
                              class="li-style"
                              v-for="(item, index) in selected_bag.logistics_order_codes"
                              :key="index"
                            >
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
                  <wt-row :gutter="20" type="flex" style="max-width: 1070px">
                    <wt-col span="8" style="display: flex; flex-direction: column; min-width: 250px">
                      <wt-input :label="i18n('wish大包号')" v-model="dn_bag_number" class="mr">
                        <wt-icon name="search" slot="suffix" />
                      </wt-input>
                      <div style="display: flex">
                        <wt-button
                          class="search-btn"
                          type="primary"
                          :loading="searching"
                          :disabled="searching"
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
                    <wt-col span="8" style="display: flex-end; flex-direction: column; min-width: 250px">
                      <wt-input :label="i18n('wish交接单号')" v-model="dn_number" class="mr">
                        <wt-icon name="search" slot="suffix" />
                      </wt-input>
                      <div style="width: 100%; display: flex; justify-content: flex-end">
                        <wt-button
                          class="search-btn"
                          @click="batchDownload"
                          :loading="downloading"
                          :disabled="downloading"
                        >
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
                <v-data-table
                  :headers="delivery_note_headers"
                  :items="delivery_notes"
                  :search="search_keyword"
                  :loading-text="i18n('Loading... Please wait')"
                  :footer-props="{
                    prevIcon: 'keyboard_arrow_left',
                    nextIcon: 'keyboard_arrow_right',
                    itemsPerPageText: i18n('Rows per page'),
                    itemsPerPageOptions: [20, 40],
                  }"
                  item-key="delivery_note_number"
                >
                  <template v-slot:item.action="{ item }">
                    <wt-button style="margin: 10px" @click="showBagsDetail(item)">
                      {{ i18n('大包详情') }}
                    </wt-button>
                    <wt-button
                      type="secondary"
                      style="margin: 10px"
                      :href="
                        '/api/v3/delivery_note/download_label?access_token=' +
                        access_token +
                        '&delivery_note_numbers[]=' +
                        item.delivery_note_number
                      "
                    >
                      {{ i18n('下载面单') }}
                    </wt-button>
                  </template>
                </v-data-table>
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
                            <li
                              class="li-style"
                              v-for="(item, index) in selected_delivery_note.bag_numbers"
                              :key="index"
                            >
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
    </v-container>
  </div>
</template>
<script>
import req from '@utils/request';
import URL from '../url';
export default {
  name: 'adminHandoverInformation',
  data: function () {
    return {
      tab: null,
      tab_name: 'bag',
      selected_bag_type: { bag_type_name: '', bag_type_code: null },
      selected_bag_state: { state_name: '', state_code: null },
      selected_filter_time: { time_type_name: '', time_type_code: null },
      selected_id_type: { id_type_name: '', id_type_code: null },
      selected_bag: { item_count: 0, wish_standard_tracking_ids: [] },
      selected_delivery_note_state: { state_name: '', state_code: null },
      selected_delivery_note: { order_count: 0, bag_count: 0, bag_numbers: [] },
      selected_upstream: { name: '', code: null },
      selected_downstream: { name: '', code: null },
      start_date: new Date().toISOString().substr(0, 10),
      end_date: new Date().toISOString().substr(0, 10),
      bag_id_numbers: null,
      dn_bag_number: null,
      dn_number: null,
      access_token: null,
      show_start_tpicker: false,
      show_end_tpicker: false,
      bag_types: [],
      bag_states: [{ state_code: null, state_name: this.i18n('默认') }],
      time_types: [{ time_type_name: this.i18n('大包创建时间'), time_type_code: 1 }],
      id_types: [
        { id_type_code: 1, id_type_name: this.i18n('wishpost订单号') },
        { id_type_code: 2, id_type_name: this.i18n('物流单号') },
        { id_type_code: 3, id_type_name: this.i18n('大包号') },
        { id_type_code: 4, id_type_name: this.i18n('交接单号') },
        { id_type_code: 5, id_type_name: this.i18n('物流商/仓库大包号') },
      ],
      upstreams: [{ name: '默认全部', code: null }],
      downstreams: [{ name: '默认全部', code: null }],
      delivery_note_states: [{ state_code: null, state_name: '默认' }],
      weight: null,
      bags: [],
      delivery_notes: [],
      searching: false,
      downloading: false,
      search_keyword: '',
      show_orders_detail_dialog: false,
      show_bags_detail_dialog: false,
      bag_headers: [
        { text: this.i18n('大包号'), value: 'bag_number' },
        { text: this.i18n('大包状态'), value: 'state_name', width: '100' },
        { text: this.i18n('ref大包号'), value: 'ref_bag_number' },
        { text: this.i18n('交接单号'), value: 'handover_serial_number' },
        { text: this.i18n('出库重量(KG)'), value: 'declared_weight' },
        { text: this.i18n('入库重量(KG)'), value: 'actual_weight' },
        { text: this.i18n('创建方'), value: 'upstream_name' },
        { text: this.i18n('揽收方'), value: 'downstream_name', width: '150' },
        { text: this.i18n('创建时间'), value: 'created_time', width: '170' },
        { text: this.i18n('交接时间'), value: 'handover_time', width: '170' },
        { text: this.i18n('入库时间'), value: 'handover_ack_time', width: '170' },
        { text: this.i18n('操作'), value: 'action' },
      ],
      delivery_note_headers: [
        { text: this.i18n('交接单号'), value: 'delivery_note_number' },
        { text: this.i18n('交接单状态'), value: 'state', width: '120' },
        { text: this.i18n('创建方'), value: 'upstream_name' },
        { text: this.i18n('揽收方'), value: 'downstream_name' },
        { text: this.i18n('包含大包'), value: 'bag_count' },
        { text: this.i18n('包含订单'), value: 'order_count' },
        { text: this.i18n('实际大包数量'), value: 'actual_bag_count' },
        { text: this.i18n('创建时间'), value: 'created_ts', width: '170' },
        { text: this.i18n('交接时间'), value: 'handover_ts', width: '170' },
        { text: this.i18n('操作'), value: 'action' },
      ],
    };
  },
  computed: {
    wish_standard_tracking_ids: function () {
      if (this.selected_id_type.id_type_code == 1) return this.bag_id_numbers.split('\n');
      return [];
    },
    tracking_ids: function () {
      if (this.selected_id_type.id_type_code == 2) return this.bag_id_numbers.split('\n');
      return [];
    },
    bag_numbers: function () {
      if (this.selected_id_type.id_type_code == 3) return this.bag_id_numbers.split('\n');
      return [];
    },
    delivery_note_numbers: function () {
      if (this.selected_id_type.id_type_code == 4) return this.bag_id_numbers.split('\n');
      return [];
    },
    ref_bag_numbers: function () {
      if (this.selected_id_type.id_type_code == 5) return this.bag_id_numbers.split('\n');
      return [];
    },
  },
  mounted: function () {
    this.initParams();
    this.getTempAccessToken();
  },
  methods: {
    async initParams() {
      // this.api.getPackingBagSearchParams().then(
      //   res => {
      //     const resp_data = res.data;
      //     this.bag_types = resp_data['bag_types'];
      //     this.bag_states = this.bag_states.concat(resp_data['bag_states']);
      //     this.delivery_note_states = this.delivery_note_states.concat(resp_data['delivery_note_states']);
      //     this.setDefaultParams();
      //     this.initParamsByBagtype();
      //   },
      //   err => {
      //     this.$wt.notify({
      //       type: 'error',
      //       message: err.msg,
      //     });
      //   },
      // );
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
      this.selected_upstream = this.upstreams[0];
      this.selected_downstream = this.downstreams[0];
      this.setDefaultLogisticsParams();
    },
    async initParamsByBagtype() {
      this.initLogisticsParams();
      const params = { bag_type: this.selected_bag_type.bag_type_code };
      // this.api.getBagTypeSearchParams(params).then(
      //   res => {
      //     const resp_data = res.data;
      //     if (resp_data['upstreams']) this.upstreams = this.upstreams.concat(resp_data['upstreams']);
      //     if (resp_data['downstreams']) this.downstreams = this.downstreams.concat(resp_data['downstreams']);
      //     this.setDefaultLogisticsParams();
      //   },
      //   err => {
      //     this.$wt.notify({
      //       type: 'error',
      //       message: err.msg,
      //     });
      //   },
      // );
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
      if (!this.selected_bag_type.bag_type_code) {
        this.selected_bag_type = this.bag_types[0];
      }
      if (!this.selected_bag_state.state_code) {
        this.selected_bag_state = this.bag_states[0];
      }
      if (!this.selected_delivery_note_state.state_code) {
        this.delivery_note_states = this.delivery_note_states[0];
      }
      if (!this.selected_filter_time.time_type_code) {
        this.selected_filter_time = this.time_types[0];
      }
    },
    setDefaultLogisticsParams: function () {
      if (!this.selected_upstream.code) {
        this.selected_upstream = this.upstreams[0];
      }
      if (!this.selected_downstream.code) {
        this.selected_downstream = this.downstreams[0];
      }
    },
    clearSearchFilter: function () {
      this.selected_bag_state = this.bag_states[0];
      this.selected_id_type = this.id_types[0];
      this.selected_upstream = this.upstreams[0];
      this.selected_downstream = this.downstreams[0];
      this.start_date = new Date().toISOString().substr(0, 10);
      this.end_date = new Date().toISOString().substr(0, 10);
      this.bag_id_number = null;
      this.dn_bag_number = null;
      this.dn_number = null;
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
        bag_type: this.selected_bag_type.bag_type_code,
        bag_state: this.selected_bag_state.state_code,
        upstream: this.selected_upstream.code,
        downstream: this.selected_downstream.code,
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
      this.searching = true;
      const params = this.getParams();
      this.selected_bags = [];
      // this.api.getPackingBagSearch(params).then(
      //   res => {
      //     this.bags = res.data.results.rows;
      //     this.searching = false;
      //   },
      //   err => {
      //     this.searching = false;
      //     this.$wt.notify({
      //       type: 'error',
      //       message: err.msg,
      //     });
      //   },
      // );
      try {
        const { data } = await req(URL.getPackingBagSearch, params);
        this.bags = data.results.rows;
        this.searching = false;
      } catch (err) {
        this.searching = false;
        this.$wt.notify({
          type: 'error',
          message: err.msg,
        });
      }
    },
    async getDeliveryNotes() {
      this.searching = true;
      const params = {
        bag_number: this.dn_bag_number,
        delivery_note_number: this.dn_number,
      };
      // this.api.getDeliveryNoteSearch(params).then(
      //   res => {
      //     this.delivery_notes = res.data.results;
      //     this.searching = false;
      //   },
      //   err => {
      //     this.searching = false;
      //     this.$wt.notify({
      //       type: 'error',
      //       message: err.msg,
      //     });
      //   },
      // );
      try {
        const { data } = await req(URL.getDeliveryNoteSearch, params);
        this.delivery_notes = data.results;
        this.searching = false;
      } catch (err) {
        this.searching = false;
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
      // this.api.getTempAccessToken().then(
      //   res => {
      //     this.access_token = res.data.access_token;
      //   },
      //   err => {
      //     this.$wt.notify({
      //       type: 'error',
      //       message: err.msg,
      //     });
      //   },
      // );
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
.v-list-item .v-list-item__title,
.v-list-item .v-list-item__subtitle {
  padding-top: 0px !important;
  padding-bottom: 0px !important;
}
.component-page {
  min-height: 800px;
}
.search-tracking-area {
  width: 100%;
  border-style: inset;
  border-radius: 4px;
  margin-bottom: 4px;
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
