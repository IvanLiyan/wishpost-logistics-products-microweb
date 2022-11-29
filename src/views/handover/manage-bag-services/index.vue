<template>
  <div class="user-page">
    <v-container v-if="show_edit_page == false" fluid>
      <v-container class="ma-12">
        <p class="h2 font-weight-black">{{ i18n('管理大包种类') }}</p>
        <v-card>
          <v-card-title>
            <wt-button type="secondary" @click.stop="show_create_dialog = true" @click="createBagService()">
              {{ i18n('新建') }}
            </wt-button>
          </v-card-title>
          <v-container fluid>
            <wt-table
              :data="bagServicesData"
              :emptyText="i18n('No data available')"
              :loading="searchingBagServices"
              :loadingMessage="i18n('Loading...')"
              :pagination="bag_services.length > 0 ? bagServicesPagination : false"
            >
              <wt-table-column prop="bag_type" :label="i18n('大包类型编号')" />
              <wt-table-column prop="service_name" :label="i18n('英文名称')" />
              <wt-table-column prop="service_name_cn" :label="i18n('中文名称')" />
              <wt-table-column prop="upstream_member" :label="i18n('上游身份')" />
              <wt-table-column prop="downstream_member" :label="i18n('下游身份')" />
              <wt-table-column :label="i18n('交接状态推送方')">
                <template slot-scope="scope">
                  <span v-if="scope.row.handover_pusher == 1">{{ scope.row.upstream_member }}</span>
                  <span v-else-if="scope.row.handover_pusher == 2">{{ scope.row.downstream_member }}</span>
                </template>
              </wt-table-column>
              <wt-table-column :label="i18n('下游可创建交接单')">
                <template slot-scope="scope">
                  <span v-if="scope.row.allow_downstream_creator == false" style="color: red">{{ i18n('否') }}</span>
                  <span v-else-if="scope.row.allow_downstream_creator == true" style="color: green">
                    {{ i18n('是') }}
                  </span>
                </template>
              </wt-table-column>
              <wt-table-column :label="i18n('使用ref大包号更新')">
                <template slot-scope="scope">
                  <span v-if="scope.row.allow_update_ref == false" style="color: red">{{ i18n('否') }}</span>
                  <span v-else-if="scope.row.allow_update_ref == true" style="color: green">{{ i18n('是') }}</span>
                </template>
              </wt-table-column>
              <wt-table-column :label="i18n('操作')" width="140">
                <template slot-scope="scope">
                  <wt-button @click="editBagService(scope.row)" style="margin: 10px">
                    {{ i18n('编辑') }}
                  </wt-button>
                  <wt-button type="secondary" @click="deleteBagService(scope.row)" style="margin: 10px">
                    {{ i18n('删除') }}
                  </wt-button>
                </template>
              </wt-table-column>
            </wt-table>
          </v-container>
        </v-card>
        <wt-dialog :title="i18n('操作成功')" v-model="successDialog">
          <div>{{ i18n('请等待wishpost审批生效') }}</div>
          <div slot="footer" class="demo-dialog-footer">
            <wt-button type="primary" @click="successDialog = !successDialog">OK</wt-button>
          </div>
        </wt-dialog>
      </v-container>
    </v-container>
    <admin-edit-bag-service
      v-if="show_edit_page == true"
      :is_create="create_bag_service"
      :bag_service="selected_bag_service"
      @back="back"
    ></admin-edit-bag-service>
  </div>
</template>
<script>
import req from '@utils/request';
import URL from '../url';
import adminEditBagService from './adminEditBagService';
export default {
  name: 'adminManageBagServices',
  components: { adminEditBagService },
  data: function () {
    return {
      successDialog: false,
      searchingBagServices: false,
      bagServicesCurrentPage: 1,
      bag_services: [],
      allBagServices: [],
      selected_bag_service: null,
      selected_index: -1,
      show_edit_page: false,
      create_bag_service: true,
      bagServicesPagination: {
        total: 0,
        showTotal: true,
        showSizeChanger: true,
        currentPage: this.bagServicesCurrentPage,
        onChange: this.onBagsPageChange,
      },
    };
  },
  computed: {
    bagServicesData() {
      if (this.bag_services.length > 0) {
        const data = this.bag_services.map(item => ({
          bag_type: item.bag_type,
          service_name: item.service_name,
          service_name_cn: item.service_name_cn,
          upstream_member: item.upstream_member,
          downstream_member: item.downstream_member,
          handover_pusher: item.handover_pusher,
          allow_downstream_creator: item.allow_downstream_creator,
          allow_update_ref: item.allow_update_ref,
        }));
        return data;
      } else {
        return [];
      }
    },
  },
  mounted() {
    this.getBagServices();
  },
  methods: {
    onBagServicesPageChange(current, size) {
      if (this.allBagServices.length > 0) {
        this.bagServicesPagination.total = this.allBagServices.length;
        const offset = (current - 1) * size;
        this.bag_services =
          offset + size >= this.allBagServices.length
            ? this.allBagServices.slice(offset, this.allBagServices.length)
            : this.allBagServices.slice(offset, offset + size);
      } else {
        this.bag_services = this.allBagServices;
      }
    },
    async getBagServices() {
      try {
        this.searchingBagServices = true;
        const { data } = await req(URL.getPackingBagServices, {});
        this.allBagServices = data.results;
        this.onBagServicesPageChange(1, 10);
        this.searchingBagServices = false;
      } catch (err) {
        this.$wt.notify({
          type: 'error',
          message: err.message,
        });
      }
    },
    createBagService: function () {
      this.selected_bag_service = null;
      this.create_bag_service = true;
      this.show_edit_page = true;
    },
    editBagService: function (item) {
      this.selected_index = this.bag_services.indexOf(item);
      this.selected_bag_service = Object.assign({}, item);
      this.create_bag_service = false;
      this.show_edit_page = true;
    },
    async deleteBagService(item) {
      try {
        await req(URL.deletePackingBagService, { bag_type: item.bag_type });
        this.successDialog = true;
        this.getBagServices();
        this.operating = false;
      } catch (err) {
        this.operating = false;
        this.$wt.notify({
          type: 'error',
          message: err.message,
        });
      }
    },
    back() {
      this.getBagServices();
      this.show_edit_page = false;
      this.selected_bag_service = null;
    },
  },
};
</script>
<style scoped lang="scss">
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
    min-width: 240px;
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
::v-deep .wt-confirm-wrapper .wt-dialog-wrapper .wt-dialog .wt-dialog-footer .wt-confirm-footer .wt-btn {
  &.wt-btn-primary {
    color: #fff !important;
  }
}
</style>
