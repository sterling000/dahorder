<template>
  <div class="orders">
    <h2>Orders</h2>
    <div class="noSignin" v-if="!isSignedin">
      <p>Sign in to view your order history.</p>
    </div>
    <div class="can-toggle">
      <input type="checkbox" id="toggle" v-model="mode" />
      <label for="toggle">
        <div
          class="can-toggle__switch"
          data-checked="Sales"
          data-unchecked="Purchases"
        ></div>
      </label>
    </div>
    <div class="purchases" v-if="!mode">
      <h3>Purchases</h3>
      <div class="noReceipts" v-if="this.receipts && orderIds.length < 1">
        <p>You have not placed any orders yet.</p>
      </div>
      <ul>
        <li
          class="purchase"
          v-for="order in sortable(receipts).sort(sortOrders)"
          :key="order.orderId"
        >
          <receipt
            :date="localDateTime(order.date)"
            :order="order"
            @checkout="checkout"
            :mode="mode"
            v-if="order !== undefined"
            @cancel="cancel"
          />
        </li>
      </ul>
    </div>
    <div class="sales" v-show="mode">
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
              <receipt
                :date="localDateTime(sale.date)"
                :order="sale"
                :mode="mode"
                v-if="sale !== undefined"
              />
              <!-- @complete="complete" -->
            </li>
          </ul>
        </li>
      </ul>
    </div>
  </div>
</template>

<script>
import { mapState } from "vuex";
export default {
  data() {
    return {
      sales: {},
      shops: [],
      mode: false,
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
      const date = new Date(utc);
      return `${date.toLocaleDateString()} `; //${date.toLocaleTimeString()}
    },
    checkout(order) {
      this.$router.push(`/checkout/${order.orderId}`);
    },
    cancel(order) {
      this.$router.push(`/cancel/${order.orderId}`);
    },
    // complete(order){
    //   console.log("")
    // }
    sortable(obj) {
      let result = [];
      const keys = Object.keys(obj);
      keys.map((key) => {
        result.push(obj[key]);
      });
      return result;
    },
    sortOrders(a, b) {
      if (a.updated !== undefined && b.updated === undefined) {
        return -1;
      } else if (a.updated === undefined && b.updated !== undefined) {
        return 1;
      } else if (a.updated !== undefined && b.updated !== undefined) {
        if (a.updated > b.updated) {
          return -1;
        } else {
          return 1;
        }
      } else {
        if (a.date > b.date) {
          return -1;
        } else {
          return 1;
        }
      }
    },
  },
};
</script>

<style lang="scss">
@import "../assets/styles/config.scss";
@import "../assets/styles/toggle.scss";
.orders {
  padding: 4em 1em;
  h2 {
    margin: 0 0 0.5em;
  }
  ul {
    margin: 2em 1em;
    li.sale {
      margin: 0.25em;
      .status {
        text-transform: uppercase;
        font-size: 18px;
        font-weight: 600;
      }
    }
  }
}
</style>
