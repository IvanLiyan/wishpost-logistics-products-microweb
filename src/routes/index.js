/* routes-list */
const APP_NAME = process.env.VUE_APP_NAME;
export default [
  {
    path: `${APP_NAME}`,
    redirect: `${APP_NAME}/demo`,
  },
  {
    path: `${APP_NAME}/demo`,
    name: `${APP_NAME}.demo`,
    component: () =>
      import(
        /* webpackChunkName: "change-phone" */
        '@views/demo/index'
      ),
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
        /* webpackChunkName: "manage-order-traffic-control" */
        '@views/manage-order-traffic-control/index'
      ),
  },
];
