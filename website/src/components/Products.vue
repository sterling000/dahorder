<template>
  <div class="products">
    <div class="category">
      <h2>Products</h2>
      <ul>
        <li v-for="product in products" :key="product.id">
          <product v-bind:product="product" @selected="selectProduct"></product>
        </li>
        <li>
          <div
            v-show="
              this.$store.state.account.token !== null &&
                this.$store.state.account.user.role !== 'buyer'
            "
            class="new"
            @click="newProduct"
          >
            <font-awesome-icon class="shortcut-icon" :icon="['fas', 'plus']" />
            <h2>New</h2>
          </div>
        </li>
      </ul>
    </div>
  </div>
</template>

<script>
import axios from "axios";
export default {
  data() {
    return {
      products: [],
    };
  },
  methods: {
    newProduct: function() {
      this.$router.push(`/newproduct/${this.$route.params.id}`);
    },
    getProducts: async function() {
      const options = {
        headers: { Authorization: `Bearer ${this.$store.state.account.token}` },
        params: {
          shop: this.$route.params.id,
        },
      };
      const res = await axios.get(
        `${process.env.VUE_APP_PRODUCT_SERVICE_URL}/products`,
        options
      );
      this.$store.commit("loading/stop");
      console.log(res);
      this.products = res.data;
    },
    selectProduct: function(event) {
      console.log("selectProduct", event);
      this.$router.push(`/product/${event.id}`);
    },
  },
  mounted() {
    this.$store.commit("loading/start");
    this.getProducts();
  },
};
</script>

<style lang="scss">
@import "../assets/styles/config.scss";
.products {
  overflow-y: auto;
  padding: 10vh 5vh 15vh;

  .category {
    margin: 1em;
    display: grid;
    grid-gap: 10px;
    grid-template-columns: repeat(1fr);
    .product {
      padding: 0.5em 0;
      box-shadow: 0 4px 8px 0 rgba(0, 0, 0, 0.2),
        0 6px 20px 0 rgba(0, 0, 0, 0.19);
      width: 260px;
      height: 167px;
      border-radius: 5%;
      background-color: $color-primary-0;
      h2 {
        font-size: 18px;
      }
    }

    .new {
      padding: 0.5em 0;
      box-shadow: 0 4px 8px 0 rgba(0, 0, 0, 0.2),
        0 6px 20px 0 rgba(0, 0, 0, 0.19);
      width: 260px;
      height: 167px;
      border-radius: 5%;
      background-color: $color-primary-0;
      color: $color-primary-3;
      h2 {
        font-size: 36px;
        margin: 0;
        text-align: center;
      }
      .shortcut-icon {
        font-size: 64px;
        text-align: center;
        margin: 0.7em 1.6em 0;
      }
    }
  }
}
</style>
