<template>
  <div class="orders">
    <h2>Orders</h2>
    <div class="noSignin" v-show="!isSignedin">
      <p>Sign in to view your order history.</p>
    </div>

    <div class="purchases">
      <h3>Purchases</h3>
      <div class="noReceipts" v-show="this.receipts && orderIds.length < 1">
        <p>You have not placed any orders yet.</p>
      </div>
      <ul>
        <li class="purchase" v-for="orderId in orderIds" :key="orderId">
          <purchase
            :date="localDateTime(receipts[orderId].date)"
            :order="receipts[orderId]"
            @checkout="checkout"
          />
          <!-- <h6>Date:</h6>
          {{ localDateTime(receipts[orderId].date) }}
          <h6>Total:</h6>
          {{ receipts[orderId].total }} RM
          <h6>Status:</h6>
          {{ receipts[orderId].status }}
          <button
            class="checkout"
            @click="checkout(receipts[orderId])"
            v-show="receipts[orderId].status === 'pending'"
          >
            Check Out
          </button> -->
        </li>
      </ul>
    </div>
    <div class="sales"></div>
    <h3>Sales</h3>
    <div class="noReceipts" v-show="saleIds.length < 1">
      <p>You have not sold any products yet.</p>
    </div>
    <ul>
      <li
        class="shop"
        v-for="(shop, propertyName) in this.sales"
        :key="propertyName"
      >
        <ul>
          <li class="sale" v-for="sale in shop" :key="sale.orderId">
            <h6>Date:</h6>
            <p class="date">{{ localDateTime(sale.date) }}</p>
            <h6>Total:</h6>
            <p class="total">{{ sale.total }} RM</p>
            <h6>Status:</h6>
            <p class="status">{{ sale.status }}</p>
          </li>
        </ul>
      </li>
    </ul>
  </div>
</template>

<script>
import { mapState } from "vuex";
export default {
  data() {
    return {
      sales: {},
      shops: [],
    };
  },
  async mounted() {
    if (this.isSignedin) {
      this.$store.commit("loading/start");
      this.getReceipts();
      await this.getShops();

      this.$store.commit("loading/stop");
    }
  },
  computed: {
    ...mapState("cart", {
      receipts: (state) => state.orders,
    }),
    orderIds() {
      return Object.keys(this.receipts);
    },
    isSignedin() {
      return this.$store.state.account.token !== null;
    },
    saleIds() {
      return Object.keys(this.sales);
    },
  },
  methods: {
    getShops: async function() {
      const options = {
        headers: { Authorization: `Bearer ${this.$store.state.account.token}` },
      };

      const res = await this.$http.get(
        `${process.env.VUE_APP_SHOP_SERVICE_URL}/myshops`,
        options
      );
      this.shops = res.data.shops;
      await Promise.all(
        this.shops.map(async (shop) => {
          await this.getOrders(shop.id);
        })
      );
    },
    getReceipts: async function() {
      const receiptResponse = await this.$http.get(
        `${process.env.VUE_APP_ORDER_SERVICE_URL}/receipts`,
        {
          headers: {
            Authorization: `Bearer ${this.$store.state.account.token}`,
          },
        }
      );
      console.debug("receiptResponse", receiptResponse);
      this.$store.commit("cart/setOrders", receiptResponse.data);
    },
    getOrders: async function(shopId) {
      const orderResponse = await this.$http.get(
        `${process.env.VUE_APP_ORDER_SERVICE_URL}/orders`,
        {
          params: {
            shop: `${shopId}`,
          },
          headers: {
            Authorization: `Bearer ${this.$store.state.account.token}`,
          },
        }
      );
      console.debug("orderResponse", orderResponse);
      if (orderResponse.data.length > 0) {
        const orderByStore = orderResponse.data;
        this.sales = { ...this.sales, [shopId]: orderByStore };
      }
    },

    localDateTime(utc) {
      // console.debug("date from response: ", utc);
      const date = new Date(utc);
      return `${date.toLocaleDateString()} `; //${date.toLocaleTimeString()}
    },
    checkout(purchase) {
      this.$router.push(`/checkout/${purchase.orderId}`);
    },
  },
};
</script>

<style lang="scss">
@import "../assets/styles/config.scss";
.orders {
  padding: 4em 1em;
  h2 {
    margin: 0 0 0.5em;
  }
  ul {
    margin: 2em 1em;
    li.sale {
      margin: 0.25em;
      border-top: 1px solid grey;
      &:last-child {
        border-top: 1px solid grey;
        border-bottom: 1px solid grey;
      }
      .status {
        text-transform: uppercase;
        font-size: 18px;
        font-weight: 600;
      }
    }
  }
}
</style>
