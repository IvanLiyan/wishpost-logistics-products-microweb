<template>
  <v-container>
    <div class="col-12">
      <wt-card class="section">
        <span slot="title">
          {{ i18n('Order Volume Control Management') }}
        </span>
        <v-row class="operation-panel">
          <v-col cols="6">
            <wt-button class="mb-2 ml-4 form-btn-normal" @click="openModifyDialog({}, false)">
              {{ i18n('Create') }}
            </wt-button>
            <wt-button color="#FFF" class="mb-2 form-btn-normal" @click="showBatchAddModal()">
              {{ i18n('Batch Add') }}
            </wt-button>
            <wt-button color="#FFF" class="mb-2 form-btn-delete" @click="showDeleteDialog(true)">
              {{ i18n('Batch Delete') }}
            </wt-button>
          </v-col>
          <v-col cols="4">
            <!-- <v-menu
              v-model="show_search_tpicker"
              :close-on-content-click="false"
              :nudge-right="40"
              transition="scale-transition"
              offset-y
            >
              <template v-slot:activator="{ on }">
                <v-text-field
                  v-model="search_date"
                  :label="i18n('选择日期')"
                  persistent-hint
                  v-on="on"
                  readonly
                  outlined
                  dense
                ></v-text-field>
              </template>
              <v-date-picker v-model="search_date" @input="show_search_tpicker = false"></v-date-picker>
            </v-menu> -->
            <wt-date-picker type="date" :width="120" v-model="search_date" @input="getList" />
          </v-col>
          <v-col cols="2" class="search-field">
            <v-text-field
              v-model="search_keyword"
              append-icon="search"
              :label="i18n('Search')"
              single-line
              hide-details
            ></v-text-field>
          </v-col>
        </v-row>
        <v-row>
          <v-col>
            <div class="ml-5 font-weight-regular subtitle-2">
              * {{ i18n('添加/修改/删除后请至') }}
              <a color="red" href="/manage-logistic-events" target="_blank">{{ i18n('物流工具包->管理物流事件') }}</a>
              {{ i18n('进行审批激活') }}
            </div>
          </v-col>
        </v-row>
        <!-- <wt-table :data="rows">
          <wt-table-column type="selection" />
          <wt-table-column prop="wosp_name" label="WOSP Service" width="160" />
          <wt-table-column prop="shipping_product_name" label="Shipping Product" width="140" />
          <wt-table-column prop="country_name" label="Country" width="140" />
          <wt-table-column prop="warehouse_name" label="Warehouse" width="140" />
          <wt-table-column prop="max_cnt" label="Max Count" width="90" />
          <wt-table-column prop="current_cnt" label="Current Count" width="70" />
          <wt-table-column prop="last_updated_time" label="Last Updated Time" width="170" />
          <wt-table-column prop="control" label="Actions" width="100" />
        </wt-table> -->
        <!-- <wt-pagination
          :total="300"
          :show-total="false"
          :current-page.sync="currentPage"
          :page-size.sync="item_per_page"
        /> -->
        <v-data-table
          v-model="selected_rows"
          :headers="headers"
          :items="rows"
          item-key="category_string"
          :loading="loading"
          :loading-text="i18n('Loading... Please wait')"
          show-select
          :search="search_keyword"
          locale="zh"
          :footer-props="{
            prevIcon: 'keyboard_arrow_left',
            nextIcon: 'keyboard_arrow_right',
            itemsPerPageText: i18n('Rows per page'),
            itemsPerPageOptions: [20, 40],
          }"
          :items-per-page="item_per_page"
        >
          <template v-for="(h, index) in headers" v-slot:[`header.${h.value}`]>
            <v-tooltip bottom v-if="['max_cnt', 'actual_cnt', 'current_cnt'].indexOf(h.value) != -1" :key="index">
              <template v-slot:activator="{ on }">
                <span v-on="on">{{ h.text }}</span>
              </template>
              <span v-if="h.tooltip">{{ h.tooltip }}</span>
            </v-tooltip>
            <div :key="index">
              <span>{{ h.text }}</span>
            </div>
          </template>
          <template v-slot:item.current_cnt="{ item }">
            <span class="blue--text darken-2">{{ item.current_cnt }}</span>
          </template>
          <template v-slot:item.max_cnt="{ item }">
            <span :class="getColorText(item.proportion)">{{ item.max_cnt }}</span>
          </template>
          <template v-slot:item.actual_cnt="{ item }">
            <span :class="getColorText(item.proportion)">{{ item.actual_cnt }}</span>
          </template>
          <template v-slot:item.action="{ item }">
            <v-tooltip top>
              <template v-slot:activator="{ on }">
                <v-icon
                  small
                  class="mr-2"
                  v-on="on"
                  :color="item.is_invalid ? 'red' : 'green'"
                  @click="openModifyDialog(item, true)"
                >
                  mdi-pencil
                </v-icon>
              </template>
              <span v-if="item.is_invalid">
                {{
                  i18n(
                    '[%s, %s, %s, %s]因max cnt&lt;=%s或过去一个月内cur cnt/max cnt&lt;=%s, 在%s被标记为不合理. 请于%s天内修改max cnt.',
                    item.wosp_name,
                    item.shipping_product_name,
                    item.country_name,
                    item.warehouse_name,
                    min_valid_limit,
                    min_valid_rate,
                    item.last_warning_time,
                    max_allowed_warning,
                  )
                }}
              </span>
              <span v-else>{{ i18n('Edit') }}</span>
            </v-tooltip>
            <v-tooltip top>
              <template v-slot:activator="{ on }">
                <v-icon small class="mr-2" v-on="on" @click="showDeleteDialog(false, item)">mdi-delete</v-icon>
              </template>
              <span>{{ i18n('Delete') }}</span>
            </v-tooltip>
          </template>
        </v-data-table>
      </wt-card>
    </div>
    <!-- Batch Add Dialog -->
    <v-dialog v-model="batch_add_dialog.show" max-width="700px">
      <v-card>
        <v-card-title>
          <span class="headline">{{ i18n('Batch Add') }}</span>
        </v-card-title>
        <v-card-text>
          <v-container>
            <v-row>
              <v-col cols="12" sm="12" md="12">
                <v-text-field :label="i18n('Phab ID')" v-model="phab.id"></v-text-field>
              </v-col>
              <v-col cols="12" sm="12" md="12">
                <v-text-field :label="i18n('业务理由')" v-model="phab.desc"></v-text-field>
              </v-col>
            </v-row>
            <uploadFileView
              v-model="batch_add_dialog.batch_add_file"
              accept=".xls,.xlsx"
              :sectionName="i18n('Batch Add')"
              :multi="false"
              :showTemplate="true"
              template="/static/docs/manage_order_traffic_control_demo.xlsx"
            ></uploadFileView>
            <v-row>
              <v-col cols="12" sm="12" md="12">
                <div class="error-message">{{ batch_add_dialog.msg }}</div>
              </v-col>
            </v-row>
          </v-container>
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn color="blue darken-1" text @click="cancelBatchAddModal">{{ i18n('Cancel') }}</v-btn>
          <v-btn color="blue darken-1" text @click="batchAdd" :loading="batch_add_dialog.loading">
            {{ i18n('Save') }}
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
    <!-- Delete Item(s) Dialog -->
    <v-dialog v-model="delete_dialog.show" max-width="700px">
      <v-card>
        <v-card-title>
          <span class="headline">{{ i18n('Delete') }}</span>
        </v-card-title>
        <v-card-text>
          <v-container>
            <v-row>
              <v-col cols="12" sm="12" md="12">
                <v-text-field :label="i18n('Phab ID')" v-model="phab.id"></v-text-field>
              </v-col>
              <v-col cols="12" sm="12" md="12">
                <v-text-field :label="i18n('业务理由')" v-model="phab.desc"></v-text-field>
              </v-col>
              <v-col cols="12" sm="12" md="12">
                <div class="error-message">{{ delete_dialog.msg }}</div>
              </v-col>
            </v-row>
          </v-container>
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn color="blue darken-1" text @click="cancelDeleteDialog">{{ i18n('Cancel') }}</v-btn>
          <v-btn color="blue darken-1" text @click="saveDeleteDialog" :loading="delete_dialog.loading">
            {{ i18n('Save') }}
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
    <!-- Modify Item Dialog -->
    <v-dialog v-model="modify_dialog.show" max-width="700px">
      <v-card>
        <v-card-title>
          <span class="headline">{{ modify_dialog.title }}</span>
        </v-card-title>
        <v-card-text>
          <v-container>
            <v-row>
              <v-col cols="12" sm="12" md="12">
                <v-text-field :label="i18n('Phab ID')" v-model="phab.id"></v-text-field>
              </v-col>
              <v-col cols="12" sm="12" md="12">
                <v-text-field :label="i18n('业务理由')" v-model="phab.desc"></v-text-field>
              </v-col>
              <v-col cols="12" sm="12" md="12">
                <v-autocomplete
                  :label="i18n('WOSP Service')"
                  v-model="modify_dialog.wosp_id"
                  :items="modify_dialog.wosps"
                  :item-text="displayText"
                  item-value="id"
                  :disabled="modify_dialog.is_edit"
                ></v-autocomplete>
              </v-col>
              <v-col cols="12" sm="12" md="12">
                <v-autocomplete
                  :label="i18n('Country')"
                  v-model="modify_dialog.country"
                  :items="modify_dialog.countries"
                  :item-text="displayText"
                  item-value="id"
                  :disabled="modify_dialog.is_edit"
                ></v-autocomplete>
              </v-col>
              <v-col cols="12" sm="12" md="12">
                <v-autocomplete
                  :label="i18n('Shipping Product')"
                  v-model="modify_dialog.shipping_product_id"
                  :items="modify_dialog.shipping_products"
                  :item-text="displayText"
                  item-value="id"
                  :disabled="modify_dialog.is_edit"
                ></v-autocomplete>
              </v-col>
              <v-col cols="12" sm="12" md="12">
                <v-autocomplete
                  :label="i18n('Warehouse')"
                  v-model="modify_dialog.warehouse"
                  :items="modify_dialog.warehouses"
                  :item-text="displayText"
                  item-value="id"
                  :disabled="modify_dialog.is_edit"
                ></v-autocomplete>
              </v-col>
              <v-col cols="12" sm="12" md="12">
                <v-text-field v-model="modify_dialog.max_cnt" :label="i18n('Max Count')"></v-text-field>
              </v-col>
              <v-col cols="12" sm="12" md="12">
                <div class="error-message">{{ modify_dialog.msg }}</div>
              </v-col>
            </v-row>
          </v-container>
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn color="blue darken-1" text @click="cancelModifyDialog">{{ i18n('Cancel') }}</v-btn>
          <v-btn color="blue darken-1" text @click="saveModifyDialog" :loading="modify_dialog.loading">
            {{ i18n('Save') }}
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-container>
</template>
<script>
import uploadFileView from '@component/uploadFileView';
import req from '@utils/request';
import URL from './url';
export default {
  name: 'manageOrderTrafficControl',
  components: { uploadFileView },
  data: function () {
    return {
      // Table.
      loading: true,
      headers: [
        { text: this.i18n('WOSP Service'), value: 'wosp_name', sortable: true },
        { text: this.i18n('Shipping Product'), value: 'shipping_product_name', sortable: false },
        { text: this.i18n('Country'), value: 'country_name', sortable: true },
        { text: this.i18n('Warehouse'), value: 'warehouse_name', sortable: false },
        {
          text: this.i18n('Max Count'),
          value: 'max_cnt',
          sortable: true,
          tooltip: this.i18n('Max count will refresh every 15 minutes.'),
        },
        {
          text: this.i18n('Current Count'),
          value: 'current_cnt',
          sortable: true,
          tooltip: this.i18n('Current count will refresh every 5 minutes.'),
        },
        { text: this.i18n('Last Updated Time'), value: 'last_updated_time', sortable: false },
        { text: this.i18n('Actions'), value: 'action', sortable: false },
      ],
      item_per_page: 20,
      rows: [],
      search_keyword: '',
      selected_rows: [],
      phab: {
        id: null,
        desc: null,
      },
      max_allowed_warning: null,
      min_valid_limit: null,
      modify_dialog: {
        show: false,
        loading: false,
        msg: '',
        name: '',
        is_edit: true,
        phab_id: null,
        phab_desc: null,
        wosp_id: null,
        shipping_product_id: 'None',
        country: null,
        warehouse: 'None',
        max_cnt: 0,
        countries: [],
        wosps: [],
        warehouses: [],
        shipping_products: [],
      },
      batch_add_dialog: {
        show: false,
        loading: false,
        msg: '',
        batch_add_file: null,
      },
      // Delete Dialog.
      delete_dialog: {
        show: false,
        loading: false,
        msg: '',
        is_batch: false,
        item: null,
      },
      // Date picker, use Beijing Time Zone
      search_date: new Date(new Date().getTime() + 8 * 3600 * 1000).toISOString().substr(0, 10),
      show_search_tpicker: false,
    };
  },
  mounted: function () {
    this.getList();
    this.getMeta();
  },
  methods: {
    displayText: item => item.id + ' — ' + item.name,
    getColorText(proportion) {
      let color = null;
      if (proportion >= 1) {
        color = 'red';
      } else if (proportion <= 0.25) {
        color = 'green';
      } else {
        return '';
      }
      return color + '--text';
    },
    async getList() {
      this.loading = true;
      const params = {
        search_date: this.search_date,
      };
      try {
        const { data } = await req(URL.getOrderTrafficControlList, params);
        this.rows = data.results.rows;
        console.log('this.rows', this.rows);
        this.loading = false;
      } catch (err) {
        this.loading = false;
        this.$wt.notify({
          type: 'error',
          message: err.message,
        });
      }
    },
    async getMeta() {
      try {
        const { data } = await req(URL.getOrderTrafficControlMeta);
        const resp = data.results;
        const default_opt = [
          {
            id: 'None',
            name: this.i18n('All'),
          },
        ];
        const self = this;
        ['countries', 'wosps', 'shipping_products', 'warehouses'].forEach(function (key) {
          self.modify_dialog[key] = [...default_opt, ...resp[key]];
        });
        self.max_allowed_warning = resp['max_allowed_warning'];
        self.min_valid_rate = resp['min_valid_rate'];
        self.min_valid_limit = resp['min_valid_limit'];
      } catch (err) {
        // this.$wt.notify({
        //   type: 'error',
        //   message: err.message,
        // });
      }
    },
    _resetPhab() {
      this.phab.id = null;
      this.phab.desc = null;
    },
    _validatePhab() {
      if (this.phab.id && this.phab.desc) {
        return true;
      }
      return false;
    },
    // -------------------------------- Create or Update --------------------------//
    cancelModifyDialog() {
      this.modify_dialog.show = false;
    },
    async saveModifyDialog() {
      this.modify_dialog.loading = true;
      this.modify_dialog.msg = '';
      if (!this._validatePhab()) {
        this.modify_dialog.msg = this.i18n('请填写所有信息');
      }
      const { country, wosp_id, shipping_product_id, max_cnt, warehouse } = this.modify_dialog;
      const params = {
        country,
        wosp_id,
        shipping_product_id,
        max_cnt,
        warehouse,
        phab_id: this.phab.id,
        phab_desc: this.phab.desc,
      };
      try {
        const { data } = await req(URL.saveOrderTrafficControl, params);
        console.log(data);
        this.$wt.notify({
          type: 'success',
          message: this.i18n('成功！请到物流工具包->管理物流事件中审批激活！'),
        });
        this.modify_dialog.loading = false;
        this.modify_dialog.show = false;
      } catch (err) {
        console.log('err', err);
        this.$wt.notify({
          type: 'error',
          message: err.message,
        });
        this.modify_dialog.loading = false;
      }
      // this.api
      //   .saveOrderTrafficControl({
      //     country,
      //     wosp_id,
      //     shipping_product_id,
      //     max_cnt,
      //     warehouse,
      //     phab_id: this.phab.id,
      //     phab_desc: this.phab.desc,
      //   })
      //   .then(
      //     () => {
      //       this.noty({
      //         type: 'success',
      //         text: this.i18n('成功！请到物流工具包->管理物流事件中审批激活！'),
      //       });
      //       this.modify_dialog.loading = false;
      //       this.modify_dialog.show = false;
      //     },
      //     err => {
      //       this.noty({
      //         type: 'error',
      //         text: err.message,
      //       });
      //       this.modify_dialog.loading = false;
      //     },
      //   );
    },
    openModifyDialog(item, is_edit) {
      if (is_edit) {
        Object.assign(this.modify_dialog, {
          is_edit: true,
          title: this.i18n('Edit'),
          max_cnt: item.max_cnt,
          wosp_id: item.wosp_id,
          country: item.country_iso2_code,
          shipping_product_id: item.shipping_product_id,
          warehouse: item.warehouse_code.toString(),
        });
      } else {
        Object.assign(this.modify_dialog, {
          is_edit: false,
          title: this.i18n('Create'),
          wosp_id: null,
          shipping_product_id: 'None',
          country: null,
          warehouse: 'None',
          max_cnt: 0,
        });
      }
      this.modify_dialog.show = true;
      this.modify_dialog.msg = '';
    },
    // --------------------------------- Batch Create -----------------------------//
    showBatchAddModal() {
      this.batch_add_dialog.show = true;
      this.batch_add_dialog.msg = '';
      this._resetPhab();
    },
    cancelBatchAddModal() {
      this.batch_add_dialog.show = false;
    },
    async batchAdd() {
      this.batch_add_dialog.msg = '';
      const url = this.getUploadFileUrl();
      if (!url) {
        this.batch_add_dialog.msg = this.i18n('请上传文件');
        return;
      }
      if (!this._validatePhab()) {
        this.batch_add_dialog.msg = this.i18n('请填写所有信息');
        return;
      }
      this.batch_add_dialog.loading = true;
      const params = {
        file_url: url,
        phab_id: this.phab.id,
        phab_desc: this.phab.desc,
      };
      try {
        const { data } = await req(URL.batchAddTrafficControl, params);
        console.log(data);
        this.$wt.notify({
          type: 'success',
          message: this.i18n('成功！请到物流工具包->管理物流事件中审批激活！'),
        });
        this.batch_add_dialog.show = false;
        this.batch_add_dialog.loading = false;
      } catch (err) {
        this.$wt.notify({
          type: 'error',
          message: err.message,
        });
        this.batch_add_dialog.loading = false;
      }
      // this.api
      //   .batchAddTrafficControl({
      //     file_url: url,
      //     phab_id: this.phab.id,
      //     phab_desc: this.phab.desc,
      //   })
      //   .then(
      //     () => {
      //       this.noty({
      //         type: 'success',
      //         text: this.i18n('成功！请到物流工具包->管理物流事件中审批激活！'),
      //       });
      //       this.batch_add_dialog.show = false;
      //       this.batch_add_dialog.loading = false;
      //     },
      //     err => {
      //       this.noty({
      //         type: 'error',
      //         text: err.message,
      //       });
      //       this.batch_add_dialog.loading = false;
      //     },
      //   );
    },
    getUploadFileUrl() {
      const file = this.batch_add_dialog.batch_add_file;
      if (!file) {
        this.$wt.notify({
          type: 'error',
          message: this.i18n('Please choose a file.'),
        });
        return;
      }
      return file.url;
    },
    // -------------------------------- Delete ------------------------------------//
    showDeleteDialog(is_batch, item) {
      if (is_batch && this.selected_rows.length === 0) {
        return;
      }
      this.delete_dialog.msg = '';
      Object.assign(this.delete_dialog, {
        is_batch: is_batch,
        item: item,
        show: true,
        msg: '',
      });
    },
    cancelDeleteDialog() {
      this.delete_dialog.show = false;
    },
    saveDeleteDialog() {
      if (!this._validatePhab()) {
        this.delete_dialog.msg = this.i18n('请填写所有信息');
        return;
      }
      this.deleteItem();
    },
    async deleteItem() {
      const category_strings = this.delete_dialog.is_batch
        ? this.selected_rows.map(entry => entry.category_string)
        : [this.delete_dialog.item.category_string];
      const params = {
        'category_strings[]': category_strings,
        phab_id: this.phab.id,
        phab_desc: this.phab.desc,
      };
      try {
        const { data } = await req(URL.batchDeleteOrderTrafficControl, params);
        console.log(data);
        this.delete_dialog.show = false;
        this.$wt.notify({
          type: 'success',
          message: this.i18n('成功！请到物流工具包->管理物流事件中审批激活！'),
        });
      } catch (err) {
        this.$wt.notify({
          type: 'error',
          message: err.message,
        });
      }
      // this.api
      //   .batchDeleteOrderTrafficControl({
      //     'category_strings[]': category_strings,
      //     phab_id: this.phab.id,
      //     phab_desc: this.phab.desc,
      //   })
      //   .then(
      //     () => {
      //       this.delete_dialog.show = false;
      //       this.noty({
      //         type: 'success',
      //         text: this.i18n('成功！请到物流工具包->管理物流事件中审批激活！'),
      //       });
      //     },
      //     err => {
      //       this.noty({
      //         type: 'error',
      //         text: err.message,
      //       });
      //     },
      //   );
    },
  },
};
</script>
<style scoped>
.form-btn-normal {
  color: #fff;
  font-weight: 700;
  border-radius: 4px;
  margin-right: 12px;
}
.form-btn-delete {
  color: #fff;
  font-weight: 700;
  border-radius: 4px;
  margin-right: 12px;
  background: #e52533;
  border: #e52533;
}
.form-btn-delete:hover {
  background: #c00;
}
.error-message {
  color: #ff5252;
  float: right;
}
.search-field {
  padding-top: 0px !important;
  padding-bottom: 0px !important;
  align: center;
}
.operation-panel {
  margin-right: 20px;
}
em {
  color: #000 !important;
}
</style>
