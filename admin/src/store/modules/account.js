const state = {
  token: null
};

const mutations = {
  logout(state) {
    state.token = null;
  },
  login(state, token) {
    state.token = token;
  }
};

const actions = {
  logout(context) {
    context.commit("logout");
    context.commit("loading/stop", null, { root: true });
  },
};

export default {
  namespaced: true,
  state,
  mutations,
  actions,
};
