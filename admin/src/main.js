import Vue from "vue";
import App from "./App.vue";
import router from "./router";
import store from "./store";
import Notification from "./components/notification.vue";
import PulseLoader from "vue-spinner/src/PulseLoader.vue";
import axios from "axios";
Vue.config.productionTip = false;
Vue.component("notification", Notification);
Vue.component("pulse-loader", PulseLoader);

Vue.prototype.$http = axios;
new Vue({
  router,
  store,
  render: (h) => h(App),
}).$mount("#app");
