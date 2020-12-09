import Vue from 'vue'
import { Plugin } from 'vue-fragment';
import { BootstrapVue, IconsPlugin, ToastPlugin } from 'bootstrap-vue'
import Clipboard from 'v-clipboard'

import App from './App.vue'
import router from './router'
import '@fortawesome/fontawesome-free/js/all.js'

Vue.use(Plugin)
Vue.use(BootstrapVue)
Vue.use(ToastPlugin)
Vue.use(IconsPlugin)
Vue.use(Clipboard)

Vue.config.productionTip = false

const vue = new Vue({
  router,
  render: h => h(App),
}).$mount('#app')
