import Vue from 'vue'
import App from './App.vue'
import router from "./router";
import store from "./store";
import Notification from "./components/notification.vue";
import PulseLoader from 'vue-spinner/src/PulseLoader.vue';
Vue.config.productionTip = false
Vue.component("notification", Notification);
Vue.component("pulse-loader", PulseLoader);
new Vue({
  router, 
  store,
  render: h => h(App),
}).$mount('#app')
