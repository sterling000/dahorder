<template>
  <div class="cart">
    <h2>Shopping Cart</h2>
    <div class="noProducts" v-show="Object.keys(products).length < 1">
      <h3>
        Your cart is empty.
        <br /><br />Browse shops buy pressing
        <font-awesome-icon class="shortcut-icon" :icon="['fas', 'utensils']" />
        or going to the <strong>Home</strong> page through the menu.
      </h3>
    </div>
    <div
      v-show="Object.keys(products).length > 0 && shopDetails.length > 0"
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
            <p v-if="!edit">{{ product.quantity }}</p>
            <a v-if="!edit" href="#" class="edit" @click.prevent="toggleEdit"
              >Edit</a
            >
            <input
              v-if="edit"
              type="text"
              class="editQuantity"
              v-model="product.quantity"
              @blur="toggleEdit"
            />
          </td>
          <td>{{ product.price }} RM</td>
        </tr>
      </table>

      <label for="notes">Notes</label>
      <textarea
        id="notes"
        name="notes"
        placeholder="No onions, less spicy, buzzer #, please leave inside gate..."
        v-model="notes[shop.id]"
      />

      <h3 class="total">
        Total:
        <span class="totalNum">{{ total(productsByShop(shop.id)) }} RM</span>
      </h3>

      <button
        class="checkout"
        @click="placeOrder(shop)"
        v-show="Object.keys(products).length > 0"
      >
        Place Order
      </button>
      <button
        class="clear"
        @click="clear(shop)"
        v-show="Object.keys(products).length > 0"
      >
        Clear
      </button>
    </div>
  </div>
</template>

<script>
import Vue from "vue";
import { mapState } from "vuex";
export default {
  methods: {
    clear(shop) {
      this.$store.commit("cart/clearProducts", shop.id);
      Vue.delete(this.notes, shop.id);
    },
    placeOrder: async function(shop) {
      this.$store.commit("loading/start");
      console.log("Submitting...");
      const params = {
        shop: shop.id,
        owner: shop.owner,
        products: this.products[shop.id],
        delivery: true,
        notes: this.notes[shop.id],
      };
      const options = {
        headers: { Authorization: `Bearer ${this.$store.state.account.token}` },
      };
      const order = await this.$http.post(
        `${process.env.VUE_APP_ORDER_SERVICE_URL}/order`,
        params,
        options
      );
      this.$store.commit("loading/stop");
      console.debug(order);
      if (order.status === 203) {
        console.error(
          "There aren't enough of that product left for you to purchase that many!"
        );
        return;
      }
      console.log("Order Submitted");
      this.$store.commit("cart/clearProducts", shop.id);
      this.$store.commit("recent/rememberShop", this.shopById(shop.id));
      this.$router.push(`/orders`);
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
      return this.products[shop];
    },
    getShops: async function() {
      const promises = [];
      this.shops.forEach((shop) => {
        if (
          this.shopDetails.find((details) => details.id === shop.id) ===
          undefined
        ) {
          promises.push(
            this.$http.get(`${process.env.VUE_APP_SHOP_SERVICE_URL}/shop`, {
              params: { owner: shop.owner, id: shop.id },
            })
          );
        }
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
    toggleEdit() {
      this.edit = !this.edit;
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
      notes: {},
      edit: false,
    };
  },
  computed: {
    ...mapState("cart", {
      products: (state) => state.products,
    }),
    shops() {
      const result = [];
      Object.keys(this.products).forEach((shopId) =>
        result.push({
          owner: this.products[shopId][0].owner,
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
  .editQuantity {
    font-size: 1.5em;
    max-width: 5em;
    text-align: right;
  }
  textarea {
    resize: none;
    height: 8em;
    padding: 0.5em;
    text-align: left;
    margin-top: 0;
    width: 100%;
    box-shadow: 0 4px 8px 0 rgba(0, 0, 0, 0.2), 0 6px 20px 0 rgba(0, 0, 0, 0.19);
    border-radius: 5%;
    border: solid 1px $color-primary-0;
    overflow: auto;
    font-size: 1.5em;
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
