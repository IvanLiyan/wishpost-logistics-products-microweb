import { i18nModule } from '@wish/fe-utils';
import viTranslations from '../translation_packages/js/vi_VN.jed.json';
import zhTranslations from '../translation_packages/js/zh_CN.jed.json';
import routes from './routes';
// config locale transition content
const LocaleTranslations = {
  en: {},
  zh: zhTranslations,
  vi: viTranslations,
};
i18nModule.initJedi18nInstance(LocaleTranslations);
const data = {
  name: process.env.VUE_APP_NAME,
  routes,
  beforeEach(from, to, next) {
    console.log('micro:', process.env.VUE_APP_NAME, from.path, to.path);
    next();
  },
  init() {},
};
// when start on local below code is used to init vue
if (global.Vue.__share_pool__ == null && process.env.NODE_ENV === 'development') {
  const init_mock_vue = require('@/dev/init').default;
  init_mock_vue();
}
window.MainJs = data;
export default data;
