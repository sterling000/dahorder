const state = {
  token: null,
};

const mutations = {
  logout(state) {
    state.token = null;
  },
  login(state, token) {
    state.token = token;
  },
};

export default {
  namespaced: true,
  state,
  mutations,
};
