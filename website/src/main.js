import Vue from "vue";
import App from "./App.vue";
import router from "./router";
import store from "./store";
import Vuelidate from "vuelidate";
import { library } from "@fortawesome/fontawesome-svg-core";
import {
  faList,
  faUtensils,
  faMoneyBillWave,
  faShoppingCart,
  faPlus,
  faFileUpload,
  faCamera,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/vue-fontawesome";
import Store from "./components/store.vue";
import Product from "./components/product.vue";
import ImageUploader from "./components/image-uploader.vue";
import PulseLoader from "vue-spinner/src/PulseLoader.vue";
library.add(
  faList,
  faUtensils,
  faMoneyBillWave,
  faShoppingCart,
  faPlus,
  faFileUpload,
  faCamera
);
Vue.component("font-awesome-icon", FontAwesomeIcon);
Vue.component("store", Store);
Vue.component("product", Product);
Vue.component("image-uploader", ImageUploader);
Vue.component("pulse-loader", PulseLoader);
Vue.config.productionTip = false;

Vue.use(Vuelidate);

new Vue({
  router,
  store,
  render: (h) => h(App),
}).$mount("#app");
