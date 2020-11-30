<template>
  <div class="admin">
    <h2>Admin</h2>
    <h3>Orders awaiting Payment</h3>
    <h4 v-if="orders && orders.length < 1">
      There are no orders with status <span style="color: orange;">paid</span>
    </h4>
    <ul class="order-list">
      <li class="order" v-for="order in orders" :key="order.orderId">
        <div class="date">
          <h3>Date</h3>
          <p>{{ localDateTime(order.date) }}</p>
        </div>
        <div class="offerId">
          <h3>Id</h3>
          <p>{{ order.orderId }}</p>
        </div>
        <div class="total">
          <h3>Total</h3>
          <p>{{ order.total }}</p>
        </div>
        <div
          class="image"
          :style="{ backgroundImage: 'url(' + order.payment + ')' }"
          @click.prevent="viewImage(order.payment)"
        />
        <div class="status">
          <h3>Status</h3>
          <p>{{ order.status }}</p>
        </div>
        <div class="confirm">
          <h3>Confirm</h3>
          <button @click.prevent="confirm(order, true)">Confirm</button>
          <button @click.prevent="confirm(order, false)">Deny</button>
        </div>
      </li>
    </ul>
  </div>
</template>

<script>
import axios from "axios";
import { mapState } from "vuex";
export default {
  data() {
    return {
      orders: [],
    };
  },
  computed: {
    ...mapState("account", {
      token: (state) => state.token,
    }),
  },
  async mounted() {
    this.getOrders();
  },
  methods: {
    async confirm(order, isConfirmed) {
      this.$store.commit("loading/start");
      try {
        const options = {
          headers: {
            Authorization: `Bearer ${this.token}`,
          },
        };
        const params = {
          shopId: order.shopId,
          date: order.date,
          isConfirmed: isConfirmed,
        };
        await axios.post(
          `${process.env.VUE_APP_ADMIN_SERVICE}/purchase/confirm`,
          params,
          options
        );
      } catch (error) {
        console.error(error);
        this.$store.commit("loading/stop");
      }
      this.getOrders();
    },
    localDateTime: (utc) => {
      console.debug("date from response: ", utc);
      const date = new Date(utc);
      return `${date.toLocaleDateString()} ${date.toLocaleTimeString()}`;
    },
    viewImage: (url) => {
      window.open(url, "_blank", "noreferrer");
    },
    async getOrders() {
      this.orders = [];
      this.$store.commit("loading/start");
      try {
        const res = await axios.get(
          `${process.env.VUE_APP_ADMIN_SERVICE}/orders`,
          {
            headers: {
              Authorization: `Bearer ${this.token}`,
            },
          }
        );
        this.orders = res.data;
      } catch (err) {
        console.error("Error: ", err);
        this.$store.commit("loading/stop");
      }
      this.$store.commit("loading/stop");
    },
  },
};
</script>

<style lang="scss">
.admin {
  max-width: 1200px;
  margin: 4em auto;
  .order {
    display: flex;
    border: solid 1px black;

    .date,
    .offerId {
      margin: 0.5em;
      text-align: left;
    }
    .status p {
      color: orange;
      margin: 0.5em;
    }
    .total {
      margin: 0.5em;
    }
    .image {
      margin: 0.5em;
      background-size: cover;
      width: 20%;
      height: 8em;
      cursor: pointer;
    }
  }
}
</style>
