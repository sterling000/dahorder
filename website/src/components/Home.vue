<template>
  <div class="home">
    <div class="category">
      <h2>Recent</h2>
      <div class="carousel">
        <ul>
          <li v-for="shop in shops.data" :key="shop.id">
            <store v-bind:store="shop" @selected="selectStore"></store>
          </li>
        </ul>
      </div>
    </div>
  </div>
</template>

<script>
import axios from "axios";
export default {
  data() {
    return {
      shops: [],
    };
  },
  mounted() {
    this.$store.commit("loading/start");
    this.getShops();
  },
  methods: {
    selectStore: function(event) {
      this.$store.commit("loading/start");
      this.$router.push(`/products/${event.id}`);
    },
    getShops: async function() {
      this.shops = await axios.get(
        `${process.env.VUE_APP_SHOP_SERVICE_URL}/listshops`
      );
      this.$store.commit("loading/stop");
    },
  },
};
</script>

<style lang="scss" scoped>
@import "../assets/styles/config.scss";

.home {
  overflow-y: auto;
  padding: 10vh 0;
}
.category {
  margin: 1em;
  h2 {
    color: #000;
  }
}
.carousel {
  padding: 15px 0 0 0;
  overflow: scroll;
  overflow-y: hidden;
  ul {
    display: grid;
    grid-gap: 10px;
    grid-template-columns: 10px;
    grid-auto-flow: column;
    grid-auto-columns: calc(50% - 20 * 2);
    grid-template-rows: minmax(175px, 1fr);
    &::before,
    ::after {
      content: "";
      width: 10px;
    }
  }
}
</style>
