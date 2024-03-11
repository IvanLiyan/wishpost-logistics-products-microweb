import axios from 'axios';
import { global_router } from './components';
const _axios_call_p = async function (config, loader) {
  try {
    const resp = await axios(config);
    if (loader) {
      loader.hide();
    }
    return Promise.resolve(resp.data);
  } catch (error) {
    if (loader) loader.hide();
    if (error.response && error.response.status == 401 && global_router) {
      // user need to log in
      console.log('err', error.response.data.msg);
      global_router.push('/login?return_url=' + global_router.currentRoute.fullPath);
      return;
    }
    if (error.response && Object.prototype.toString.call(error.response.data) === '[object Object]') {
      return Promise.reject(error.response.data);
    } else {
      console.error(error);
      // todo: handle 502 bad
      //  gateway properly
      // need more informative messages
      return Promise.reject(error);
    }
  }
};
export default {
  _call_p: function (method, path, params, loader, responseType) {
    if (loader) loader.show();
    let data = {};
    if (method === 'post' && params instanceof FormData) {
      data = params;
    } else {
      data = [];
      for (var i = 0; i < params.length; i++) {
        if (params[i]) {
          data.push(params[i]);
        }
      }
      //     data = _.pickBy(params, e => {
      //       return !_.isNil(e);
      //     });
    }
    const xsrf_token = $('#xsrf-container').find('input').val();
    const config = {
      method: method,
      url: '/api/' + path,
      headers: {
        'X-XSRFToken': xsrf_token,
      },
    };
    if (method === 'get') {
      config['params'] = data;
    } else {
      config['data'] = data;
    }
    if (responseType) {
      config['responseType'] = responseType;
    }
    return _axios_call_p(config, loader);
  },
  _get_blob: function (path, params, loader) {
    return this._call_p('get', path, params, loader, 'blob');
  },
  _post_blob: function (path, params, loader) {
    return this._call_p('post', path, params, loader, 'blob');
  },
  _get: function (path, params, loader) {
    return this._call_p('get', path, params, loader);
  },
  _put: function (path, params, loader) {
    return this._call_p('put', path, params, loader);
  },
  _post: function (path, params, loader) {
    return this._call_p('post', path, params, loader);
  },
  _delete: function (path, params, loader) {
    return this._call_p('delete', path, params, loader);
  },
  setLang: function (locale) {
    return this._post('set-locale', {
      locale: locale,
    });
  },
  getUser: function () {
    return this._post('get-user', {});
  },
  userHomePage: function () {
    return this._post('get-user-homepage', {});
  },
  getContext: function () {
    return this._post('get-context', {});
  },
  getWishpostUser: function (username, start, count) {
    return this._post('user/get', {
      username: username,
      start: start,
      count: count,
    });
  },
  getWishpostUsers: function (params) {
    return this._post('user/get', params);
  },
  saveUserBusinessLine: function (params) {
    return this._post('user/edit-business-line', params);
  },
  getAnnouncements: function (query, tag_id, start, count, is_cn) {
    return this._post('static-content/fetch', {
      query: query,
      tag_id: tag_id,
      start: start,
      count: count,
      type: 'announcements',
      is_cn: is_cn,
    });
  },
  getAnnouncement: function (id, is_cn) {
    return this._post('static-content/fetch', {
      id: id,
      type: 'announcements',
      is_cn: is_cn,
    });
  },
  getAnnouncementTags: function (is_cn) {
    return this._post('announcement-tag/get', {
      is_cn: is_cn,
    });
  },
  saveAnnouncementTag: function (params) {
    return this._post('announcement-tag/save', params);
  },
  deleteAnnouncementTag: function (tag_id) {
    return this._post('announcement-tag/delete', {
      tag_id: tag_id,
    });
  },
  getStaticContent: function (type, is_cn) {
    return this._post('static-content/fetch', {
      type: type,
      is_cn: is_cn,
    });
  },
  getBusinessLines: function () {
    return this._post('business-line/get', {});
  },
  saveBusinessLine: function (params) {
    return this._post('business-line/save', params);
  },
  deleteBusinessLine: function (id) {
    return this._post('business-line/delete', {
      id: id,
    });
  },
  searchTracking: function (params) {
    return this._post('tracking/search', params);
  },
  getTrackingStatusGroup: function () {
    return this._post('tracking/status-group', {});
  },
  updateTrackingCheckpointvisibility: function (params) {
    return this._post('tracking/update-checkpoint-visibility', params);
  },
  getCountryAndProvinceToCity: function () {
    return this._post('country_province_to_city/get', {});
  },
  checkUsernameUniqueness: function (email) {
    return this._post('signup/user-uniqueness', {
      email: email,
    });
  },
  verifyMerchantId: function (merchant_id) {
    return this._post('signup/verify-merchant-id', {
      wish_merchant_id: merchant_id,
    });
  },
  submitSignUp: function (params) {
    return this._post('signup/submit', params);
  },
  getSavedUsername: function () {
    return this._post('get-saved-username', {});
  },
  submitLogin: function (params) {
    return this._post('login', params);
  },
  tfaGenToken: function (params) {
    return this._post('tfa/gen-token', params);
  },
  genVerifyToken: function (params) {
    return this._post('gen-verify-token', params);
  },
  verifyToken: function (params) {
    return this._post('verify-token', params);
  },
  forgetPasseord: function (params) {
    return this._post('forget-password', params);
  },
  changePhone: function (params) {
    return this._post('change-phone-v2', params);
  },
  getAdmin: function () {
    return this._post('admin/get');
  },
  editAdmin: function (params) {
    return this._post('admin/edit', params);
  },
  batchEnableAdmin: function (user_ids) {
    return this._post('admin/batch-enable', {
      'uids[]': user_ids,
    });
  },
  batchDisableAdmin: function (user_ids) {
    return this._post('admin/batch-disable', {
      'uids[]': user_ids,
    });
  },
  enableAdmin: function (params) {
    return this._post('admin/enable', params);
  },
  disableAdmin: function (params) {
    return this._post('admin/disable', params);
  },
  copyFromAdmin: function (params) {
    return this._post('admin/copy-from', params);
  },
  getRoleGroups: function () {
    return this._post('admin/role_group/get');
  },
  editRoleGroup: function (params) {
    return this._post('admin/role_group/edit', params);
  },
  deleteRoleGroup: function (params) {
    return this._post('admin/role_group/delete', params);
  },
  getAdminRoles: function (params) {
    return this._post('admin/role/get', params);
  },
  editAdminRole: function (params) {
    return this._post('admin/role/edit', params);
  },
  deleteAdminRole: function (params) {
    return this._post('admin/role/delete', params);
  },
  getAdminPermissionGroups: function (params) {
    return this._post('admin/permission-group/get', params);
  },
  editAdminPermissionGroup: function (params) {
    return this._post('admin/permission-group/edit', params);
  },
  deleteAdminPermissionGroup: function (params) {
    return this._post('admin/permission-group/delete', params);
  },
  getPermissions: function (params) {
    return this._post('admin/permissions/get', params);
  },
  editPermission: function (params) {
    return this._post('admin/permissions/edit', params);
  },
  deletePermission: function (params) {
    return this._post('admin/permissions/delete', params);
  },
  getResources: function (params) {
    return this._post('admin/resources/get', params);
  },
  queryTracking: function (params) {
    return this._post('dom-tracking/query', params);
  },
  getOrderTrafficControlMeta: function () {
    return this._post('order-traffic-control-config/order_traffic_control/meta');
  },
  getOrderTrafficControlList: function (params) {
    return this._post('order-traffic-control-config/order_traffic_control/list', params);
  },
  getOrdersMeta: function () {
    return this._post('order/get-meta');
  },
  searchOrders: function (params) {
    return this._post('order/list', params);
  },
  searchOrdersByIDs: function (params) {
    return this._post('order/get-by-ids', params);
  },
  markLostOrders: function (params) {
    return this._post('order/mark-lost', params);
  },
  searchOrderRequest: function (params) {
    return this._post('order-request/search', params);
  },
  getProductMeta: function () {
    return this._post('restricted-product/get-meta');
  },
  searchRestrictedProducts: function (params) {
    return this._post('restricted-product/get', params);
  },
  createRestrictedProduct: function (params) {
    return this._post('restricted-product/create', params);
  },
  deleteRestrictedProduct: function (params) {
    return this._post('restricted-product/delete', params);
  },
  exportOrders: function (params) {
    return this._post('export-orders', params);
  },
  checkExportOrderStatus: function (params) {
    return this._post('check-export-orders', params);
  },
  getUserOrderById: function (params) {
    return this._post('order/view', params);
  },
  batchDeleteOrderTrafficControl: function (params) {
    return this._post('order-traffic-control-config/order_traffic_control/batch-delete', params);
  },
  saveOrderTrafficControl: function (params) {
    return this._post('order-traffic-control-config/order_traffic_control/save', params);
  },
  batchAddTrafficControl: function (params) {
    return this._post('order-traffic-control-config/order_traffic_control/batch-add', params);
  },
  getSensitiveWords: function (params) {
    return this._post('field_valification_words/get', params);
  },
  getSensitiveWordCondition: function () {
    return this._post('field_valification_words/condition/get', {});
  },
  getReportsList: function (params) {
    return this._post('wosp-warehouse-inventory-reports', params);
  },
  getWarehouseList: function () {
    return this._post('wosp-warehouse/list', {});
  },
  getFBWCnOrderManageData: function () {
    return this._post('fbwcn-order/manage-data', {});
  },
  updateFBWCnOrderAddress: function (params) {
    return this._post('fbwcn-order-management', params);
  },
  getFBWCnOrders: function (params) {
    return this._post('fbwcn-order-list', params);
  },
  getWMSCombineOrderInfo: function (params) {
    return this._post('combine_order/search_wms_combine_order', params);
  },
  getCombineOrderAllRelation: function (params) {
    return this._post('combine_order/search_all_related', params);
  },
  getCombineOrderInfo: function (params) {
    return this._post('combine_order/search', params);
  },
  showWeightInfo: function (params) {
    return this._post('combine_order/show_weight_info', params);
  },
  showCombinedWeightInfo: function (params) {
    return this._post('combine_order/show_combined_weight_info', params);
  },
  showEPCProductIDInfo: function (params) {
    return this._post('combine_order/show_epc_product_id_info', params);
  },
  searchEPCStatus: function (params) {
    return this._post('combine_order/search_epc_status', params);
  },
  queryEPC: function (params) {
    return this._post('combine-order/query-epc', params);
  },
  searchEPCCombineOrderTD: function (params) {
    return this._post('epc_combine_order_td_search', params);
  },
  searchMerchantOrder: function (params) {
    return this._post('merchant-order/get-one', params);
  },
  getMerchantOrderUpdateReason: function () {
    return this._post('merchant-order/get-update-reason', {});
  },
  getZipcode: function (params) {
    return this._post('google/get_zipcode', params);
  },
  saveMerchantOrder: function (params) {
    return this._post('merchant-order/save-one', params);
  },
  getTempAccessToken: function () {
    return this._post('oauth/temp-access-token', {});
  },
  getCarrierApikey: function () {
    return this._post('carrier-api-key', {});
  },
  adminGetStandardInsurance: function (params) {
    return this._post('insurance/search-standard-insurance', params);
  },
  searchRefundTrack: function (params) {
    return this._post('standard_insurance/search_refund_track', params);
  },
  exportStandardRefundReport: function (params) {
    return this._post('standard_insurance/search_refund_report', params);
  },
  getStandardDownloadJobInfo: function (params) {
    return this._post('get-standard-download-job-info', params);
  },
  createInsuranceCompany: function (params) {
    return this._post('insurance/create-insurance-company', params);
  },
  getInsuranceCompanyList: function () {
    return this._post('insurance/get-insurance-company-list', {});
  },
  getInsuranceCompanyInfo: function (params) {
    return this._post('insurance/get_insurance_company_info', params);
  },
  saveInsuranceCompanyInfo: function (params) {
    return this._post('insurance/save_insurance_company_info', params);
  },
  getInsuranceCompanyChangesLog: function (params) {
    return this._post('insurance/get_insurance_company_changes_log', params);
  },
  logFileUploadError: function (params) {
    return this._post('log-file-upload-error', params);
  },
  generateSignedUploadURL: function (params) {
    return this._post('generate-signed-upload-url', params);
  },
  createBatchGetCombinedWeightJob: function (params) {
    return this._post('combine_order/create_batch_get_combined_weight_job', params);
  },
  getBatchGetCombinedWeightJobStatus: function (params) {
    return this._post('combine_order/get_batch_get_combined_weight_job_status', params);
  },
  prohibitEPCDisputeUser: function (params) {
    return this._post('dispute/prohibited_epc_dispute_user', params);
  },
  uploadProductWhitelist: function (params) {
    return this._post('warehouse/upload_product_whitelist', params);
  },
  getEPCDisputeToolMetadata: function () {
    return this._post('dispute/get-epc-dispute-tool-metadata', {});
  },
  downloadEPCDispute: function (params) {
    return this._post('dispute/download_epc_dispute', params);
  },
  uploadEPCDispute: function (params) {
    return this._post('dispute/upload_epc_dispute', params);
  },
  epcToolLoadData: function () {
    return this._post('combine_order/epc_tool_load_data', {});
  },
  epcWarehouseLoadData: function () {
    return this._post('combine_order/epc_warehouse_load_data', {});
  },
  epcWarehouseAllocationLoadData: function () {
    return this._post('combine_order/epc_warehouse_allocation_load_data', {});
  },
  getLatestRule: function (params) {
    return this._post('combine_order/latest_rule', params);
  },
  saveRule: function (params) {
    return this._post('combine_order/save_rule', params);
  },
  getWarehouseSupportCountries: function (params) {
    return this._post('combine_order/supporting_countries', params);
  },
  manageCountryConfig: function (params) {
    return this._post('combine_order/manage_country_config', params);
  },
  saveCountryConfig: function (params) {
    return this._post('combine_order/save_country_config', params);
  },
  adminAScan: function (params) {
    return this._post('combine_order/admin_ascan', params);
  },
  adminCombine: function (params) {
    return this._post('combine_order/admin_combine', params);
  },
  getTrackingOrder: function (params) {
    return this._post('tracking/get-order', params);
  },
  createBatchChangeWarehouseCombineJob: function (params) {
    return this._post('combine_order/create_batch_change_warehouse_combine_job', params);
  },
  getBatchChangeWarehouseCombineJobStatus: function (params) {
    return this._post('combine_order/get_batch_change_warehouse_combine_job_status', params);
  },
  adminRevertAScan: function (params) {
    return this._post('combine_order/admin_revert_ascan', params);
  },
  checkCombinedChannel: function (params) {
    return this._post('combine_order/check_combined_channel', params);
  },
  changeWarehouse: function (params) {
    return this._post('combine_order/change_warehouse', params);
  },
  returnToMerchant: function (params) {
    return this._post('combine_order/return_to_merchant', params);
  },
  batchDownloadMerchantOrderInfo: function (params) {
    return this._post('combine_order/batch_download_merchant_order_info', params);
  },
  batchChangeMerchantOrderInfo: function (params) {
    return this._post('combine_order/batch_change_merchant_order_info', params);
  },
  syncOrderDeclaredValue: function (params) {
    return this._post('combine_order/sync_order_declared_value', params);
  },
  adminCombineOrder: function (params) {
    return this._post('combine_order/admin_combine_order', params);
  },
  adminUnbindOrder: function (params) {
    return this._post('combine_order/admin_unbind_order', params);
  },
  adminInitializeOrder: function (params) {
    return this._post('combine_order/admin_initialize_order', params);
  },
  adminAddReturnCheckpoint: function (params) {
    return this._post('combine_order/admin_add_return_checkpoint', params);
  },
  adminUnsetFirstMileWeight: function (params) {
    return this._post('combine_order/admin_unset_first_mile_weight', params);
  },
  adminSkipFullSetValidation: function (params) {
    return this._post('combine_order/admin_skip_full_set_validation', params);
  },
  batchGetWarehouseMeta: function () {
    return this._post('combine_order/batch_get_warehouse_meta', {});
  },
  createEPCWarehouse: function (params) {
    return this._post('combine_order/create_epc_warehouse', params);
  },
  batchChangeWarehouseMeta: function (params) {
    return this._post('combine_order/batch_change_warehouse_meta', params);
  },
  getWarehouseChangeLog: function (params) {
    return this._post('combine_order/get_warehouse_change_log', params);
  },
  manageWarehouse: function (params) {
    return this._post('combine_order/manage_warehouse', params);
  },
  saveWarehouseInfo: function (params) {
    return this._post('combine_order/save_warehouse_info', params);
  },
  getPreOrderByXls: function (params) {
    return this._post('pre_order/get-pre-order-by-xls', params);
  },
  changePreOrderByXls: function (params) {
    return this._post('pre_order/change-pre-order-by-xls', params);
  },
  reserveGoogleZipcode: function (params) {
    return this._post('pre_order/reserve-google-zipcode', params);
  },
  getCancelOrderReasonCategoryList: function () {
    return this._post('cancel_order_reason/get-category-list');
  },
  addCancelOrderReasonCategory: function (new_category) {
    return this._post('cancel_order_reason/add-category', {
      new_category: new_category,
    });
  },
  addCancelOrderReasonReason: function (category_id, reason) {
    return this._post('cancel_order_reason/add-reason', {
      category_id: category_id,
      reason: reason,
    });
  },
  removeCancelOrderReasonReason: function (category_id, reason_id) {
    return this._post('cancel_order_reason/remove-reason', {
      category_id: category_id,
      reason_id: reason_id,
    });
  },
  invalidateOrder: function (params) {
    return this._post('order/invalidate', params);
  },
  batchInvalidateOrder: function (params) {
    return this._post('order/batch-invalidate', params);
  },
  getCarriers: function () {
    return this._post('logistics-components-config/carrier/list');
  },
  getCarrier: function (params) {
    return this._post('logistics-components-config/carrier/show', params);
  },
  saveCarrier: function (params) {
    return this._post('logistics-components-config/carrier/save', params);
  },
  deleteCarrier: function (params) {
    return this._post('logistics-components-config/carrier/delete', params);
  },
  loginAsCarrier: function (params) {
    return this._post('user/login-as-user', params);
  },
  bypassVerification: function (params) {
    return this._post('bypass-verification', params);
  },
  setTestUser: function (params) {
    return this._post('set-testuser', params);
  },
  validateEmail: function (params) {
    return this._post('validate/email', params);
  },
  validatePhone: function (params) {
    return this._post('validate/phone', params);
  },
  disableUser: function (params) {
    return this._post('user/disable', params);
  },
  enableUser: function (params) {
    return this._post('user/enable', params);
  },
  adminUnbindBankCard: function (params) {
    return this._post('bank-card/admin-unbind', params);
  },
  editUser: function (params) {
    return this._post('user/edit', params);
  },
  getBindMerchants: function (params) {
    return this._post('user/get-bind-merchant', params);
  },
  exportUsers: function (params) {
    return this._post('export-users', params);
  },
  checkExportUsers: function (params) {
    return this._post('check-export-users', params);
  },
  getShippingProudcts: function (params) {
    return this._post('logistics-components-config/shipping-product/list', params);
  },
  deleteShippingProudct: function (params) {
    return this._post('logistics-components-config/shipping-product/delete', params);
  },
  getShippingProduct: function (params) {
    return this._post('logistics-components-config/shipping-product/show', params);
  },
  saveShippingProduct: function (params) {
    return this._post('logistics-components-config/shipping-product/save', params);
  },
  getShippingProductMeta: function () {
    return this._post('logistics-components-config/shipping-product/meta');
  },
  getChannelShippingProductMappingList: function (params) {
    return this._post('logistics-components-config/channel-shipping-product-mapping/list', params);
  },
  getChannelShippingProductMeta: function () {
    return this._post('logistics-components-config/channel-shipping-product-mapping/meta');
  },
  deleteChannelShippingProductMapping: function (params) {
    return this._post('logistics-components-config/channel-shipping-product-mapping/delete', params);
  },
  saveChannelShippingProductMapping: function (params) {
    return this._post('logistics-components-config/channel-shipping-product-mapping/save', params);
  },
  getWospServiceMapping: function (params) {
    return this._post('routing-config/service-mapping/list', params);
  },
  getWospServices: function (params) {
    return this._post('logistics-components-config/wosp-service/list', params);
  },
  saveWospService: function (params) {
    return this._post('logistics-components-config/wosp-service/save', params);
  },
  deleteWospService: function (params) {
    return this._post('logistics-components-config/wosp-service/delete', params);
  },
  getWospService: function (params) {
    return this._post('logistics-components-config/wosp-service/show', params);
  },
  getWospServiceMeta: function () {
    return this._post('logistics-components-config/wosp-service/meta');
  },
  importLogisticsConfigFromFile: function (params) {
    return this._post('logistics-config/import-from-file', params);
  },
  getIdCardRequest: function (params) {
    return this._post('check-id-card', params);
  },
  getBarcodeTypes: function () {
    return this._post('manage-barcode-range/get-barcode-types');
  },
  getBarcodeByType: function (params) {
    return this._post('manage-barcode-range/get-barcode', params);
  },
  updateBarcode: function (params) {
    return this._post('manage-barcode-range/update-barcode', params);
  },
  createNewRange: function (params) {
    return this._post('manage-barcode-range/create-range', params);
  },
  batchUploadRanges: function (params) {
    return this._post('manage-barcode-range/batch-upload-ranges', params);
  },
  removeRange: function (params) {
    return this._post('manage-barcode-range/remove-range', params);
  },
  getPreOrderInfo: function (params) {
    return this._post('pre_order/get-pre-order-info', params);
  },
  getPreOrderInfoByIds: function (params) {
    return this._post('pre_order/get-pre-order-info-by-ids', params);
  },
  getPreOrderWeightInfo: function (params) {
    return this._post('pre_order/get-pre-order-weight-info', params);
  },
  changePreOrderInfo: function (params) {
    return this._post('pre_order/change-pre-order-info', params);
  },
  getRefundMerchantTransaction: function (params) {
    return this._post('refund_merchant_transaction/get', params);
  },
  refundMerchantTransaction: function (params) {
    return this._post('refund_merchant_transaction/refund', params);
  },
  managePenaltyLoadData: function () {
    return this._post('combine_order/epc_manage_penalty_load_data', {});
  },
  getEPCPenaltyItem: function (params) {
    return this._post('combine_order/get_epc_penalty_item', params);
  },
  searchEPCLastMileOrderIds: function (params) {
    return this._post('epc_lastmile_order_ids_search', params);
  },
  getEPCProductTagCSReviewQueueType: function () {
    return this._post('warehouse/get_epc_product_tag_cs_review_queue', {});
  },
  csClaimEPCProductInqueuedTag: function (params) {
    return this._post('warehouse/cs_claim_epc_product_inqueued_tag', params);
  },
  csGetEPCProductTagReviewDetails: function (params) {
    return this._post('warehouse/cs_get_epc_product_tag_review_details', params);
  },
  csUploadEPCProductTagReviewDetails: function (params) {
    return this._post('warehouse/cs_upload_epc_product_tag_review_details', params);
  },
  csFinishEPCProductTagReviewDetails: function (params) {
    return this._post('warehouse/cs_finish_epc_product_tag_review_details', params);
  },
  batchGetFailedPreCombinedOrder: function (params) {
    return this._post('combine_order/admin_batch_get_failed_pre_combined_order', params);
  },
  countryLoadData: function () {
    return this._post('combine_order/country_load_data', {});
  },
  manageCountryLimit: function (params) {
    return this._post('combine_order/manage_country_limit', params);
  },
  saveCountryLimit: function (params) {
    return this._post('combine_order/save_country_limit', params);
  },
  /* Router Area */
  saveRouterArea: function (params) {
    return this._post('logistics/router-area/save', params);
  },
  searchRouterArea: function (params) {
    return this._post('logistics/router-area/search', params);
  },
  checkRouterArea: function (params) {
    return this._post('logistics/router-area/check', params);
  },
  getCountryLimitChangeLog: function (params) {
    return this._post('combine_order/get_country_limit_change_log', params);
  },
  createCountryLimit: function (params) {
    return this._post('combine_order/create_country_limit', params);
  },
  batchGetCountryLimit: function () {
    return this._post('combine_order/batch_get_country_limit', {});
  },
  batchChangeCountryLimit: function (params) {
    return this._post('combine_order/batch_change_country_limit', params);
  },
  /* RFP */
  exportRfpQuotations: function (params) {
    return this._post('rfp/bidding/export-quotations', params);
  },
  getRfpMeta: function () {
    return this._post('rfp/meta/detail');
  },
  createRfpBidding: function (params) {
    return this._post('rfp/bidding/create', params);
  },
  batchCreateRfpBidding: function (params) {
    return this._post('rfp/bidding/batch-create', params);
  },
  editRfpBidding: function (params) {
    return this._post('rfp/bidding/edit', params);
  },
  deleteRfpBidding: function (params) {
    return this._post('rfp/bidding/delete', params);
  },
  getRfpBidding: function (params) {
    return this._post('rfp/bidding/view', params);
  },
  getBiddingScore: function (params) {
    return this._post('rfp/bidding/score', params);
  },
  setBiddingDeadline: function (params) {
    return this._post('rfp/bidding/deadline', params);
  },
  modifyBiddingDeadline: function (params) {
    return this._post('rfp/bidding/modify-date', params);
  },
  awardBidding: function (params) {
    return this._post('rfp/bidding/award', params);
  },
  searchRfpBiddings: function (params) {
    return this._post('rfp/bidding/list', params);
  },
  getCarrierBiddings: function (params) {
    return this._post('rfp/carrier-bidding/list', params);
  },
  getCarrierBidding: function (params) {
    return this._post('rfp/carrier-bidding/view', params);
  },
  submitCarrierQuotations: function (params) {
    return this._post('rfp/carrier-bidding/quotation', params);
  },
  batchUploadQuotation: function (params) {
    return this._post('rfp/carrier-bidding/quotation-batch', params);
  },
  submitAdminNewQuotations: function (params) {
    return this._post('rfp/bidding/quotation-new', params);
  },
  submitCarrierNewQuotations: function (params) {
    return this._post('rfp/carrier-bidding/quotation-new', params);
  },
  rejectCarrierQuotation: function (params) {
    return this._post('rfp/carrier-bidding/quotation-reject', params);
  },
  addNoteCarrierQuotation: function (params) {
    return this._post('rfp/carrier-bidding/quotation-note', params);
  },
  downloadLatestQuotation: function (params) {
    return this._post('rfp/carrier-bidding/quotation-download', params);
  },
  upsertRfpShippingProduct: function (params) {
    return this._post('rfp/shipping-product/upsert', params);
  },
  searchRfpShippingProducts: function (params) {
    return this._post('rfp/shipping-product/search', params);
  },
  getRfpShippingProducts: function (params) {
    return this._post('rfp/shipping-product/list', params);
  },
  getRfpCandidateShippingProduct: function (params) {
    return this._post('rfp/shipping-product/candidate-view', params);
  },
  adminProcessRfpShippingProductCountry: function (params) {
    return this._post('rfp/shipping-product/approval', params);
  },
  rfpScorecardList: function (params) {
    return this._post('rfp/scorecard/list', params);
  },
  rfpScorecardEdit: function (params) {
    return this._post('rfp/scorecard/edit', params);
  },
  rfpScorecardCreate: function (params) {
    return this._post('rfp/scorecard/create', params);
  },
  rfpScorecardDelete: function (params) {
    return this._post('rfp/scorecard/delete', params);
  },
  rfpScorecardCalculate: function (params) {
    return this._post('rfp/scorecard/calculate', params);
  },
  rfpScorecardView: function (params) {
    return this._post('rfp/scorecard/view', params);
  },
  rfpPnlView: function (params) {
    return this._post('rfp/pnl/view', params);
  },
  rfpPnlCalculate: function (params) {
    return this._post('rfp/pnl/calculate', params);
  },
  /* Pilot Router Calculation */
  rfpPilotRouterSave: function (params) {
    return this._post('rfp/pilot-router/save', params);
  },
  rfpPilotRouterView: function (params) {
    return this._post('rfp/pilot-router/view', params);
  },
  rfpPilotRouterDownload: function (params) {
    return this._post('rfp/pilot-router/download', params);
  },
  /* Adjust Price */
  getMyAdjustPriceShippingProductsByBusinessType: function (params) {
    return this._post('price-adjustment/meta/shipping-products', params);
  },
  createAdjustPriceRequest: function (params) {
    return this._post('price-adjustment/request/create', params);
  },
  adjustPriceRequestList: function (params) {
    return this._post('price-adjustment/request/list', params);
  },
  getPriceAdjustmentRequest: function (params) {
    return this._post('price-adjustment/request/view', params);
  },
  uploadPriceAdjustmentRequestPricingCard: function (params) {
    return this._post('price-adjustment/request/pricing-card', params);
  },
  approvePriceAdjustmentRequest: function (params) {
    return this._post('price-adjustment/request/approve', params);
  },
  rejectPriceAdjustmentRequest: function (params) {
    return this._post('price-adjustment/request/reject', params);
  },
  savePriceAdjustmentRequestNote: function (params) {
    return this._post('price-adjustment/request/save-note', params);
  },
  getPriceAdjustmentMeta: function () {
    return this._post('price-adjustment/meta/get');
  },
  /* Advisor Tool */
  searchWospService: function (params) {
    return this._post('advisor-tool/wosp-service/search', params);
  },
  getCarriersAndCountries: function () {
    return this._post('advisor-tool/carrier-country/get');
  },
  getWospServiceData: function (params) {
    return this._post('manage-wosp-service-data/wosp-service/get', params);
  },
  updateWospServiceData: function (params) {
    return this._post('manage-wosp-service-data/wosp-service/update', params);
  },
  closeWospServiceData: function (params) {
    return this._post('manage-wosp-service-data/wosp-service/delete', params);
  },
  refreshWospServiceData: function (params) {
    return this._post('manage-wosp-service-data/wosp-service/refresh', params);
  },
  closeCountry: function (params) {
    return this._post('manage-wosp-service-data/country/delete', params);
  },
  /* FBW-CN */
  getFBWCNLogisticsErrorTypesCausedByNoneOrderError: function () {
    return this._post('fbwcn-logistics-error-types-caused_by_none_error', {});
  },
  getFBWCNOrderCountByLogisticsErrorTypes: function (error_types) {
    return this._post('fbwcn-order-count-by-logistics-error-type', {
      'error_types[]': error_types,
    });
  },
  recreateFBWCNLogisticsOrderByErrorTypes: function (error_types) {
    return this._post('fbwcn-recreate-logistics-orders-by-error-types', {
      'error_types[]': error_types,
    });
  },
  getWospWMSOutboundLogisticsCombineOrders: function (params) {
    return this._post('wospwms-outbound-logistics-combine-order-list-new', params);
  },
  getWospWMSOutboundLogisticsAuditRequests: function (params) {
    return this._post('wospwms-get-outbound-logistics-audit-requests', params);
  },
  appendWospWMSOutboundLogisticsCombineOrderRemark: function (params) {
    return this._post('wospwms-outbound-logistics-combine-order-append-remark', params);
  },
  confirmWospWMSOutboundLogisticsCombineOrder: function (params) {
    return this._post('wospwms-confirm-outbound-logistics-combine-order', params);
  },
  getWospWMSOutboundLogisticsChannels: function (params) {
    return this._post('wospwms-outbound-logistics-channels', params);
  },
  getWospWMSOutboundLogisticsAuditDetailData: function (params) {
    return this._post('wospwms-get-outbound-logistics-audit-detail-data', params);
  },
  submitWospWMSOutboundLogisticsAuditRequest: function (params) {
    return this._post('wospwms-submit-outbound-logistics-audit-request', params);
  },
  approveWospWMSOutboundLogisticsAuditRequest: function (params) {
    return this._post('wospwms-approve-outbound-logistics-audit-request', params);
  },
  revokeWospWMSOutboundLogisticsAuditRequest: function (params) {
    return this._post('wospwms-revoke-outbound-logistics-audit-request', params);
  },
  appendWospWMSOutboundLogisticsAuditRequestComment: function (params) {
    return this._post('wospwms-append-outbound-logistics-audit-request-comment', params);
  },
  getWospWMSOutboundLogisticsDeclarationInfo: function (params) {
    return this._post('wospwms-get-outbound-logistics-declaration', params);
  },
  getWospWMSOutboundLogisticsCombinedTrackings: function (params) {
    return this._post('wospwms-outbound-logistics-get-combined-trackings', params);
  },
  getAdminEnquireEPCProductTagResult: function (params) {
    return this._post('warehouse/cs_enquire_epc_product_tag', params);
  },
  uploadCustomizedPIDs: function (params) {
    return this._post('warehouse/upload-customized-pids', params);
  },
  getWospWMSOutboundLogisticsTrackings: function (params) {
    return this._post('wospwms-outbound-logistics-get-trackings', params);
  },
  getOrdersBagCreateParams: function () {
    return this._post('orders_bag/v2/query-params');
  },
  GetOrdersBagCreateOrders: function (params) {
    return this._post('orders_bag/v2/query-orders', params);
  },
  createBag: function (params) {
    return this._post('v3/orders_bag/create', params);
  },
  getPackingBagCreateParams: function () {
    return this._post('bag_handover/create_bag/query-params');
  },
  getPackingBagCreateOrders: function (params) {
    return this._post('bag_handover/create_bag/query-orders', params);
  },
  createdPackingBag: function (params) {
    return this._post('v3/packing_bag/create', params);
  },
  getCarrierHandover: function () {
    return this._post('bag_handover/carrier');
  },
  getPackingBagSearchParams: function (params) {
    return this._post('bag_handover/search_bag/query-params', params);
  },
  getBagTypeSearchParams: function (params) {
    return this._post('bag_handover/search_bag/bag-type-params', params);
  },
  getPackingBagSearch: function (params) {
    return this._post('bag_handover/search_bag/query-bags', params);
  },
  updatePackingBag: function (params) {
    return this._post('v3/packing_bag/update', params);
  },
  createdDeliveryNote: function (params) {
    return this._post('v3/delivery_note/create', params);
  },
  getDeliveryNoteSearchParams: function () {
    return this._post('bag_handover/search_delivery_note/query-params');
  },
  getDeliveryNoteSearch: function (params) {
    return this._post('bag_handover/search_delivery_note/query-delivery-notes', params);
  },
  cancelDeliveryNote: function (params) {
    return this._post('v3/delivery_note/update', params);
  },
  getPackingBagServices: function () {
    return this._post('admin-bag-service/get');
  },
  editPackingBagService: function (params) {
    return this._post('admin-bag-service/edit', params);
  },
  deletePackingBagService: function (params) {
    return this._post('admin-bag-service/delete', params);
  },
  getWospWMSOutboundLogisticsOrders: function (params) {
    return this._post('wospwms-outbound-logistics-order-list', params);
  },
  getRelatedWospWMSOutboundLogisticsOrders: function (params) {
    return this._post('wospwms-batch-get-outbound-logistics-orders', params);
  },
  combineWospWMSOutboundLogisticsOrders: function (params) {
    return this._post('wospwms-combine-outbound-logistics-orders', params);
  },
  generateWospWMSOutboundLogisticsCombinedExcel: function (params) {
    return this._post('wospwms-outbound-logistics-combine-order-export', params);
  },
  getStandardDownloadJobList: function (params) {
    return this._post('get-standard-download-job-list', params);
  },
  getSearchTrackingCheckpointResults: function (params) {
    return this._post('risk-management/tracking-checkpoint-search', params);
  },
  getReturnActionOptions: function () {
    return this._post('get-return-action-options', {});
  },
  getReverseLogisticsModeOptions: function () {
    return this._post('get-reverse-logistics-mode-options', {});
  },
  getUserReturnParcelSetting: function () {
    return this._post('get-user-return-parcel-setting', {});
  },
  getProvinceCityDistrictMapping: function () {
    return this._post('get-province-city-district-mapping', {});
  },
  saveUserReturnParcelSetting: function (params) {
    return this._post('save-user-return-parcel-setting', params);
  },
  deleteUserReturnParcelSetting: function (params) {
    return this._post('delete-user-return-parcel-setting', params);
  },
  getManageInvalidAddressMetadata: function () {
    return this._post('get-manage-invalid-address-metadata', {});
  },
  downloadManageInvalidAddresses: function (params) {
    return this._post('download-manage-invalid-addresses', params);
  },
  uploadManageInvalidAddresses: function (params) {
    return this._post('upload-manage-invalid-addresses', params);
  },
  /* HSCode */
  getHSCategoryTree: function (params) {
    return this._post('hscode/category-tree/get', params);
  },
  validateHSCode: function (params) {
    return this._post('hscode/category-tree/valid', params);
  },
  queryProductFromHSCategory: function (params) {
    return this._post('hscode/category-tree/query-product', params);
  },
  queryHsCategoryHotWords: function (params) {
    return this._post('hscode/category-tree/query-hot-words', params);
  },
  getHSDashboard: function (params) {
    return this._post('hscode/daily-metrics', params);
  },
  /* SENSITIVE PRODUCT */
  callSensitiveProductMethod(path, params) {
    return this._post(path, params);
  },
  /* LCL */
  getClearanceOrderList: function (params) {
    return this._post('lcl/clearance-order/list', params);
  },
  getLineHaulBillList: function (params) {
    return this._post('lcl/bill/list', params);
  },
  getChannelPricingRuleList: function (params) {
    return this._post('lcl/pricing-rule/list', params);
  },
  editChannelPricing: function (params) {
    return this._post('lcl/pricing-rule/edit', params);
  },
  getPaymentRequestList: function (params) {
    return this._post('lcl/payment-request/list', params);
  },
  getPaymentRequestListExport: function (params) {
    return this._post('lcl/payment-request/export', params);
  },
  updatePaymentRequest: function (params) {
    return this._post('lcl/payment-request/update', params);
  },
  getLCLOrderList: function (params) {
    return this._post('lcl/order/list', params);
  },
  getLCLQuotationOrderList: function (params) {
    return this._post('lcl/quotation-order/list', params);
  },
  getProductHscodeInfoList: function (params) {
    return this._post('hscode/product-hscode-info/list', params);
  },
  getHSCodeReviewQueue: function (params) {
    return this._post('hscode/hscode-review-queue/list', params);
  },
  generateHSCodeReviewQueue: function (params) {
    return this._post('hscode/hscode-review-queue/generate', params);
  },
  getHSCodeReviewSummary: function (params) {
    return this._post('hscode/hscode-review-summary', params);
  },
  getProductHscodeInfoDetail: function (params) {
    return this._post('hscode/product-hscode-info/detail', params);
  },
  submitReviewProductHscodeInfoDetail: function (params) {
    return this._post('hscode/product-hscode-info/review', params);
  },
  getLCLOrderTrackingDetail: function (params) {
    return this._post('lcl/order/get-detail-tracking', params);
  },
  getManifestList: function (params) {
    return this._post('lcl/manifest/list', params);
  },
  getLCLDashboardCostRevenue: function (params) {
    return this._post('lcl/dashboard/get-cost-revenue', params);
  },
  getLCLDashboardCarrierData: function (params) {
    return this._post('lcl/dashboard/carrier-data', params);
  },
  getLCLDashboardDailyData: function (params) {
    return this._post('lcl/dashboard/get-daily-data', params);
  },
  getLCLDashboardDistributionData: function (params) {
    return this._post('lcl/dashboard/get-distribution_data', params);
  },
  getLCLDashboardHistoricalData: function (params) {
    return this._post('lcl/dashboard/get-historical-data', params);
  },
  getLCLDashboardData: function (params) {
    return this._post('lcl/dashboard/get-data', params);
  },
  getLCLDashboardMonitoringData: function (params) {
    return this._post('lcl/dashboard/get-monitoring-data', params);
  },
  getLCLDashboardCarrierSLAData: function (params) {
    return this._post('lcl/dashboard/get-carrier-sla-data', params);
  },
  getLCLCarrierList: function (params) {
    return this._post('lcl/carrier/list', params);
  },
  getLCLChannelList: function (params) {
    return this._post('lcl/channel/list', params);
  },
  upsertLCLChannel: function (params) {
    return this._post('lcl/channel/edit', params);
  },
  editManifest: function (params) {
    return this._post('lcl/manifest/edit', params);
  },
  getLCLQuotationOrderDetail: function (params) {
    return this._post('lcl/quotation-order/detail', params);
  },
  addTracking: function (params) {
    return this._post('lcl/quotation-order/tracking/add', params);
  },
  editDeclaration: function (params) {
    return this._post('lcl/quotation-order/declaration/edit', params);
  },
  editClearanceDeclaration: function (params) {
    return this._post('lcl/clearance-order/declaration/edit', params);
  },
  addClearanceAbnormalParcels: function (params) {
    return this._post('lcl/clearance-order/abnormal-parcel/add', params);
  },
  getClearanceDeclaration: function (params) {
    return this._post('lcl/clearance-order/declaration/detail', params);
  },
  editClearanceOrder: function (params) {
    return this._post('lcl/clearance-order/edit', params);
  },
  editQuotationPrice: function (params) {
    return this._post('lcl/quotation-order/price/edit', params);
  },
  updateCustomCost: function (params) {
    return this._post('lcl/custom-cost/update', params);
  },
  approveCustomCost: function (params) {
    return this._post('lcl/custom-cost/approve', params);
  },
  getExchangeRate: function (params) {
    return this._post('lcl/exchange-rate/get', params);
  },
  editQuotationOrderPickupInfo: function (params) {
    return this._post('lcl/quotation-order/pickup/edit', params);
  },
  abnormalParcelEdit: function (params) {
    return this._post('lcl/tracking/abnormal-parcel/edit', params);
  },
  getLCLMerchantOrders: function (params) {
    return this._post('lcl/merchant-order/list', params);
  },
  getQuotationOrderCaclFee: function (params) {
    return this._post('lcl/quotation-order/calc', params);
  },
  auditLCLMerchantOrder: function (params) {
    return this._post('lcl/merchant-order/audit', params);
  },
  getMerchantOrderQuotations: function (params) {
    return this._post('lcl/merchant-order/get-quotations', params);
  },
  upsertMerchantOrder: function (params) {
    return this._post('lcl/merchant-order/upsert', params);
  },
  getLCLUserMerchantOrderList: function (params) {
    return this._post('lcl/merchant-order/external-list', params);
  },
  gainLCLMerchantOrder: function (params) {
    return this._post('lcl/merchant-order/gain', params);
  },
  exportLCLMerchantOrder: function (params) {
    return this._post('lcl/merchant-order/export', params);
  },
  getMerchantOrderCaclFee: function (params) {
    return this._post('lcl/merchant-order/calc', params);
  },
  confirmMerchantOrderSendOut: function (params) {
    return this._post('lcl/merchant-order/confirm-send-out', params);
  },
  uploadMerchantOrderBoxes: function (params) {
    return this._post('lcl/merchant-order/upload-boxes', params);
  },
  combineLCLMerchantOrder: function (params) {
    return this._post('lcl/merchant-order/combine', params);
  },
  getLCLMerchantAddressList: function (params) {
    return this._post('lcl/merchant-order/address-list', params);
  },
  editLCLMerchantAddress: function (params) {
    return this._post('lcl/merchant-order/address-edit', params);
  },
  merchantGetChannels: function (params) {
    return this._post('lcl/merchant/get-channels', params);
  },
  merchantGetNotifications: function (params) {
    return this._post('lcl/merchant/get-notifications', params);
  },
  getLCLShippingRequestList: function (params) {
    return this._post('lcl/shipping-request/list', params);
  },
  allocateBoxes: function (params) {
    return this._post('lcl/allocate-boxes', params);
  },
  confirmAllocation: function (params) {
    return this._post('lcl/confirm-allocation', params);
  },
  getLCLRoutingRules: function (params) {
    return this._post('lcl/get-routing-rules', params);
  },
  upsertLCLRoutingRule: function (params) {
    return this._post('lcl/create-routing-rule', params);
  },
  getLCLUserCoupons: function (params) {
    return this._post('lcl/merchant/get-user-coupons', params);
  },
  getLCLDiscount: function (params) {
    return this._post('lcl/merchant/get-discount', params);
  },
  getShownCampaign: function (params) {
    return this._post('lcl/merchant/get-shown-campaign', params);
  },
  acquireCoupons: function (params) {
    return this._post('lcl/merchant/acquire-coupons', params);
  },
  sendLCLManifestEsm: function (params) {
    return this._post('lcl/manifest/send-esm', params);
  },
  getLCLShippingRequestEstimatedPrice: function (params) {
    return this._post('lcl/shipping-request/estimate-price', params);
  },
  confirmQuotationOrder: function (params) {
    return this._post('lcl/quotation-order/confirm', params);
  },
  editQuotationOrder: function (params) {
    return this._post('lcl/quotation-order/edit', params);
  },
  parseSmartFreightBoxExcel: function (params) {
    return this._post('lcl/smart-freight/parse-box-excel', params);
  },
  parseSmartFreightBoxWeight: function (params) {
    return this._post('lcl/smart-freight/parse-box-weight', params);
  },
  parseLCLLinehaulBillBoxFile: function (params) {
    return this._post('lcl/linehaul-bill/parse-box-file', params);
  },
  createSmartFreightOrder: function (params) {
    return this._post('lcl/smart-freight/create-order', params);
  },
  LCLSmartFreightUploadWeight: function (params) {
    return this._post('lcl/smart-freight/upload-weight', params);
  },
  updateLCLLinehaulBill: function (params) {
    return this._post('lcl/linehaul-bill/edit', params);
  },
  getLCLVAT: function (params) {
    return this._post('lcl/merchant/vat/get', params);
  },
  updateLCLVAT: function (params) {
    return this._post('lcl/merchant/vat/update', params);
  },
  approveLCLVAT: function (params) {
    return this._post('lcl/merchant/vat/approve', params);
  },
  getLCLVATZIP: function (params) {
    return this._post('lcl/merchant/vatzip/get', params);
  },
  getLCLPorts: function (params) {
    return this._post('lcl/ports', params);
  },
  parseLastMileLogisticsExcel: function (params) {
    return this._post('lcl/parse-last-mile-tracking-excel', params);
  },
  updateLastMileLogisticsInfo: function (params) {
    return this._post('lcl/last-mile-tracking/update', params);
  },
  cancelLCLShippingRequest: function (params) {
    return this._post('lcl/shipping-request/cancel', params);
  },
  upsertLCLCarrier: function (params) {
    return this._post('lcl/carrier/upsert', params);
  },
  runQuotationOrderManualTool: function (params) {
    return this._post('lcl/quotation-order/manual-tool', params);
  },
  runOrderManualTool: function (params) {
    return this._post('lcl/order/manual-tool', params);
  },
  pricingCardEstimateTool: function (params) {
    return this._post('lcl/pricing-card/estimate', params);
  },
  updateLCLMerchantOrder: function (params) {
    return this._post('lcl/merchant-order/update', params);
  },
  getLCLDashboardSummaryData: function (params) {
    return this._post('lcl/dashboard/summary', params);
  },
  getLCLDashboardOrderData: function (params) {
    return this._post('lcl/dashboard/order', params);
  },
  getAbnormalOrders: function (params) {
    return this._post('lcl/dashboard/get-abnormal-order', params);
  },
  getMerchantRefundOrderList: function (params) {
    return this._post('lcl/refund/list', params);
  },
  createMerchantRefundOrder: function (params) {
    return this._post('lcl/refund/create', params);
  },
  /* end LCL */
  /* Real Name Verification */
  getVerificationRequest: function (params) {
    return this._post('real-name-verification-request/get', params);
  },
  getVerificationDenyReason: function (params) {
    return this._post('real-name-verification-deny-reasons/get', params);
  },
  getVerificationHistoryRequest: function (params) {
    return this._post('real-name-verification-history/get', params);
  },
  approveRealNameRequest: function (params) {
    return this._post('real-name-request/verify', params);
  },
  exportRealNameRequest: function (params) {
    return this._post('real-name-request/export', params);
  },
  getEPCEvents: function (params) {
    return this._post('epc_event/find', params);
  },
  epcEventLoadData: function (params) {
    return this._post('epc_event/load_data', params);
  },
  approveEPCEvents: function (params) {
    return this._post('epc_event/approve', params);
  },
  cancelEPCEvents: function (params) {
    return this._post('epc_event/cancel', params);
  },
  rejectEPCEvents: function (params) {
    return this._post('epc_event/reject', params);
  },
  getCountries: function (params) {
    return this._post('logistics_country_region/country/get', params);
  },
  getStates: function (params) {
    return this._post('logistics_country_region/state/get', params);
  },
  getCities: function (params) {
    return this._post('logistics_country_region/city/get', params);
  },
  getDistricts: function (params) {
    return this._post('logistics_country_region/district/get', params);
  },
  getRealNameVerificationInfo: function () {
    return this._post('get-real-name-verification-info', {});
  },
  getFaceRecognitionInfo: function (params) {
    return this._post('get-face-recognition-info', params);
  },
  getFaceRecognitionResult: function (params) {
    return this._post('get-face-recognition-result', params);
  },
  changeHandoverAuthCode: function (params) {
    return this._post('user/change-handover-authorization-code', params);
  },
  getHandoverAuthCode: function (params) {
    return this._post('user/get-handover-authorization-code', params);
  },
  getDrivers: function (params) {
    return this._post('handover-driver/list', params);
  },
  createDriver: function (params) {
    return this._post('handover-driver/create', params);
  },
  deleteDrivers: function (params) {
    return this._post('handover-driver/delete', params);
  },
  editDriverStatus: function (params) {
    return this._post('handover-driver/editStatus', params);
  },
  batchAddDrivers: function (params) {
    return this._post('handover-driver/batchAdd', params);
  },
  getRouterConfig: function (params) {
    return this._post('validation-router-config/get', params);
  },
  getDeliveryAddressList: function (params) {
    return this._post('logistics-components-config/gateway-delivery-address/list', params);
  },
  editDeliveryAddress: function (params) {
    return this._post('logistics-components-config/gateway-delivery-address/edit', params);
  },
  addDeliveryAddress: function (params) {
    return this._post('logistics-components-config/gateway-delivery-address/add', params);
  },
  deleteDeliveryAddress: function (params) {
    return this._post('logistics-components-config/gateway-delivery-address/remove', params);
  },
  getNonWishOrderWhitelist: function (params) {
    return this._post('manage_non_wish_order/whitelist/get', params);
  },
  updateNonWishOrderWhitelist: function (params) {
    return this._post('manage_non_wish_order/whitelist/update', params);
  },
  updateNonWishOrderPilot: function (params) {
    return this._post('manage_non_wish_order/pilot/update', params);
  },
  acceptUpdateIdentificationRiskWarning: function (params) {
    return this._post('accept-update-identification-risk-warning', params);
  },
  getProfile: function (params) {
    return this._post('auto_logistics/logistic_integration_profile/get', params);
  },
  getCWTermsSignedStatus: function () {
    return this._post('cloud-warehouse-terms-signed-status');
  },
  signCWTerms: function (params) {
    return this._post('sign-cloud-warehouse-terms', params);
  },
  publishPubsubMessage: function (params) {
    return this._post('pubsub/message/publish', params);
  },
  listPubsubChannels: function (params) {
    return this._post('pubsub/channel/list', params);
  },
  getKpiData: function (params) {
    return this._post('get-kpi-data', params);
  },
  getSpec: function () {
    return this._post('openapi_spec/get', {});
  },
  getCarrierPerformanceData: function (params) {
    return this._post('carrier-performance/get', params);
  },
  queryCarrierPerformanceData: function (params) {
    return this._post('carrier-performance/query', params);
  },
  saveDynamicEnum: function (params) {
    return this._post('dynamic_enum/create', params);
  },
  approveDynamicEnum: function (params) {
    return this._post('dynamic_enum/approve', params);
  },
  getAvailableFPLChannels: function (params) {
    return this._post('fpl_automation/get_available_fpl_channels', params);
  },
  getAvailableFPLWarehouses: function (params) {
    return this._post('fpl_automation/get_available_fpl_warehouses', params);
  },
  generateFPLEnums: function (params) {
    return this._post('fpl_automation/generate_fpl_enums', params);
  },
  generateWOSPService: function (params) {
    return this._post('fpl_automation/generate_wosp_service', params);
  },
  generateWOSPRouter: function (params) {
    return this._post('fpl_automation/generate_wosp_mapping', params);
  },
  autoFPLGenerate: function (params) {
    return this._post('fpl_automation/auto_fpl_generate', params);
  },
  getFplProcessRecord: function () {
    return this._post('fpl_automation/fpl_records', {});
  },
  getNileStoreList: function (params) {
    return this._post('nile_store_pickup/get_store_list', params);
  },
  createNonWishOrderInfo: function (params) {
    return this._post('nile_store_pickup/create_non_wish_order_info', params);
  },
  getNonWishOrderInfo: function (params) {
    return this._post('nile_store_pickup/get_non_wish_order_info', params);
  },
  getNileStoreInfo: function (params) {
    return this._post('nile_store_pickup/get_store_info', params);
  },
  getEPCMonitorData: function (params) {
    return this._post('combine_order/get_epc_data_monitor_data', params);
  },
  getCombineErrorKeywords: function () {
    return this._post('combine_order/combine-error-keywords/get');
  },
  saveCombineErrorKeywords: function (params) {
    return this._post('combine_order/combine-error-keywords/save', params);
  },
  batchGetCombineErrorKeywords: function () {
    return this._post('combine_order/combine-error-keywords/batch-get');
  },
  batchSaveCombineErrorKeywords: function (params) {
    return this._post('combine_order/combine-error-keywords/batch-save', params);
  },
  // Unfreeze Payment Request
  searchUnfreezeRequest: function (params) {
    return this._post('unfreeze-requests/search', params);
  },
  unfreezeFailedRequest: function (params) {
    return this._post('unfreeze-requests/unfreeze', params);
  },
  batchSearchUnfreezeRequest: function (params) {
    return this._post('unfreeze-requests/batch-search', params);
  },
  batchUnfreezeFailedRequest: function (params) {
    return this._post('unfreeze-requests/batch-unfreeze', params);
  },
  //
  // On Boarding
  //
  sendVerificationCodeStateless: function (params) {
    return this._post('signup/send-verification-code-stateless', params);
  },
  userSubmitSignUp: function (params) {
    return this._post('signup/user-submit-signup', params);
  },
  sendEmailVerificationCode: function (params) {
    return this._post('signup/send-email-verification-code', params);
  },
  verifyEmailVerificationCode: function (params) {
    return this._post('signup/verify-email-verification-code', params);
  },
  getPhoneNumber: function () {
    return this._post('signup/get-phone-number', {});
  },
  enableTfa: function () {
    return this._post('signup/enable-tfa', {});
  },
  relateMerchantId: function (params) {
    return this._post('signup/relate-merchant-id', params);
  },
  initRealNameVerificationPage: function (params) {
    return this._post('signup/init-real-name-verification-page', params);
  },
  submitRealNameVerification: function (params) {
    return this._post('signup/submit-real-name-verification', params);
  },
  getAccountStatus: function (params) {
    return this._post('get-account-status', params);
  },
  applyCloseAccount: function (params) {
    return this._post('user/close-request/create', params);
  },
  getAccountCloseMeta: function () {
    return this._post('user/close-request/meta', {});
  },
  updateCloseAccountApplication: function (params) {
    return this._post('user/close-request/update', params);
  },
  verifyTfaVerification: function (params) {
    return this._post('verify-tfa-verification', params);
  },
  submitPersonalInfoChange: function (params) {
    return this._post('submit-personal-info-change', params);
  },
  submitCompanyInfoChange: function (params) {
    return this._post('submit-company-info-change', params);
  },
  checkPasswordUniqueness: function (params) {
    return this._post('check-password-uniqueness', params);
  },
  changePassword: function (params) {
    return this._post('change-password', params);
  },
  changePhoneNumber: function (params) {
    return this._post('change-phone-number', params);
  },
  changeUsername: function (params) {
    return this._post('change-username', params);
  },
  merchantAgreeCommitAndAuthorization: function (params) {
    return this._post('user/commitment/agree', params);
  },
  merchantAgreePersonalInfoAuthorizationForm: function (params) {
    return this._post('user/personal-info-authorization/agree', params);
  },
  requestFaceRecognition: function (params) {
    return this._post('user/face-recognition/request', params);
  },
  getFaceRecognitionResponse: function (params) {
    return this._post('user/face-recognition-response', params);
  },
  //
  // Notification
  //
  getUserNotifications: function (params) {
    return this._post('user/notifications/get', params);
  },
  updateUserNotifications: function (params) {
    return this._post('user/notifications/update', params);
  },
  closeUserNotifications: function (params) {
    return this._post('user/notifications/close', params);
  },
  getRoles: function (params) {
    return this._post('rbac/role/get', params);
  },
  editRole: function (params) {
    return this._post('rbac/role/edit', params);
  },
  deleteRole: function (params) {
    return this._post('rbac/role/delete', params);
  },
  getPermissionGroups: function (params) {
    return this._post('rbac/permission-group/get', params);
  },
  // below APIs for New Order Creation Page
  getOrderCreationMeta: function () {
    return this._post('order-creation/meta', {});
  },
  getMerchantOrders: function (params) {
    return this._post('order/get-param', params);
  },
  getLogisticsInfo: function (params) {
    return this._post('order-creation/logistics-info', params);
  },
  createOneOrder: function (params) {
    return this._post('order/create', params);
  },
  confirmCollectionOption: function (params) {
    return this._post('v3/order/collection_option/confirm', params);
  },
  getAgreementInfo: function () {
    return this._post('agreement/get', {});
  },
};
