import Vue from 'vue'
import { Plugin } from 'vue-fragment';
import { BootstrapVue, IconsPlugin } from 'bootstrap-vue'
import Clipboard from 'v-clipboard'

import App from './App.vue'
// import store from './store'
import router from './router'
// import './assets/styles/index.scss'

Vue.use(Plugin);
Vue.use(BootstrapVue)
Vue.use(IconsPlugin)
Vue.use(Clipboard)

Vue.config.productionTip = false

const vue = new Vue({
  router,
  render: h => h(App),
}).$mount('#app')
