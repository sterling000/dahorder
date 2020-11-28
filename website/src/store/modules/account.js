const state = {
  token: null,
  user: null,
};

const mutations = {
  logout(state) {
    state.token = null;
    state.user = null;
  },
  login(state, token) {
    state.token = token;
  },
  user(state, data) {
    state.user = data;
  },
};

const actions = {
  logout(context) {
    context.commit("logout");
    context.commit("cart/logout", null, { root: true });
    context.commit("cart/clearOrders", null, { root: true });
    context.commit("loading/stop", null, { root: true });
  },
};

export default {
  namespaced: true,
  state,
  mutations,
  actions,
};
