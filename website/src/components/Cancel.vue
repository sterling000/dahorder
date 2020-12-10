<template>
  <div class="cancelOrder">
    <h2>Cancel Order</h2>

    <h3>Are you sure you want to cancel your order?</h3>
    <div class="wrapper">
      <button class="confirm" @click="confirm()">
        Yes
      </button>
      <button class="cancel" @click="cancel()">
        No
      </button>
    </div>
  </div>
</template>

<script>
import { mapState } from "vuex";
export default {
  async mounted() {
    this.$store.commit("loading/start");
    await this.getOrderDetails();

    this.$store.commit("loading/stop");
  },
  methods: {
    async confirm() {
      console.log("Cancelling order...");
      this.$store.commit("loading/start");

      await this.$http.post(
        `${process.env.VUE_APP_ORDER_SERVICE_URL}/cancel`,
        {
          shop: this.shop.id,
          date: this.orders[this.orderId].date,
          reason: "Client Requested",
        },
        {
          headers: {
            Authorization: `Bearer ${this.$store.state.account.token}`,
          },
        }
      );
      this.$store.commit("loading/stop");
      console.log("Order Cancelled!");
      this.$router.push("/orders");
    },
    cancel() {
      this.$router.back();
    },
    getOrderDetails: async function() {
      console.debug(this.orderId);
      if (this.orders[this.orderId] === undefined) {
        console.debug("order does not exist yet.");
      }
      console.debug("getOrderDetails", this.orders);
      const order = this.orders[this.orderId];
      console.debug("order:", order);
      const shopResponse = await this.$http.get(
        `${process.env.VUE_APP_SHOP_SERVICE_URL}/shop`,
        {
          params: {
            owner: this.orders[this.orderId].owner,
            id: this.orders[this.orderId].shopId,
          },
        }
      );
      console.debug(shopResponse.data);
      this.shop = shopResponse.data[0];
    },
  },
  computed: {
    ...mapState("cart", {
      orders: (state) => state.orders,
    }),
    orderId() {
      return this.$route.params.orderId;
    },
  },
};
</script>

<style lang="scss">
@import "../assets/styles/config.scss";
.cancelOrder {
  padding: 4em 1em;
  .wrapper {
    display: flex;
    justify-content: space-evenly;
    button.confirm {
      display: block;
      background-color: $color-primary-0;
      color: $color-primary-4;
      width: 100%;
      height: 2em;
      box-shadow: 0 4px 8px 0 rgba(0, 0, 0, 0.2),
        0 6px 20px 0 rgba(0, 0, 0, 0.19);
      border-radius: 5%;
      border: solid 1px $color-primary-0;
      font-size: 40px;
      font-weight: 600;
      margin: 0.5em 0;
    }
    button.cancel {
      display: block;
      background-color: rgb(143, 143, 143);
      color: #fff;
      width: 100%;
      height: 2em;
      box-shadow: 0 4px 8px 0 rgba(0, 0, 0, 0.2),
        0 6px 20px 0 rgba(0, 0, 0, 0.19);
      border-radius: 5%;
      border: solid 1px #fff;
      font-size: 40px;
      font-weight: 600;
      margin: 0.5em 0;
    }
  }
}
</style>
