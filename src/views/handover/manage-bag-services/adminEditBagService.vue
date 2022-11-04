<template>
  <v-container fluid>
    <v-container class="ma-12">
      <p v-if="is_create" class="h2 font-weight-black">{{ i18n('新建大包类型') }}</p>
      <p v-else class="h2 font-weight-black">{{ i18n('更新大包类型') }}</p>
      <v-card>
        <v-container fluid>
          <div class="search-row" style="max-width: 1200px">
            <wt-input
              width="250"
              class="mr"
              v-model="service_name"
              :label="i18n('英文代码')"
              placeholder="格式:UPSTREAM_TO_DOWNSTREAM"
            ></wt-input>
            <wt-input class="mr" width="250" v-model="service_name_cn" :label="i18n('中文名称')"></wt-input>
            <wt-select class="mr" v-model="upstream_member" :label="i18n('上游身份')">
              <wt-option v-for="item in handover_members" :key="item.code" :value="item.code" :label="item.name" />
            </wt-select>
            <wt-select class="mr" v-model="downstream_member" :label="i18n('下游身份')">
              <wt-option v-for="item in handover_members" :key="item.code" :value="item.code" :label="item.name" />
            </wt-select>
            <wt-select
              class="mr"
              v-model="handover_pusher"
              :label="i18n('交接状态推送方')"
              placeholder="说明:实际交接时的大包扫描方"
            >
              <wt-option v-for="item in handover_pushers" :key="item.code" :value="item.code" :label="item.name" />
            </wt-select>
            <wt-select
              class="mr"
              v-model="allow_downstream_creator"
              :label="i18n('下游可创建交接单')"
              placeholder="说明:是否允许交接时下游创建交接单"
            >
              <wt-option v-for="item in chooses" :key="item.value" :value="item.value" :label="item.text" />
            </wt-select>
            <wt-select
              class="mr"
              v-model="allow_update_ref"
              :label="i18n('使用ref大包号更新')"
              placeholder="说明:是否允许使用上游大包号更新大包状态"
            >
              <wt-option v-for="item in chooses" :key="item.value" :value="item.value" :label="item.text" />
            </wt-select>
          </div>
          <div class="search-row">
            <wt-button v-if="is_create" class="mr" :loading="operating" :disabled="operating" @click="editBagService">
              {{ i18n('Create') }}
            </wt-button>
            <wt-button v-else class="mr" :loading="operating" :disabled="operating" @click="editBagService">
              {{ i18n('Update') }}
            </wt-button>
            <wt-button @click="back" type="secondary">
              {{ i18n('Back') }}
            </wt-button>
          </div>
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
</template>
<script>
import req from '@utils/request';
import URL from '../url';
export default {
  name: 'adminEditBagService',
  props: ['bag_service', 'is_create'],
  data: function () {
    return {
      successDialog: false,
      access_token: null,
      handover_members: [
        { code: 1, name: this.i18n('商户') },
        { code: 2, name: this.i18n('物流商') },
        { code: 3, name: this.i18n('EPC仓库') },
        { code: 4, name: this.i18n('HUB仓库') },
        { code: 5, name: this.i18n('FBW仓库') },
        { code: 6, name: this.i18n('分拣中心') },
      ],
      handover_pushers: [
        { code: 1, name: this.i18n('上游') },
        { code: 2, name: this.i18n('下游') },
      ],
      chooses: [
        { value: false, text: this.i18n('否') },
        { value: true, text: this.i18n('是') },
      ],
      bag_type: null,
      service_name: '',
      service_name_cn: '',
      upstream_member: '',
      downstream_member: '',
      handover_pusher: '',
      allow_downstream_creator: false,
      allow_update_ref: false,
      operating: false,
    };
  },
  mounted: function () {
    if (this.bag_service != null) {
      this.bag_type = this.bag_service['bag_type'];
      this.service_name = this.bag_service['service_name'];
      this.service_name_cn = this.bag_service['service_name_cn'];
      this.allow_downstream_creator = this.bag_service['allow_downstream_creator'];
      this.allow_update_ref = this.bag_service['allow_update_ref'];
      for (let i = 0; i < this.handover_members.length; i++) {
        if (this.handover_members[i].name == this.bag_service.upstream_member)
          this.upstream_member = this.handover_members[i].code;
        if (this.handover_members[i].name == this.bag_service.downstream_member)
          this.downstream_member = this.handover_members[i].code;
      }
      for (let i = 0; i < this.handover_pushers.length; i++) {
        if (this.handover_pushers[i].code == this.bag_service.handover_pusher)
          this.handover_pusher = this.handover_pushers[i].code;
      }
      for (let i = 0; i < this.chooses.length; i++) {
        if (this.chooses[i].value == this.bag_service.allow_downstream_creator)
          this.allow_downstream_creator = this.chooses[i].value;
      }
      for (let i = 0; i < this.chooses.length; i++) {
        if (this.chooses[i].value == this.bag_service.allow_update_ref) this.allow_update_ref = this.chooses[i].value;
      }
    }
  },
  methods: {
    async editBagService() {
      const params = {
        bag_type: this.bag_type,
        service_name: this.service_name,
        service_name_cn: this.service_name_cn,
        upstream_member: this.upstream_member,
        downstream_member: this.downstream_member,
        handover_pusher: this.handover_pusher,
        allow_downstream_creator: this.allow_downstream_creator,
        allow_update_ref: this.allow_update_ref,
      };
      try {
        await req(URL.editPackingBagService, params);
        this.successDialog = true;
        this.operating = false;
      } catch (err) {
        this.operating = false;
        this.$wt.notify({
          type: 'error',
          message: err.message,
        });
      }
    },
    back: function () {
      this.$emit('back');
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
    width: 250px;
  }
}
::v-deep .wt-select {
  min-width: 250px;
  .wt-input-box {
    width: 250px;
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
button,
[type='button'],
[type='reset'],
[type='submit'],
[role='button'] {
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
    min-width: 250px;
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
