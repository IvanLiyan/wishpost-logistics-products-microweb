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
];
