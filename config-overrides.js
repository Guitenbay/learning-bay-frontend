const MonacoWebpackPlugin = require('monaco-editor-webpack-plugin');
const CleanWebpackPlugin = require('clean-webpack-plugin').CleanWebpackPlugin;
const BundleAnalyzerPlugin = require('webpack-bundle-analyzer').BundleAnalyzerPlugin;

module.exports = function override(config, env) {
  if (env === 'production') {
    config.devtool = false; // 不生成开发工具：包括 map 文件
    config.plugins.push(
      new CleanWebpackPlugin(), // 在打包的时候会删除之前的打包目录
      new BundleAnalyzerPlugin(), // 在打包结束的时候，启动一个服务在浏览器查看打包的大小和包含的内容等
    );
    config.output.chunkFilename = 'static/js/[name].[chunkhash].chunk.js';
    config.optimization = Object.assign(config.optimization, {
      splitChunks: { // 拆包，将一个大的 js 文件拆成几个小的 js 文件
        chunks: 'all',
        minSize: 30000,
        maxSize: 0,
        minChunks: 1,
        maxAsyncRequests: 6,
        maxInitialRequests: 6,
        automaticNameDelimiter: '~',
        name: true,
        cacheGroups: {
          monaco: { // 拆分 monaco-editor 组件
            priority: 1, 
            test: /[\\/]node_modules[\\/](react-monaco-editor|monaco-editor|monaco-editor-webpack-plugin)[\\/]/,
          },
          blueprintui: { // 拆分 UI 框架
            priority: 2,  
            test: /[\\/]node_modules[\\/](@blueprintjs)[\\/]/,  //(module) => (/antd/.test(module.context)),
          },
          basic: { // 拆分基础插件
            priority: 3, 
            test: /[\\/]node_modules[\\/](react|react-dom|react-router-dom|redux|axios)[\\/]/,
          },
          vendors: {
            test: /[\\/]node_modules[\\/]/,
            priority: -10
          },
          default: {
            minChunks: 2,
            priority: -20,
            reuseExistingChunk: true
          }
        }
      }
    });
  }
  config.plugins.push(
    new MonacoWebpackPlugin({
      // available options are documented at https://github.com/Microsoft/monaco-editor-webpack-plugin#options
      languages: ['javascript']
    })
  );
  return config;
};