import Vue from "vue";

const state = {
  products: {},
  orders: {},
};

const mutations = {
  addProduct(state, product) {
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
      state.products = { ...state.products, [cartItem.shop]: [cartItem] };
    }
  },
  clearProducts(state, storeId) {
    Vue.delete(state.products, storeId);
  },
  logout(state) {
    Object.keys(state.products).forEach((key) =>
      Vue.delete(state.products, key)
    );
  },
  setOrders(state, orders) {
    console.debug("cart:orders", orders);
    state.orders = {};
    orders.forEach((order) => {
      state.orders = { ...state.orders, [order.orderId]: order };
    });
  },
  clearOrders(state) {
    state.orders = {};
  },
};

export default {
  namespaced: true,
  state,
  mutations,
};
