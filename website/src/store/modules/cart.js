const state = {
  products: [],
};

const mutations = {
  add(state, product) {
    const { id, name, quantity, price } = product;
    const cartItem = {
      id,
      name,
      quantity,
      price,
    };
    const increment = state.products.find((el) => {
      return el.id === id;
    });
    if (increment !== undefined) {
      increment.quantity++;
    } else {
      state.products = [...state.products, cartItem];
    }
  },
  remove(state, product) {
    state.products = state.products.filter((e) => {
      return e.id !== product.id;
    });
  },
  clear(state) {
    state.products = [];
  },
};

export default {
  namespaced: true,
  state,
  mutations,
};
