<template>
  <div class="shops">
    <div class="category">
      <h2>Shops</h2>
      <div class="notASeller" v-show="!isSeller">
        <h3>
          Your role is 'Buyer', update your account in the menu under
          <span class="myAccount">My Account</span> to begin selling products.
        </h3>
      </div>
      <ul v-show="isSeller">
        <li v-for="shop in shops" :key="shop.id">
          <store v-bind:store="shop" @selected="selectStore"></store>
        </li>
        <li>
          <div class="new" @click="newShop">
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
      shops: [],
    };
  },
  methods: {
    newShop: function() {
      this.$router.push("/newshop");
    },
    getShops: async function() {
      const options = {
        headers: { Authorization: `Bearer ${this.$store.state.account.token}` },
      };

      const res = await axios.get(
        `${process.env.VUE_APP_SHOP_SERVICE_URL}/myshops`,
        options
      );
      this.shops = res.data.shops;
      this.$store.commit("loading/stop");
    },
    selectStore: function(event) {
      this.$router.push(`/products/${event.id}/${event.pk}`);
    },
  },
  mounted() {
    if (this.$store.state.account.token === null) {
      this.$router.push("/login");
      return;
    }
    this.$store.commit("loading/start");
    this.getShops();
  },
  computed: {
    isSeller() {
      return (
        this.$store.state.account.user.role === "seller" ||
        this.$store.state.account.user.role === "both"
      );
    },
  },
};
</script>

<style lang="scss">
@import "../assets/styles/config.scss";
.shops {
  overflow-y: auto;
  padding: 10vh 5vh 15vh;

  .category {
    margin: 1em;
    display: grid;
    grid-gap: 10px;
    grid-template-columns: repeat(1fr);
    .store {
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
