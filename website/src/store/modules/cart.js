import Vue from 'vue';

const state = {
  products: {
  },
};

const mutations = {
  add(state, product) {
    const { id, name, quantity, price, shop, owner } = product;
    const cartItem = {
      id: id,
      name: name,
      price: price,
      quantity: 1,
      remaining: quantity,
      shop: shop,
      owner: owner,
    };
    console.debug("cartItem", cartItem);
    let shopProductsForNewProduct = state.products[shop];
    console.debug(
      "looking for shop with an item with the same id.",
      shopProductsForNewProduct
    );
    if (shopProductsForNewProduct) {
      const increment = shopProductsForNewProduct.find((el) => {
        return el.id === id;
      });
      if (increment !== undefined) {
        increment.quantity++;
      } else {
        shopProductsForNewProduct = [...shopProductsForNewProduct, cartItem];
      }
    } else {
      state.products = {...state.products, [cartItem.shop]: [cartItem]};
    }
  },
  clear(state, storeId) {
    Vue.delete(state.products, storeId);
  },
};

export default {
  namespaced: true,
  state,
  mutations,
};
