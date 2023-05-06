<template>
  <div class="user-page order-page">
    <v-container fluid>
      <v-container>
        <div class="h2 mb-4">{{ i18n('批量操作订单') }}</div>
        <v-card class="mb-4">
          <v-card-text>
            <div class="search-row mb">
              <wt-select width="240" class="mr" valueKey="field_name" v-model="id_field_obj" :label="i18n('ID名称')">
                <wt-option v-for="item in id_field_names" :key="item.field_name" :value="item" :label="item.name" />
              </wt-select>
              <wt-select
                width="240"
                multiple
                placeholder="可多选"
                :filterable="true"
                class="mr"
                v-model="category"
                :label="i18n('搜索类型')"
              >
                <wt-option v-for="item in categories" :key="item.value" :value="item.value" :label="item.text" />
              </wt-select>
            </div>
            <div class="search-row mb">
              <wt-input
                width="760"
                v-model="tracking_ids"
                type="textarea"
                max-length="10000"
                :autosize="{ minRows: 2, maxRows: 6 }"
                label="请输入ids，多个id请换行分割，最多500单(标记丢件和取消订单只能输入tracking_id，搜索时可输入tracking_id或wosp_id)"
              ></wt-input>
            </div>
            <div class="search-row" style="justify-content: space-between">
              <div>
                <wt-button class="mr" @click="searchOrderRequest" :loading="loading">搜索</wt-button>
                <wt-button class="mr" type="secondary" @click="[markLost, (mark_lost = true)]">标记丢件</wt-button>
                <wt-button @click="[batchCancel, (cancel_order = true)]">取消订单</wt-button>
              </div>
              <div>
                <wt-button class="mr" type="secondary" @click="batch_mark_lost = true">上传标记丢件</wt-button>
                <wt-button @click="batch_cancel_order = true">上传取消订单</wt-button>
              </div>
            </div>
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
      <wt-dialog v-model="mark_lost" :title="i18n('选择订单类型')">
        <wt-input class="mb" v-model="ticket" :label="i18n('Ticket号')"></wt-input>
        <wt-select class="mb" v-model="lost_type" :label="i18n('类型')">
          <wt-option v-for="item in type_items" :key="item.value" :value="item.value" :label="item.text" />
        </wt-select>
        <div slot="footer">
          <wt-button type="primary" @click="markLostTrackings">{{ i18n('确定') }}</wt-button>
          <wt-button type="secondary" @click="mark_lost = false">{{ i18n('取消') }}</wt-button>
        </div>
      </wt-dialog>
      <wt-dialog v-model="cancel_order" :title="i18n('选择取消原因')">
        <wt-input class="mb" v-model="ticket" :label="i18n('Ticket号')"></wt-input>
        <wt-select class="mb" v-model="cancel_reason_obj.reason" valueKey="code" :label="i18n('取消原因')">
          <wt-option v-for="item in cancel_reason_list" :key="item.code" :value="item" :label="item.name" />
        </wt-select>
        <wt-input type="textarea" :label="i18n('描述')" v-model="cancel_reason_obj.customized_reason"></wt-input>
        <div slot="footer">
          <wt-button type="primary" @click="batchCancelOrders">{{ i18n('确定') }}</wt-button>
          <wt-button type="secondary" @click="cancel_order = false">{{ i18n('取消') }}</wt-button>
        </div>
      </wt-dialog>
      <wt-dialog v-model="batch_mark_lost" :title="i18n('选择订单类型')">
        <wt-input class="mb" v-model="ticket" :label="i18n('Ticket号')"></wt-input>
        <wt-select class="mb" v-model="lost_type" :label="i18n('类型')">
          <wt-option v-for="item in type_items" :key="item.value" :value="item.value" :label="item.text" />
        </wt-select>
        <div slot="footer">
          <wt-button type="primary" @click="upload_batch_mark_lost = true">{{ i18n('上传') }}</wt-button>
          <wt-button type="secondary" @click="batch_mark_lost = false">{{ i18n('取消') }}</wt-button>
        </div>
      </wt-dialog>
      <wt-dialog v-model="batch_cancel_order" :title="i18n('选择取消原因')">
        <wt-input class="mb" v-model="ticket" :label="i18n('Ticket号')"></wt-input>
        <wt-select class="mb" v-model="cancel_reason_obj.reason" valueKey="code" :label="i18n('取消原因')">
          <wt-option v-for="item in cancel_reason_list" :key="item.code" :value="item" :label="item.name" />
        </wt-select>
        <wt-input type="textarea" :label="i18n('描述')" v-model="cancel_reason_obj.customized_reason"></wt-input>
        <div slot="footer">
          <wt-button type="primary" @click="upload_batch_cancel_order = true">{{ i18n('上传') }}</wt-button>
          <wt-button type="secondary" @click="batch_cancel_order = false">{{ i18n('取消') }}</wt-button>
        </div>
      </wt-dialog>
      <wt-dialog v-model="upload_batch_mark_lost" :width="520" title="上传标记丢件文件">
        <div class="search-row" style="justify-content: space-between">
          <span>{{ i18n('上传XLS文件批量导入标记丢件订单') }}</span>
          <wt-button @click="downloadBatchUploadTemplate()" align="right">
            {{ i18n('下载模板') }}
          </wt-button>
        </div>
        <div style="width: 480px" class="mb">
          <excelFileReader v-model="batch_upload.data"></excelFileReader>
        </div>
        <div slot="footer">
          <wt-button type="primary" @click="batchUploadMarkLost">{{ i18n('确定') }}</wt-button>
          <wt-button type="secondary" @click="[(upload_batch_mark_lost = false), (batch_mark_lost = false)]">
            {{ i18n('取消') }}
          </wt-button>
        </div>
      </wt-dialog>
      <wt-dialog v-model="upload_batch_cancel_order" :width="520" title="上传取消订单文件">
        <div class="search-row" style="justify-content: space-between">
          <span>{{ i18n('上传XLS文件批量导入取消订单') }}</span>
          <wt-button @click="downloadBatchUploadTemplate()" align="right">
            {{ i18n('下载模板') }}
          </wt-button>
        </div>
        <div style="width: 480px" class="mb">
          <excelFileReader v-model="batch_upload.data"></excelFileReader>
        </div>
        <div slot="footer">
          <wt-button type="primary" @click="batchUploadCancelOrder">{{ i18n('确定') }}</wt-button>
          <wt-button type="secondary" @click="[(upload_batch_cancel_order = false), (batch_cancel_order = false)]">
            {{ i18n('取消') }}
          </wt-button>
        </div>
      </wt-dialog>
    </v-container>
  </div>
</template>
<script>
import req from '@utils/request';
import URL from './url';
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
      id_field_obj: {},
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
      cancel_reason_list: [],
      cancel_customized_id: 69999,
      items_per_page: 20,
      cancel_reason_obj: {
        order_id: '',
        reason: {},
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
    async initParams() {
      try {
        const { data } = await req(URL.getAdminCancelOrderReasonList);
        this.cancel_reason_list.push({
          id: null,
          name: this.i18n('请选择'),
        });
        this.cancel_reason_list = this.cancel_reason_list.concat(data);
      } catch (err) {
        this.$wt.notify({
          type: 'error',
          message: err.message,
        });
      }
    },
    getParams() {
      const params = {
        'category[]': this.category,
      };
      if (this.id_field_obj && this.tracking_ids.length > 0) {
        const trackings = this.tracking_ids.split(/\s+/);
        params[this.id_field_obj.field_name] = trackings;
      }
      return params;
    },
    async searchOrderRequest() {
      this.loading = false;
      const params = this.getParams();
      this.loading = true;
      try {
        const { data } = await req(URL.searchOrderRequest, params);
        this.loading = false;
        this.result = data.result;
      } catch (err) {
        this.loading = false;
        this.$wt.notify({
          type: 'error',
          message: err.message,
        });
      }
    },
    markLost() {
      this.mark_lost = true;
    },
    batchCancel() {
      this.cancel_order = true;
    },
    async batchUploadMarkLost() {
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
      try {
        const { data } = await req(URL.markLostOrders, params);
        this.upload_batch_mark_lost = false;
        this.batch_mark_lost = false;
        this.loading = false;
        this.result = data.result;
      } catch (err) {
        this.loading = false;
        this.$wt.notify({
          type: 'error',
          message: err.message,
        });
        this.upload_batch_mark_lost = false;
        this.batch_mark_lost = false;
      }
    },
    async batchUploadCancelOrder() {
      this.batch_upload.error = '';
      this.batch_upload.msg = '';
      this.batch_upload.loading = true;
      const tracking_ids = [];
      this.batch_upload.data[0].data.forEach(entry => tracking_ids.push(entry.tracking_id));
      const customized_reason = this.cancel_reason_obj.customized_reason;
      if (
        !this.cancel_reason_obj.reason ||
        (this.cancel_reason_obj.reason.code === this.cancel_customized_id && !this.cancel_reason_obj.customized_reason)
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
      try {
        const { data } = await req(URL.batchInvalidateOrder, params);
        this.result = [];
        this.loading = false;
        const result_dict = data;
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
      } catch (err) {
        this.loading = false;
        this.$wt.notify({
          type: 'error',
          message: err.message,
        });
        this.upload_batch_mark_lost = false;
        this.batch_mark_lost = false;
      }
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
    async markLostTrackings() {
      if (!this.lost_type) {
        this.$wt.notify({
          type: 'error',
          message: '请选择类型',
        });
        return;
      }
      const trackings = this.tracking_ids.split(/\s+/);
      this.loading = true;
      try {
        const { data } = await req(URL.markLostOrders, {
          tracking_ids: trackings,
          lost_type: this.lost_type,
          ticket: this.ticket,
        });
        this.loading = false;
        this.result = data.result;
      } catch (err) {
        this.loading = false;
        this.$wt.notify({
          type: 'error',
          message: err.message,
        });
      }
      this.mark_lost = false;
    },
    async batchCancelOrders() {
      const trackings = this.tracking_ids.split(/\s+/);
      const customized_reason = this.cancel_reason_obj.customized_reason;
      if (
        !this.cancel_reason_obj.reason ||
        (this.cancel_reason_obj.reason.code === this.cancel_customized_id && !this.cancel_reason_obj.customized_reason)
      ) {
        this.$wt.notify({
          type: 'error',
          message: this.i18n('请选择/填写取消原因'),
        });
        return;
      }
      if (!this.ticket) {
        this.$wt.notify({
          type: 'error',
          message: this.i18n('请填写ticket号'),
        });
        return;
      }
      const params = {
        'tracking_ids[]': trackings,
        invalid_reason: customized_reason ? customized_reason : this.cancel_reason_obj.reason.name,
        cancel_reason_code: this.cancel_reason_obj.reason ? this.cancel_reason_obj.reason.code : null,
        ticket: this.ticket,
      };
      try {
        const { data } = await req(URL.batchInvalidateOrder, params);
        this.result = [];
        this.loading = false;
        const result_dict = data;
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
      } catch (err) {
        this.cancel_loading = false;
        this.$wt.notify({
          type: 'error',
          message: err.message,
        });
      }
    },
  },
};
</script>
<style lang="scss" scoped>
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
.mb {
  margin-bottom: 30px;
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
