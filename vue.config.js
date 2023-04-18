const webpack = require('webpack');
const APP_NAME = require('./package.json').name;
const PARENT_Name = require('./package.json').parentName;
const PORT = require('./package.json').devPort;
const NODE_ENV = process.env.NODE_ENV || 'development';
const path = require('path');
log('APP_NAME: ', APP_NAME);
log('NODE_ENV: ', NODE_ENV);
const publicPathDev = `/m/static/${PARENT_Name}/${APP_NAME}/`;
const publicPathTest = `https://cdn.wishpost.cn/cdn-release/qa/wishpost-microweb/logistics-products-cdn/static/`;
const publicPathProd = `https://cdn.wishpost.cn/cdn-release/prod/wishpost-microweb/logistics-products-cdn/static/`;
module.exports = {
  publicPath: NODE_ENV === 'production' ? publicPathProd : NODE_ENV === 'test' ? publicPathTest : publicPathDev,
  // publicPath: publicPathProd,
  css: {
    extract: false,
  },
  runtimeCompiler: true,
  productionSourceMap: false,
  chainWebpack: config => {
    // if(NODE_ENV === 'production'){
    config.externals({
      vue: 'Vue',
      react: 'React',
      'react-dom': 'ReactDOM',
    });
    config.output
      .filename('main.js')
      .chunkFilename('[name].[chunkhash:8].js')
      .jsonpFunction(`webpackJsonp-${APP_NAME}`)
      .library(`app-${APP_NAME}`)
      .libraryExport('default')
      .libraryTarget('umd');
    config.optimization.splitChunks(false);
    if (NODE_ENV === 'development') {
      config.optimization.minimize(false);
    }
    config.plugin('define').use(webpack.DefinePlugin, [
      {
        'process.env.VUE_APP_NAME': JSON.stringify(APP_NAME),
        'process.env.VUE_PARENT_NAME': JSON.stringify(PARENT_Name),
      },
    ]);
    config.plugins
      // .delete('html')
      .delete('preload')
      .delete('prefetch');
    // }else{
    //   config.output
    //     .filename('main.js')
    //     .chunkFilename('[name].[chunkhash:8].js')
    // }
    config.plugin('i18nPlugin').use(
      new webpack.ProvidePlugin({
        i18n: ['i18nModule', 'i18n'],
        ni18n: ['i18nModule', 'ni18n'],
        ci18n: ['i18nModule', 'ci18n'],
        cni18n: ['i18nModule', 'cni18n'],
        // sprintf: ['@i18nModule', 'sprintf'],
      }),
    );
    const { VuetifyLoaderPlugin } = require('vuetify-loader');
    config
      .plugin('VuetifyLoaderPlugin')
      .use(VuetifyLoaderPlugin)
      .tap(() => [
        {
          match(originalTag, { kebabTag, camelTag }) {
            if (kebabTag.startsWith('core-')) {
              return [camelTag, `import ${camelTag} from '@/components/core/${camelTag.substring(4)}.vue'`];
            }
          },
        },
      ]);
  },
  configureWebpack: {
    // 支持jquery
    plugins: [
      new webpack.ProvidePlugin({
        $: 'jquery',
        jQuery: 'jquery',
        'windows.jQuery': 'jquery',
      }),
    ],
    resolve: {
      alias: {
        // aliases go here
        '@': path.resolve(__dirname, 'src'),
        '@component': path.resolve(__dirname, 'src/components'),
        '@views': path.resolve(__dirname, 'src/views'),
        '@utils': path.resolve(__dirname, 'src/utils'),
        '@common': path.resolve(__dirname, 'src/common'),
        i18nModule: path.resolve(__dirname, 'node_modules/@wish/fe-utils/util/i18n.js'),
      },
    },
    externals: {
      react: 'React',
      'react-dom': 'ReactDOM',
    },
  },
  devServer: {
    disableHostCheck: true,
    port: PORT,
    index: 'index.html',
    compress: true,
    headers: {
      'Cache-Control': 'no-store',
    },
    proxy: {
      ['/api/']: {
        target: 'http://wishpost.corp.contextlogic.com/',
      },
    },
  },
  transpileDependencies: ['vuetify'],
};
function log(label, content) {
  console.log('\x1b[1m%s\x1b[31m%s\x1b[0m', label, content);
}
