<template>
  <div class="user-page order-page">
    <v-container fluid>
      <v-container>
        <div class="h2 mb-4">{{ i18n('批量操作订单') }}</div>
        <v-card class="mb-4">
          <v-card-text>
            <v-row>
              <v-col cols="2">
                <v-autocomplete
                  v-model="id_field_obj"
                  :items="id_field_names"
                  :label="i18n('ID名称')"
                  return-object
                  outlined
                  dense
                  item-text="name"
                  item-value="field_name"
                  hide-details="true"
                ></v-autocomplete>
              </v-col>
              <v-col cols="2">
                <v-autocomplete
                  v-model="category"
                  :items="categories"
                  :label="i18n('搜索类型')"
                  placeholder="可多选"
                  item-text="text"
                  item-value="value"
                  clearable
                  outlined
                  dense
                  multiple
                ></v-autocomplete>
              </v-col>
              <v-col cols="2">
                <v-text-field
                  v-model="ticket"
                  :label="i18n('Ticket号')"
                  outlined
                  dense
                  hide-details="true"
                ></v-text-field>
              </v-col>
            </v-row>
            <v-row>
              <v-col cols="8">
                <v-textarea
                  v-model="tracking_ids"
                  outlined
                  hide-details
                  label="请输入ids，多个id请换行分割，最多500单(标记丢件和取消订单只能输入tracking_id，搜索时可输入tracking_id或wosp_id)"
                ></v-textarea>
              </v-col>
            </v-row>
            <v-row>
              <v-col cols="1">
                <v-btn
                  class="white--text search-btn"
                  color="#305BEF"
                  @click="searchOrderRequest"
                  :loading="loading"
                  block
                >
                  搜索
                </v-btn>
              </v-col>
              <v-col class="mr-2" cols="1">
                <v-btn color="#305BEF" outlined @click="[markLost, (mark_lost = true)]" block>标记丢件</v-btn>
              </v-col>
              <v-col cols="1">
                <v-btn
                  class="white--text search-btn"
                  color="#305BEF"
                  @click="[batchCancel, (cancel_order = true)]"
                  block
                >
                  取消订单
                </v-btn>
              </v-col>
              <v-col class="mr-10" cols="1" offset-md="6">
                <v-btn color="#305BEF" outlined block @click="batch_mark_lost = true">上传标记丢件</v-btn>
              </v-col>
              <v-col cols="1">
                <v-btn class="white--text search-btn" block color="#305BEF" @click="batch_cancel_order = true">
                  上传取消订单
                </v-btn>
              </v-col>
            </v-row>
          </v-card-text>
        </v-card>
        <v-card class="mt-4">
          <v-card-title>
            操作记录
            <v-spacer></v-spacer>
            <v-text-field
              v-model="keyword"
              append-icon="search"
              :label="i18n('Search')"
              single-line
              hide-details
            ></v-text-field>
          </v-card-title>
          <v-card-text>
            <v-data-table
              :items="result"
              :headers="headers"
              :loading="loading"
              :loading-text="i18n('Loading... Please wait')"
              :search="keyword"
              multi-sort
              locale="zh"
              :items-per-page="items_per_page"
              :footer-props="{
                prevIcon: 'keyboard_arrow_left',
                nextIcon: 'keyboard_arrow_right',
                itemsPerPageText: i18n('Rows per page'),
                itemsPerPageOptions: [20, 40, 60],
              }"
            >
              <template v-slot:item.state="{ item }">
                <span v-if="item.state == 'SUCCESS'" class="green--text">SUCCESS</span>
                <span v-if="item.state == 'FAILED'" class="red--text">FAILED</span>
                <span v-if="item.state == 'CREATED'" class="red--text">CREATED</span>
                <span v-if="item.state == 'TERMINATED'" class="red--text">TERMINATED</span>
              </template>
            </v-data-table>
          </v-card-text>
        </v-card>
      </v-container>
      <v-dialog v-model="mark_lost" max-width="560">
        <v-card>
          <v-card-title>
            <span class="headline">选择订单类型</span>
          </v-card-title>
          <v-card-text>
            <v-row>
              <v-col cols="12" sm="12" md="12">
                <v-select outlined dense label="类型" v-model="lost_type" :items="type_items"></v-select>
              </v-col>
            </v-row>
          </v-card-text>
          <v-card-actions>
            <v-btn class="white--text search btn" color="blue darken-1" @click="markLostTrackings">
              {{ i18n('确定') }}
            </v-btn>
            <v-btn color="blue darken-1" text @click="mark_lost = false">{{ i18n('取消') }}</v-btn>
          </v-card-actions>
        </v-card>
      </v-dialog>
      <v-dialog v-model="cancel_order" max-width="560">
        <v-card>
          <v-card-title>
            <span class="headline">选择取消原因</span>
          </v-card-title>
          <v-card-text>
            <v-row>
              <v-col cols="12" sm="12" md="12">
                <v-select
                  v-model="cancel_reason_obj.category"
                  :items="cancel_category_list"
                  item-text="name"
                  item-value="id"
                  dense
                  outlined
                  :label="i18n('取消类别')"
                  @change="updateCancelOrderCategory"
                ></v-select>
                <v-select
                  v-if="cancel_reason_obj.category != cancel_category_customized_id"
                  v-model="cancel_reason_obj.reason"
                  :items="cancel_reason_list"
                  item-text="name"
                  item-value="code"
                  dense
                  return-object
                  outlined
                  :label="i18n('具体原因')"
                ></v-select>
                <v-textarea
                  v-else-if="cancel_reason_obj.category == cancel_category_customized_id"
                  v-model="cancel_reason_obj.customized_reason"
                  outlined
                  :label="i18n('取消原因')"
                  :hint="i18n('必填，不超过200个字符')"
                ></v-textarea>
              </v-col>
            </v-row>
          </v-card-text>
          <v-card-actions>
            <v-btn class="white--text search btn" color="blue darken-1" @click="batchCancelOrders">
              {{ i18n('确定') }}
            </v-btn>
            <v-btn color="blue darken-1" text @click="cancel_order = false">{{ i18n('取消') }}</v-btn>
          </v-card-actions>
        </v-card>
      </v-dialog>
      <v-dialog v-model="batch_mark_lost" max-width="560">
        <v-card>
          <v-card-title class="headline">{{ i18n('选择订单类型') }}</v-card-title>
          <v-card-text>
            <v-row>
              <v-col cols="12" sm="12" md="12">
                <v-select outlined dense label="类型" v-model="lost_type" :items="type_items"></v-select>
              </v-col>
            </v-row>
          </v-card-text>
          <v-card-actions>
            <v-btn class="white--text search btn" color="blue darken-1" @click="upload_batch_mark_lost = true">
              {{ i18n('上传') }}
            </v-btn>
            <v-btn color="blue darken-1" text @click="batch_mark_lost = false">{{ i18n('取消') }}</v-btn>
          </v-card-actions>
        </v-card>
      </v-dialog>
      <v-dialog v-model="batch_cancel_order" max-width="560">
        <v-card>
          <v-card-title class="headline">{{ i18n('选择取消原因') }}</v-card-title>
          <v-card-text>
            <v-row>
              <v-col cols="12" sm="12" md="12">
                <v-select
                  v-model="cancel_reason_obj.category"
                  :items="cancel_category_list"
                  item-text="name"
                  item-value="id"
                  dense
                  outlined
                  :label="i18n('取消类别')"
                  @change="updateCancelOrderCategory"
                ></v-select>
                <v-select
                  v-if="cancel_reason_obj.category != cancel_category_customized_id"
                  v-model="cancel_reason_obj.reason"
                  :items="cancel_reason_list"
                  item-text="name"
                  item-value="code"
                  dense
                  return-object
                  outlined
                  :label="i18n('具体原因')"
                ></v-select>
                <v-textarea
                  v-else-if="cancel_reason_obj.category == cancel_category_customized_id"
                  v-model="cancel_reason_obj.customized_reason"
                  outlined
                  :label="i18n('取消原因')"
                  :hint="i18n('必填，不超过200个字符')"
                ></v-textarea>
              </v-col>
            </v-row>
          </v-card-text>
          <v-card-actions>
            <v-btn class="white--text search btn" color="blue darken-1" @click="upload_batch_cancel_order = true">
              {{ i18n('上传') }}
            </v-btn>
            <v-btn color="blue darken-1" text @click="batch_cancel_order = false">{{ i18n('取消') }}</v-btn>
          </v-card-actions>
        </v-card>
      </v-dialog>
      <v-dialog v-model="upload_batch_mark_lost" max-width="560">
        <v-card>
          <v-card-title>
            <span class="headline">上传标记丢件文件</span>
          </v-card-title>
          <v-card-text>
            <v-row align="center">
              <v-col cols="6">
                <span>{{ i18n('上传XLS文件批量导入标记丢件订单') }}</span>
              </v-col>
              <v-col cols="6" align="right">
                <v-btn @click="downloadBatchUploadTemplate()" align="right">
                  {{ i18n('下载模板') }}
                </v-btn>
              </v-col>
            </v-row>
            <v-row>
              <v-col cols="12" sm="12" md="12">
                <excelFileReader v-model="batch_upload.data"></excelFileReader>
              </v-col>
            </v-row>
          </v-card-text>
          <v-card-actions>
            <v-btn class="white--text search btn" color="blue darken-1" @click="batchUploadMarkLost">
              {{ i18n('确定') }}
            </v-btn>
            <v-btn color="blue darken-1" text @click="[(upload_batch_mark_lost = false), (batch_mark_lost = false)]">
              {{ i18n('取消') }}
            </v-btn>
          </v-card-actions>
        </v-card>
      </v-dialog>
      <v-dialog v-model="upload_batch_cancel_order" max-width="560">
        <v-card>
          <v-card-title>
            <span class="headline">上传取消订单文件</span>
          </v-card-title>
          <v-card-text>
            <v-row align="center">
              <v-col cols="6">
                <span>{{ i18n('上传XLS文件批量导入取消订单') }}</span>
              </v-col>
              <v-col cols="6" align="right">
                <v-btn @click="downloadBatchUploadTemplate()" align="right">
                  {{ i18n('下载模板') }}
                </v-btn>
              </v-col>
            </v-row>
            <v-row>
              <v-col cols="12" sm="12" md="12">
                <excelFileReader v-model="batch_upload.data"></excelFileReader>
              </v-col>
            </v-row>
          </v-card-text>
          <v-card-actions>
            <v-btn class="white--text search btn" color="blue darken-1" @click="batchUploadCancelORder">
              {{ i18n('确定') }}
            </v-btn>
            <v-btn
              color="blue darken-1"
              text
              @click="[(upload_batch_cancel_order = false), (batch_cancel_order = false)]"
            >
              {{ i18n('取消') }}
            </v-btn>
          </v-card-actions>
        </v-card>
      </v-dialog>
    </v-container>
  </div>
</template>
<script>
import excelFileReader from '@utils/excelFileReader';
import { downloadFile } from '@utils/FileUtil';
export default {
  name: 'batchMarkLostOrders',
  components: { excelFileReader },
  data: function () {
    return {
      tracking_ids: [],
      wish_standard_tracking_ids: [],
      category: null,
      id_field_obj: null,
      ticket: null,
      upload_batch_mark_lost: false,
      upload_batch_cancel_order: false,
      batch_mark_lost: false,
      batch_cancel_order: false,
      mark_lost: false,
      cancel_order: false,
      loading: false,
      result: [],
      type_items: [
        { text: '4PL前程件', value: 'fm' },
        { text: '4PL后程件', value: 'lm' },
      ],
      cancel_category_list: [],
      cancel_reason_list: [],
      cancel_category_customized_id: -9999999,
      items_per_page: 20,
      cancel_reason_obj: {
        order_id: '',
        category: null,
        reason: null,
        customized_reason: null,
      },
      batch_upload: {
        loading: false,
        data: null,
        error: '',
        msg: '',
      },
      id_field_names: [
        { field_name: 'wish_standard_tracking_ids', name: this.i18n('WishPost Order ID') },
        { field_name: 'tracking_ids', name: this.i18n('Tracking ID') },
      ],
      categories: [
        { text: this.i18n('标记丢件'), value: 'MARK_LOST' },
        { text: this.i18n('取消订单'), value: 'CANCEL_ORDER' },
      ],
      headers: [
        { text: 'WOSP Id', align: 'center', value: 'wish_standard_tracking_id' },
        { text: 'Tracking Id', align: 'center', value: 'tracking_id' },
        { text: 'Ticket号', align: 'center', value: 'ticket' },
        { text: '类型', align: 'center', value: 'category' },
        { text: '状态', align: 'center', value: 'state' },
        { text: '状态信息', align: 'center', value: 'message' },
        { text: '更新时间', align: 'center', value: 'last_updated_time' },
      ],
      keyword: '',
      lost_type: '',
      cancel_reason: '',
      tab: '',
      show_batch_dialog: '',
      show_cancel_reason_dialog: '',
      batch: false,
    };
  },
  mounted() {
    this.initParams();
  },
  methods: {
    initParams() {
      this.api.getCancelOrderReasonCategoryList().then(res => {
        this.cancel_category_list.push({
          id: null,
          name: this.i18n('请选择'),
        });
        this.cancel_category_list = this.cancel_category_list.concat(res.data);
        this.cancel_category_list.push({
          id: this.cancel_category_customized_id,
          name: this.i18n('以上都不是'),
        });
      });
    },
    getParams() {
      const params = {
        'category[]': this.category,
      };
      if (this.id_field_obj && this.tracking_ids) {
        const trackings = this.tracking_ids.split(/\s+/);
        params[this.id_field_obj.field_name] = trackings;
      }
      return params;
    },
    searchOrderRequest() {
      this.loading = false;
      const params = this.getParams();
      this.loading = true;
      this.api.searchOrderRequest(params).then(
        res => {
          this.loading = false;
          this.result = res.data.result;
        },
        err => {
          this.loading = false;
          this.$wt.notify({
            type: 'error',
            message: err.msg,
          });
        },
      );
    },
    updateCancelOrderCategory() {
      this.cancel_reason_obj.reason = null;
      this.cancel_reason_list = this.cancel_category_list.find(
        entry => entry.id == this.cancel_reason_obj.category,
      ).reasons;
    },
    markLost() {
      this.mark_lost = true;
    },
    batchCancel() {
      this.cancel_order = true;
    },
    batchUploadMarkLost() {
      this.batch_upload.error = '';
      this.batch_upload.msg = '';
      this.batch_upload.loading = true;
      const tracking_ids = [];
      this.batch_upload.data[0].data.forEach(entry => tracking_ids.push(entry.tracking_id));
      const params = {
        tracking_ids: tracking_ids,
        lost_type: this.lost_type,
        ticket: this.ticket,
      };
      this.api.markLostOrders(params).then(
        res => {
          this.upload_batch_mark_lost = false;
          this.batch_mark_lost = false;
          this.loading = false;
          this.result = res.data.result;
        },
        err => {
          this.loading = false;
          this.$wt.notify({
            type: 'error',
            message: err.msg,
          });
          this.upload_batch_mark_lost = false;
          this.batch_mark_lost = false;
        },
      );
    },
    batchUploadCancelORder() {
      this.batch_upload.error = '';
      this.batch_upload.msg = '';
      this.batch_upload.loading = true;
      const tracking_ids = [];
      this.batch_upload.data[0].data.forEach(entry => tracking_ids.push(entry.tracking_id));
      const customized_reason = this.cancel_reason_obj.customized_reason;
      if (
        !this.cancel_reason_obj.category ||
        (this.cancel_reason_obj.category != this.cancel_category_customized_id && !this.cancel_reason_obj.reason) ||
        (this.cancel_reason_obj.category == this.cancel_category_customized_id &&
          !this.cancel_reason_obj.customized_reason)
      ) {
        this.$wt.notify({
          type: 'error',
          message: this.i18n('请选择/填写取消原因'),
        });
        return;
      }
      const params = {
        'tracking_ids[]': tracking_ids,
        invalid_reason: customized_reason ? customized_reason : this.cancel_reason_obj.reason.name,
        cancel_reason_code: this.cancel_reason_obj.reason ? this.cancel_reason_obj.reason.code : null,
        ticket: this.ticket,
      };
      this.api.batchInvalidateOrder(params).then(
        res => {
          this.result = [];
          this.loading = false;
          const result_dict = res.data;
          Object.keys(result_dict).forEach(entry => {
            const results = result_dict[entry];
            results.forEach(el => {
              this.result.push({
                tracking_id: el.tracking_id,
                wish_standard_tracking_id: el.wish_standard_tracking_id,
                message: el.message,
                ticket: el.ticket,
                state: el.state,
                category: el.category,
                last_updated_time: el.last_updated_time,
              });
            });
          });
          this.upload_batch_cancel_order = false;
          this.batch_cancel_order = false;
        },
        err => {
          this.loading = false;
          this.$wt.notify({
            type: 'error',
            message: err.msg,
          });
          this.upload_batch_cancel_order = false;
          this.batch_cancel_order = false;
        },
      );
    },
    downloadBatchUploadTemplate() {
      const Excel = require('exceljs');
      const wb = new Excel.Workbook();
      const dataSheet = wb.addWorksheet('trackings');
      const headers = ['tracking_id'];
      const content = [];
      dataSheet.addRow(headers);
      dataSheet.addRows(content);
      const fileName = 'batch_trackings.xlsx';
      wb.xlsx.writeBuffer().then(buffer => {
        this.exporting = false;
        downloadFile(buffer, 'text/xlsx', fileName);
      });
    },
    resetCancelOrderModal() {
      this.cancel_reason_obj.order_id = null;
      this.cancel_reason_obj.category = null;
      this.cancel_reason_obj.reason = null;
      this.cancel_reason_obj.customized_reason = null;
    },
    markLostTrackings() {
      if (!this.lost_type) {
        this.$wt.notify({
          type: 'error',
          message: '请选择类型',
        });
        return;
      }
      const trackings = this.tracking_ids.split(/\s+/);
      this.loading = true;
      this.api
        .markLostOrders({
          tracking_ids: trackings,
          lost_type: this.lost_type,
          ticket: this.ticket,
        })
        .then(
          res => {
            this.loading = false;
            this.result = res.data.result;
          },
          err => {
            this.loading = false;
            this.$wt.notify({
              type: 'error',
              message: err.msg,
            });
          },
        );
      this.mark_lost = false;
    },
    batchCancelOrders() {
      const trackings = this.tracking_ids.split(/\s+/);
      const customized_reason = this.cancel_reason_obj.customized_reason;
      if (
        !this.cancel_reason_obj.category ||
        (this.cancel_reason_obj.category != this.cancel_category_customized_id && !this.cancel_reason_obj.reason) ||
        (this.cancel_reason_obj.category == this.cancel_category_customized_id &&
          !this.cancel_reason_obj.customized_reason)
      ) {
        this.$wt.notify({
          type: 'error',
          message: this.i18n('请选择/填写取消原因'),
        });
        return;
      }
      const params = {
        'tracking_ids[]': trackings,
        invalid_reason: customized_reason ? customized_reason : this.cancel_reason_obj.reason.name,
        cancel_reason_code: this.cancel_reason_obj.reason ? this.cancel_reason_obj.reason.code : null,
        ticket: this.ticket,
      };
      this.api.batchInvalidateOrder(params).then(
        res => {
          this.result = [];
          this.loading = false;
          const result_dict = res.data;
          Object.keys(result_dict).forEach(entry => {
            const results = result_dict[entry];
            results.forEach(el => {
              this.result.push({
                tracking_id: el.tracking_id,
                wish_standard_tracking_id: el.wish_standard_tracking_id,
                message: el.message,
                ticket: el.ticket,
                state: el.state,
                category: el.category,
                last_updated_time: el.last_updated_time,
              });
            });
          });
          this.cancel_order = false;
        },
        err => {
          this.cancel_loading = false;
          this.$wt.notify({
            type: 'error',
            message: err.msg,
          });
        },
      );
    },
  },
};
</script>
<style scoped>
.order-page {
  padding: 24px;
}
.card_row {
  padding-top: 20px;
  padding-left: 20px;
}
</style>
