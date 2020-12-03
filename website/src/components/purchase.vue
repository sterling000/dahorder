<template>
  <div class="purchase">
    <div
      class="wrapper collapsible"
      ref="collapsible"
      @click.prevent="collapsibleClicked"
    >
      <p>{{ localDate(order.date) }}</p>
      <p id="shopName">{{ order.shopName }}</p>
      <p>{{ order.total }} RM</p>
      <p>{{ order.status }}</p>
    </div>
    <div class="content">
      <ul>
        <li class="item">
          <div class="itemInfo">
            <strong>Time</strong>
            <p>{{ localTime(order.date) }}</p>
          </div>
          <div class="itemInfo">
            <strong>Order</strong>
            <p @click="clipboard">{{ order.orderId }}</p>
          </div>
          <div class="itemInfo">
            <strong>Recipient</strong>
            <p>{{ order.owner }}</p>
          </div>
          <div class="itemInfo">
            <strong>Products</strong>
            <ul class="products">
              <li
                class="product"
                v-for="(value, index) in order.products"
                :key="index"
              >
                <p>{{ value.product.name }}</p>
                <p>{{ value.product.price }} RM</p>
                <p>x{{ value.product.quantity }}</p>
                <!-- <p>{{ value.product.delivery }}</p> -->
                <p class="subtotal">{{ value.subtotal }} RM</p>
              </li>
            </ul>
          </div>
        </li>
      </ul>
    </div>
  </div>
</template>

<script>
export default {
  props: ["order", "date"],
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
  },
};
</script>

<style lang="scss" scoped>
@import "../assets/styles/config.scss";
.purchase {
  margin: 0.5em 0;
  border: solid 1px grey;
  #shopName {
    text-transform: capitalize;
  }
  .collapsible {
    cursor: pointer;
    outline: none;
    background-color: #fff;
  }
  .active {
    background-color: $color-primary-0;
    color: #fff;
  }
  .content {
    ul {
      margin: 0.5em;
    }
    .products {
      margin: 0;
    }
    .product {
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
