const state = {
  recentShops: [],
};

const mutations = {
  rememberShop(state, shop) {
    if (state.recentShops.find((recentShop) => recentShop.id == shop.id)) {
      return;
    }
    state.recentShops = [shop, ...state.recentShops];
  },
  clear(state) {
    state.recentShops = [];
  },
};

const actions = {};

export default {
  namespaced: true,
  state,
  mutations,
  actions,
};
