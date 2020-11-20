<template>
  <div class="cart">
    <h2>Shopping Cart</h2>
    <div
      class="noProducts"
      v-show="Object.keys($store.state.cart.products).length < 1"
    >
      <h3>
        Your cart is empty.
        <br /><br />Browse shops buy pressing
        <font-awesome-icon class="shortcut-icon" :icon="['fas', 'utensils']" />
        or going to the <strong>Home</strong> page through the menu.
      </h3>
    </div>
    <div
      v-show="
        Object.keys($store.state.cart.products).length > 0 &&
          shopDetails.length > 0
      "
      class="byShop"
      v-for="shop in shops"
      :key="shop.id"
    >
      <h3 class="shop">{{ shopNameById(shop.id) }}</h3>
      <table>
        <thead>
          <tr>
            <th>Item</th>
            <th>Quantity</th>
            <th>Price</th>
          </tr>
        </thead>
        <tr v-for="product in productsByShop(shop.id)" :key="product.id">
          <td>{{ product.name }}</td>
          <td>
            {{ product.quantity }}
          </td>
          <td>{{ product.price }} RM</td>
        </tr>
      </table>

      <h3 class="total">
        Total:
        <span class="totalNum">{{ total(productsByShop(shop.id)) }} RM</span>
      </h3>

      <button
        class="checkout"
        @click="checkout(shop)"
        v-show="Object.keys($store.state.cart.products).length > 0"
      >
        Check Out
      </button>
    </div>

    <button
      class="clear"
      @click="clear"
      v-show="Object.keys($store.state.cart.products).length > 0"
    >
      Clear All
    </button>
  </div>
</template>

<script>
import axios from "axios";
export default {
  methods: {
    clear() {
      this.$store.commit("cart/clear");
    },
    checkout(shop) {
      this.$router.push(`/checkout/${shop.id}/${shop.owner}`);
    },
    total(products) {
      if (products.length > 0) {
        return products.reduce(
          (acc, curr) => acc + curr.price * curr.quantity,
          0
        );
      }
    },
    productsByShop(shop) {
      return this.$store.state.cart.products[shop];
    },
    getShops: async function() {
      const promises = [];
      this.shops.forEach((shop) => {
        promises.push(
          axios.get(`${process.env.VUE_APP_SHOP_SERVICE_URL}/shop`, {
            params: { owner: shop.owner, id: shop.id },
          })
        );
      });
      await Promise.all(promises).then((result) => {
        result.forEach((response) => this.shopDetails.push(response.data[0]));
      });

      this.$store.commit("loading/stop");
    },
    shopById(id) {
      const shop = this.shopDetails.find((shop) => shop.id === id);
      if (shop === undefined) {
        return { name: "", id: "" };
      }
      return shop;
    },
    shopNameById(id) {
      const shop = this.shopById(id);
      if (shop !== null) {
        return shop.name;
      }
      return "";
    },
  },
  data() {
    return {
      shopDetails: [],
    };
  },
  computed: {
    shops() {
      const result = [];
      Object.keys(this.$store.state.cart.products).forEach((shopId) =>
        result.push({
          owner: this.$store.state.cart.products[shopId][0].owner,
          id: shopId,
        })
      );
      return result;
    },
  },
  mounted() {
    this.$store.commit("loading/start");
    this.getShops();
  },
};
</script>

<style lang="scss">
@import "../assets/styles/config.scss";
.cart {
  padding: 4em 1em;
  .shop {
    font-size: 24px;
    text-align: center;
    margin: 1em 0 0;
  }
  td {
    padding: 1em;
    text-align: right;
  }
  .totalNum {
    margin: 0 2em;
    color: #55ff55;
  }

  button.checkout {
    display: block;
    background-color: $color-primary-0;
    color: $color-primary-4;
    width: 100%;
    height: 2em;
    box-shadow: 0 4px 8px 0 rgba(0, 0, 0, 0.2), 0 6px 20px 0 rgba(0, 0, 0, 0.19);
    border-radius: 5%;
    border: solid 1px $color-primary-0;
    font-size: 40px;
    font-weight: 600;
    margin: 0.5em 0;
    &:disabled {
      background-color: rgb(143, 143, 143);
      color: #000;
    }
  }
  button.clear {
    display: block;
    background-color: $color-primary-2;
    color: $color-primary-3;
    width: 100%;
    height: 2em;
    box-shadow: 0 4px 8px 0 rgba(0, 0, 0, 0.2), 0 6px 20px 0 rgba(0, 0, 0, 0.19);
    border-radius: 5%;
    border: solid 1px $color-primary-0;
    font-size: 18px;
    margin: 2em 0;
    padding: 0.5em;
    &:disabled {
      background-color: rgb(143, 143, 143);
      color: #000;
    }
  }
}
</style>
