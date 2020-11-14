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

export default {
  namespaced: true,
  state,
  mutations,
};
