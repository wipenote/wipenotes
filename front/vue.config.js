module.exports = {
  lintOnSave: false,
  devServer: {
    open: true,
    watchOptions: {
      poll: true
    },
    proxy: 'https://api.breachreport.com'
  },
  css: {}
  // plugins: [
  //   new webpack.ProvidePlugin({
  //     $: 'jquery',
  //     jquery: 'jquery',
  //     'window.jQuery': 'jquery',
  //     jQuery: 'jquery'
  //   })
  // ]
}
