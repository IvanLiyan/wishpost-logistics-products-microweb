<template>
  <div class="user-page order-page">
    <v-container fluid>
      <v-container>
        <div class="h2 mb-4">{{ i18n('Restricted Products Management') }}</div>
        <v-card class="mb-4">
          <v-card-text>
            <div class="search-row mb">
              <wt-input class="mb" v-model="product_id" :label="i18n('Product ID')"></wt-input>
              <wt-select
                width="240"
                class="mr"
                valueKey="field_name"
                v-model="selected_country"
                :label="i18n('Country')"
              >
                <wt-option
                  v-for="item in meta.countries"
                  :key="item.country_name_cn"
                  :value="item.iso3"
                  :label="item.country_name_cn"
                />
              </wt-select>
            </div>
            <div class="search-row" style="justify-content: space-between">
              <div>
                <wt-button class="mr" @click="searchRestrictedProducts" :loading="loading">Search</wt-button>
                <wt-button class="mr" type="secondary" @click="createdProduct">Create</wt-button>
              </div>
            </div>
          </v-card-text>
        </v-card>
        <v-card class="mt-4">
          <v-card-title>
            Restricted Products
            <v-spacer></v-spacer>
          </v-card-title>
          <v-card-text>
            <v-data-table
              :items="result"
              :headers="headers"
              :loading="loading"
              :loading-text="i18n('Loading... Please wait')"
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
              <template v-slot:item.is_valid="{ item }">
                <span v-if="item.is_valid == true" class="green--text">True</span>
                <span v-if="item.is_valid == false" class="red--text">False</span>
              </template>
              <template v-slot:item.action="{ item }">
                <v-icon @click="deleteRestrictedProduct(item)" small>mdi-close-circle</v-icon>
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
          </v-card-text>
        </v-card>
      </v-container>
      <wt-dialog v-model="create_product" :title="i18n('Create restricted products')">
        <wt-input class="mb" v-model="new_product_id" :label="i18n('Product ID')"></wt-input>
        <wt-select class="mb" v-model="new_selected_country" :label="i18n('Country')">
          <wt-option
            v-for="item in meta.countries"
            :key="item.country_name_cn"
            :value="item.iso3"
            :label="item.country_name_cn"
          />
        </wt-select>
        <wt-input class="mb" v-model="reason" :label="i18n('Reason')"></wt-input>
        <div slot="footer">
          <wt-button type="primary" @click="createRestrictedProduct">{{ i18n('Create') }}</wt-button>
          <wt-button type="secondary" @click="create_product = false">{{ i18n('Cancel') }}</wt-button>
        </div>
      </wt-dialog>
    </v-container>
  </div>
</template>
<script>
import req from '@utils/request';
import URL from './url';
export default {
  name: 'restrictedProducts',
  data: function () {
    return {
      product_id: null,
      create_product: false,
      loading: false,
      selected_country: null,
      new_product_id: null,
      new_selected_country: null,
      reason: null,
      result: [],
      items_per_page: 20,
      meta: {
        countries: [],
      },
      headers: [
        { text: 'Product Id', align: 'center', value: 'product_id' },
        { text: 'Country', align: 'center', value: 'country_code' },
        { text: 'State', align: 'center', value: 'is_valid' },
        { text: 'Created time', align: 'center', value: 'created_time' },
        { text: 'Last updated time', align: 'center', value: 'last_updated_time' },
        { text: 'Reason', align: 'center', value: 'reason' },
        { text: 'Action', align: 'center', value: 'action' },
      ],
    };
  },
  mounted() {
    this.getMeta();
    this.searchRestrictedProducts();
  },
  methods: {
    async getMeta() {
      try {
        const { data } = await req(URL.getProductMeta);
        this.meta.countries = data.result.countries;
      } catch (err) {
        this.$wt.notify({
          type: 'error',
          message: err.message,
        });
      }
    },
    getParams() {
      const params = {};
      if (this.selected_country) {
        params['country_code'] = this.selected_country;
      }
      if (this.product_id) {
        params['product_id'] = this.product_id;
      }
      return params;
    },
    async searchRestrictedProducts() {
      this.loading = false;
      const params = this.getParams();
      this.loading = true;
      try {
        const { data } = await req(URL.searchRestrictedProducts, params);
        this.loading = false;
        this.result = data.results.rows;
      } catch (err) {
        this.loading = false;
        this.$wt.notify({
          type: 'error',
          message: err.message,
        });
      }
    },
    createdProduct() {
      this.create_product = true;
    },
    async createRestrictedProduct() {
      if (!this.new_product_id) {
        this.$wt.notify({
          type: 'error',
          message: '请填写产品ID',
        });
        return;
      }
      if (!this.new_selected_country) {
        this.$wt.notify({
          type: 'error',
          message: '请选择目的地国家',
        });
        return;
      }
      this.loading = true;
      try {
        await req(URL.createRestrictedProduct, {
          product_id: this.new_product_id,
          country_code: this.new_selected_country,
          reason: this.reason,
        });
        this.loading = false;
        await this.searchRestrictedProducts();
      } catch (err) {
        this.loading = false;
        this.$wt.notify({
          type: 'error',
          message: err.message,
        });
      }
      this.create_product = false;
    },
    async deleteRestrictedProduct(item) {
      try {
        await req(URL.deleteRestrictedProduct, {
          product_id: item.product_id,
          country_code: item.country_code,
        });
        await this.searchRestrictedProducts();
      } catch (err) {
        this.loading = false;
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
