import Vue from "vue";
import Vuex from "vuex";
import account from "./modules/account";
import createPersistedState from "vuex-persistedstate";
import Cookies from "js-cookie";
Vue.use(Vuex);

const storageOptions = {
  storage: {
    getItem: (key) => Cookies.get(key),
    setItem: (key, value) =>
      Cookies.set(key, value, { expires: 3, secure: false }),
    removeItem: (key) => Cookies.remove(key),
  },
};

export default new Vuex.Store({
  state: {},
  mutations: {},
  actions: {},
  modules: {
    account,
  },
  plugins: [createPersistedState(storageOptions)],
});
