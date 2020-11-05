import Vue from 'vue'
import { Plugin } from 'vue-fragment';

import App from './App.vue'
// import store from './store'
import router from './router'
import './assets/styles/index.scss'

Vue.use(Plugin);

Vue.config.productionTip = false

const vue = new Vue({
  router,
  render: h => h(App),
}).$mount('#app')
