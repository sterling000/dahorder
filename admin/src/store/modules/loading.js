const state = {
  loading: true,
};

const mutations = {
  start(state) {
    state.loading = true;
  },
  stop(state) {
    state.loading = false;
  },
};

export default {
  namespaced: true,
  state,
  mutations,
};
