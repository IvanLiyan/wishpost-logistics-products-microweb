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
            <v-data-table
              :headers="headers"
              :items="bag_services"
              :loading-text="i18n('Loading... Please wait')"
              :footer-props="{
                prevIcon: 'keyboard_arrow_left',
                nextIcon: 'keyboard_arrow_right',
                itemsPerPageText: i18n('Rows per page'),
                itemsPerPageOptions: [20, 40],
              }"
              item-key="bag_type"
            >
              <template v-slot:item.handover_pusher="{ item }">
                <span v-if="item.handover_pusher == 1">{{ item.upstream_member }}</span>
                <span v-else-if="item.handover_pusher == 2">{{ item.downstream_member }}</span>
              </template>
              <template v-slot:item.allow_downstream_creator="{ item }">
                <span v-if="item.allow_downstream_creator == false" style="color: red">{{ i18n('否') }}</span>
                <span v-else-if="item.allow_downstream_creator == true" style="color: green">{{ i18n('是') }}</span>
              </template>
              <template v-slot:item.allow_update_ref="{ item }">
                <span v-if="item.allow_update_ref == false" style="color: red">{{ i18n('否') }}</span>
                <span v-else-if="item.allow_update_ref == true" style="color: green">{{ i18n('是') }}</span>
              </template>
              <template v-slot:item.action="{ item }">
                <wt-button @click="editBagService(item)" style="margin: 10px">
                  {{ i18n('编辑') }}
                </wt-button>
                <wt-button type="secondary" @click="deleteBagService(item)" style="margin: 10px">
                  {{ i18n('删除') }}
                </wt-button>
              </template>
            </v-data-table>
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
      headers: [
        { text: this.i18n('大包类型编号'), value: 'bag_type' },
        { text: this.i18n('英文名称'), value: 'service_name' },
        { text: this.i18n('中文名称'), value: 'service_name_cn' },
        { text: this.i18n('上游身份'), value: 'upstream_member' },
        { text: this.i18n('下游身份'), value: 'downstream_member' },
        { text: this.i18n('交接状态推送方'), value: 'handover_pusher' },
        { text: this.i18n('下游可创建交接单'), value: 'allow_downstream_creator' },
        { text: this.i18n('使用ref大包号更新'), value: 'allow_update_ref' },
        { text: this.i18n('操作'), value: 'action' },
      ],
      bag_services: [],
      selected_bag_service: null,
      selected_index: -1,
      show_edit_page: false,
      create_bag_service: true,
    };
  },
  mounted() {
    this.getBagServices();
  },
  methods: {
    async getBagServices() {
      try {
        const { data } = await req(URL.getPackingBagServices, {});
        this.bag_services = data.results;
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
::v-deep .wt-confirm-wrapper .wt-dialog-wrapper .wt-dialog .wt-dialog-footer .wt-confirm-footer .wt-btn {
  &.wt-btn-primary {
    color: #fff !important;
  }
}
</style>
