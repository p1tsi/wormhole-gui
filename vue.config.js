const webpack = require('webpack')
const MonacoWebpackPlugin = require('monaco-editor-webpack-plugin')

module.exports = {
  chainWebpack: config => {
    config
      .plugin('provide')
      .use(new webpack.ProvidePlugin({
        $: 'jquery',
        jQuery: 'jquery',
        JQuery: 'jquery',
        'window.jQuery': 'jquery'
      }))
      .use(new MonacoWebpackPlugin())
  },
  devServer: {
    allowedHosts: [
      '.local' // allow LAN
    ],
    proxy: {
      '^/(api|socket\.io)': {
        target: 'http://127.0.0.1:31337',
        ws: true,
        changeOrigin: true
      }
    }
  }
}
