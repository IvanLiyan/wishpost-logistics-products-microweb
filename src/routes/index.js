/* routes-list */
import helloReactView from '@views/demo/helloReact.jsx';
import reactInVueView from '@views/demo/reactInVue';
import { ReactInVue } from 'vuera';
const APP_NAME = process.env.VUE_APP_NAME;
const HelloReactView = ReactInVue(helloReactView);
export default [
  {
    path: `${APP_NAME}/hello-react`,
    name: `${APP_NAME}.hello-react`,
    component: HelloReactView,
  },
  {
    path: `${APP_NAME}/reactInVue`,
    name: `${APP_NAME}.reactInVue`,
    component: reactInVueView,
  },
  {
    path: `${APP_NAME}/advisor-tool`,
    name: `${APP_NAME}.advisor-tool`,
    component: () =>
      import(
        /* webpackChunkName: "advisor-tool" */
        '@views/advisor-tool/index'
      ),
  },
  {
    path: `${APP_NAME}/manage-order-traffic-control`,
    name: `${APP_NAME}.manage-order-traffic-control`,
    component: () =>
      import(
        /* webpackChunkName: "advisor-tool" */
        '@views/manage-order-traffic-control/index'
      ),
  },
  {
    path: `${APP_NAME}/handover/search-handover`,
    name: `${APP_NAME}.search-handover`,
    component: () =>
      import(
        /* webpackChunkName: "search-handover" */
        '@views/handover/search-handover/index'
      ),
  },
  {
    path: `${APP_NAME}/handover/manage-bag-services`,
    name: `${APP_NAME}.manage-bag-services`,
    component: () =>
      import(
        /* webpackChunkName: "manage-bag-services" */
        '@views/handover/manage-bag-services/index'
      ),
  },
  {
    path: `${APP_NAME}/orders`,
    name: `${APP_NAME}.orders`,
    component: () =>
      import(
        /* webpackChunkName: "orders" */
        '@views/orders/index'
      ),
  },
  {
    path: `${APP_NAME}/mark-lost-orders`,
    name: `${APP_NAME}.mark-lost-orders`,
    component: () =>
      import(
        /* webpackChunkName: "mark-lost-orders" */
        '@views/orders/batchMarkLostOrders'
      ),
  },
];
