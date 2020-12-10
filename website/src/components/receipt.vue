<template>
  <div class="receipt">
    <div
      class="wrapper collapsible"
      ref="collapsible"
      @click.prevent="collapsibleClicked"
    >
      <p id="shopName" v-if="!mode">{{ order.shopName }}</p>
      <p id="shopName" v-if="mode && order !== undefined">
        {{ order.userName.name }}
      </p>
      <p id="total">{{ order.total }} RM</p>
      <p id="status">{{ order.status }}</p>
    </div>
    <div class="content">
      <ul>
        <li class="item">
          <div class="itemInfo">
            <strong>Order</strong>
            <p @click="clipboard">{{ order.orderId }}</p>
          </div>
          <div class="itemInfo">
            <strong>Time</strong>
            <div class="wrapper">
              <p>{{ localTime(order.date) }}</p>
              <p>{{ localDate(order.date) }}</p>
            </div>
          </div>
          <div class="itemInfo">
            <strong>Recipient</strong>
            <p>{{ order.owner }}</p>
          </div>
          <div class="itemInfo">
            <strong>Products</strong>
          </div>
          <ul class="products-list">
            <li
              class="product-entry"
              v-for="(value, index) in order.products"
              :key="index"
            >
              <p>{{ value.product.name }}</p>
              <p>{{ value.product.price }} RM</p>
              <p>x{{ value.quantity }}</p>
              <p>{{ pickupDelivery(value.product.delivery) }}</p>
              <p class="subtotal">{{ value.subtotal }} RM</p>
              <font-awesome-icon
                class="directions-icon"
                :icon="['fas', 'directions']"
                @click.prevent="directions"
                v-show="(value.product.delivery == 'true') == mode"
              />
            </li>
          </ul>
          <div class="itemInfo">
            <strong>Notes:</strong>
            <p>{{ order.notes }}</p>
          </div>

          <button
            class="checkout"
            @click="checkout"
            v-if="order.status === 'pending' && !mode"
          >
            Check Out
          </button>
          <button
            class="cancel"
            @click="cancel"
            v-if="
              order.status !== 'cancelled' &&
                order.status !== 'completed' &&
                !mode
            "
          >
            Cancel Order
          </button>
          <!-- <button
            class="complete"
            @click="complete"
            v-show="order.status === 'confirmed'"
          >
            Complete
          </button> -->
        </li>
      </ul>
    </div>
  </div>
</template>

<script>
export default {
  data() {
    return {
      address: "",
    };
  },
  props: ["order", "date", "mode"],
  async mounted() {
    // todo: every receipt shouldn't be looking up this data it should be passed down in a prop.
    const owner = await this.$http.get(
      `${process.env.VUE_APP_USER_SERVICE_URL}/user`,
      {
        params: { user: this.order.owner },
      }
    );
    if (owner.status === 200) {
      this.address = `${owner.data.condo} - ${owner.data.apartment}`;
    }
  },
  methods: {
    localDate(utc) {
      const date = new Date(utc);
      return `${date.toLocaleDateString()} `; //${date.toLocaleTimeString()}
    },
    localTime(utc) {
      const date = new Date(utc);
      return `${date.toLocaleTimeString()}`;
    },
    collapsibleClicked() {
      this.$refs["collapsible"].classList.toggle("active");

      var content = this.$refs["collapsible"].nextElementSibling;
      if (content.style.maxHeight) {
        content.style.maxHeight = null;
      } else {
        content.style.maxHeight = content.scrollHeight + "px";
      }
    },
    async clipboard() {
      await navigator.clipboard.writeText(this.order.orderId);
      console.log("Order Number copied to clipboard.");
    },
    checkout() {
      this.$emit("checkout", this.order);
    },
    cancel() {
      this.$emit("cancel", this.order);
    },
    complete() {
      this.$emit("complete", this.order);
    },
    pickupDelivery(delivery) {
      if (delivery) {
        return "Delivery";
      } else {
        return "Pick Up";
      }
    },
    async directions() {
      // todo: if !this.mode give this.address else give customer.address
      await navigator.clipboard.writeText(this.address);
      console.log(`${this.address} - Copied to clipboard!`);
    },
  },
};
</script>

<style lang="scss" scoped>
@import "../assets/styles/config.scss";
.receipt {
  margin: 0.5em 0;
  font-size: 0.75em;
  // border: solid 1px grey;
  #shopName {
    text-transform: capitalize;
    margin: 0 0.25em;
  }
  #status {
    text-transform: uppercase;
    font-weight: 600;
    font-size: 0.75em;
  }
  #total {
    margin: 0 0.25em;
  }
  .collapsible {
    cursor: pointer;
    outline: none;
    background-color: #fff;
    padding: 1em;
    box-shadow: 0 4px 8px 0 rgba(0, 0, 0, 0.2), 0 6px 20px 0 rgba(0, 0, 0, 0.19);
  }
  .active {
    background-color: $color-primary-0;
    color: #fff;
  }
  .content {
    ul {
      margin: 0.5em;
    }
    .products-list {
      margin: 0;
    }
    .product-entry {
      display: flex;
      justify-content: space-between;
      p {
        margin: 0 2px;
        .subtotal {
          color: green;
        }
      }
    }
    font-size: 12px;
    background-color: #f1f1f1;
    max-height: 0;
    overflow: hidden;
    transition: max-height 0.2s ease-out;
    .itemInfo {
      padding: 0.25em 0;
      display: flex;
      justify-content: space-between;
      .wrapper {
        display: flex;
        justify-content: space-between;
        p {
          text-align: center;
          margin: 0 0.25em;
        }
      }
    }
    button.checkout {
      display: block;
      background-color: $color-primary-0;
      color: #fff;
      width: 100%;

      box-shadow: 0 4px 8px 0 rgba(0, 0, 0, 0.2),
        0 6px 20px 0 rgba(0, 0, 0, 0.19);
      border-radius: 5%;
      border: solid 1px $color-primary-0;
      font-size: 1.5em;
      font-weight: 600;
      padding: 0.25em;
      text-transform: uppercase;
      &:disabled {
        background-color: rgb(143, 143, 143);
        color: #000;
      }
    }
    button.cancel {
      display: block;
      background-color: #f00;
      color: #fff;
      width: 100%;

      box-shadow: 0 4px 8px 0 rgba(0, 0, 0, 0.2),
        0 6px 20px 0 rgba(0, 0, 0, 0.19);
      border-radius: 5%;
      border: solid 1px $color-primary-0;
      font-size: 1.5em;
      font-weight: 600;
      padding: 0.25em;
      text-transform: uppercase;
      &:disabled {
        background-color: rgb(143, 143, 143);
        color: #000;
      }
    }
    button.complete {
      display: block;
      background-color: green;
      color: #fff;
      width: 100%;

      box-shadow: 0 4px 8px 0 rgba(0, 0, 0, 0.2),
        0 6px 20px 0 rgba(0, 0, 0, 0.19);
      border-radius: 5%;
      border: solid 1px $color-primary-0;
      font-size: 1.5em;
      font-weight: 600;
      padding: 0.25em;
      text-transform: uppercase;
      &:disabled {
        background-color: rgb(143, 143, 143);
        color: #000;
      }
    }
  }
  .wrapper {
    display: flex;
    justify-content: space-between;
    p {
      text-align: center;
    }
  }
}
</style>
