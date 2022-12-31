import { defineConfig } from 'umi';
const pxtorem = require('postcss-pxtorem');

export default defineConfig({
  nodeModulesTransform: {
    type: 'none',
  },
  routes: [
    { path: '/gov/cz/index_dev', component: '@/pages/Index' },
    { path: '/login', component: '@/pages/Login' },
    { path: '/meeting', component: '@/pages/Meeting' },
  ],
  fastRefresh: {},
  locale: {
    default: 'zh-CN',
    antd: true,
    title: false,
    baseNavigator: true,
    baseSeparator: '-',
  },

  extraPostCSSPlugins: [
    //配置额外的 postcss 插件。
    pxtorem({
      rootValue: 14.4, // 指定转换倍率，1rem=16px;
      propList: ['*'], // 属性列表，表示你要把哪些css属性的px转换成rem，这个*表示所有
      // selectorBalckList: ['.am-'], // 匹配不被转换为rem的选择器，例如UI框架antd-mobile
      // exclude: /node_modules/i,
    }),
  ],
  proxy: {
    '/api': {
      target: 'https://ccmimplusservicevpcpre.cloud.alipay.com',
      pathRewrite: { '^/api': '' },
      changeOrigin: true,
    },
  },
});
