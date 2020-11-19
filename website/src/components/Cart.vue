<template>
  <div class="cart">
    <h2>Shopping Cart</h2>
    <table>
      <thead>
        <tr>
          <th>Item</th>
          <th>Quantity</th>
          <th>Price</th>
        </tr>
      </thead>
      <tr v-for="product in $store.state.cart.products" :key="product.id">
        <td>{{ product.name }}</td>
        <td>{{ product.quantity }}</td>
        <td>{{ product.price }}</td>
      </tr>
    </table>

    <button class="checkout" @click="checkout">Check Out</button>
    <button class="clear" @click="clear">Clear</button>
  </div>
</template>

<script>
export default {
  methods: {
    clear() {
      this.$store.commit("cart/clear");
    },
    checkout() {
      console.log("Proceeding to checkout");
    },
  },
};
</script>

<style lang="scss">
@import "../assets/styles/config.scss";
.cart {
  padding: 4em 1em;
}
</style>
