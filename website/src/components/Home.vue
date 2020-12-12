<template>
  <div class="home">
    <div v-if="recentShops.length > 0" class="category">
      <div class="wrapper">
        <h3>Recent</h3>
        <p
          v-if="!showAllRecent && recentShops.length > 5"
          class="showall"
          @click.prevent="toggleShowAll('showAllRecent')"
        >
          More
        </p>
        <p
          v-if="showAllRecent && recentShops.length > 5"
          class="showall"
          @click.prevent="toggleShowAll('showAllRecent')"
        >
          Less
        </p>
      </div>

      <div class="carousel">
        <ul>
          <li v-for="shop in recentShops" :key="shop.id">
            <store v-bind:store="shop" @selected="selectStore"></store>
          </li>
        </ul>
      </div>
    </div>
    <div class="category">
      <div class="wrapper">
        <h3>Food</h3>
        <p
          v-if="!showAllFood && foodShops.length > 5"
          class="showall"
          @click.prevent="toggleShowAll('showAllFood')"
        >
          More
        </p>
        <p
          v-if="showAllFood && foodShops.length > 5"
          class="showall"
          @click.prevent="toggleShowAll('showAllFood')"
        >
          Less
        </p>
      </div>
      <p v-if="foodShops.length == 0" class="empty">
        There aren't any food shops yet. If you have something to sell, Add a
        shop below by tapping
        <font-awesome-icon
          class="shortcut-icon"
          :icon="['fas', 'money-bill-wave']"
        />
      </p>
      <div v-if="foodShops.length > 0" class="carousel">
        <ul>
          <li v-for="shop in foodShops" :key="shop.id">
            <store v-bind:store="shop" @selected="selectStore"></store>
          </li>
        </ul>
      </div>
    </div>
    <div class="category">
      <div class="wrapper">
        <h3>Grocery</h3>
        <p
          v-if="!showAllGrocery && groceryShops.length > 5"
          class="showall"
          @click.prevent="toggleShowAll('showAllGrocery')"
        >
          More
        </p>
        <p
          v-if="showAllGrocery && groceryShops.length > 5"
          class="showall"
          @click.prevent="toggleShowAll('showAllGrocery')"
        >
          Less
        </p>
      </div>
      <p v-if="groceryShops.length == 0" class="empty">
        There aren't any grocery shops yet. If you have something to sell, Add a
        shop below by tapping
        <font-awesome-icon
          class="shortcut-icon"
          :icon="['fas', 'money-bill-wave']"
        />
      </p>
      <div v-if="groceryShops.length > 0" class="carousel">
        <ul>
          <li v-for="shop in groceryShops" :key="shop.id">
            <store v-bind:store="shop" @selected="selectStore"></store>
          </li>
        </ul>
      </div>
    </div>
    <div class="category">
      <div class="wrapper">
        <h3>Other</h3>
        <p
          v-if="!showAllOther && otherShops.length > 5"
          class="showall"
          @click.prevent="toggleShowAll('showAllOther')"
        >
          More
        </p>
        <p
          v-if="showAllOther && otherShops.length > 5"
          class="showall"
          @click.prevent="toggleShowAll('showAllOther')"
        >
          Less
        </p>
      </div>
      <p v-if="otherShops.length == 0" class="empty">
        There aren't any other shops yet. If you have something to sell, Add a
        shop below by tapping
        <font-awesome-icon
          class="shortcut-icon"
          :icon="['fas', 'money-bill-wave']"
        />
      </p>
      <div v-if="otherShops.length > 0" class="carousel">
        <ul>
          <li v-for="shop in otherShops" :key="shop.id">
            <store v-bind:store="shop" @selected="selectStore"></store>
          </li>
        </ul>
      </div>
    </div>
  </div>
</template>

<script>
// import { mapState } from "vuex";
export default {
  data() {
    return {
      shops: [],
      showAllRecent: false,
      showAllFood: false,
      showAllGrocery: false,
      showAllOther: false,
    };
  },
  mounted() {
    this.$store.commit("loading/start");
    this.getShops();
  },
  methods: {
    selectStore: function(event) {
      this.$store.commit("loading/start");
      this.$router.push(`/products/${event.id}/${event.pk}`);
    },
    getShops: async function() {
      this.shops = await this.$http.get(
        `${process.env.VUE_APP_SHOP_SERVICE_URL}/listshops`
      );
      this.$store.commit("loading/stop");
    },
    toggleShowAll(category) {
      this[category] = !this[category];
    },
  },
  computed: {
    recentShops() {
      if (this.$store.state.recent.recentShops == undefined) {
        return [];
      }

      if (!this.showAllRecent) {
        return this.$store.state.recent.recentShops.slice(0, 5);
      } else {
        return this.$store.state.recent.recentShops;
      }
    },
    foodShops() {
      if (this.shops.data === undefined) {
        return [];
      }

      const foodShops = this.shops.data.filter(
        (shop) => shop.category == "Food"
      );
      if (!this.showAllFood) {
        return foodShops.slice(0, 5);
      } else {
        return foodShops;
      }
    },
    groceryShops() {
      if (this.shops.data === undefined) {
        return [];
      }

      const groceryShops = this.shops.data.filter(
        (shop) => shop.category == "Grocery"
      );
      if (!this.showAllGrocery) {
        return groceryShops.slice(0, 5);
      } else {
        return groceryShops;
      }
    },
    otherShops() {
      if (this.shops.data === undefined) {
        return [];
      }

      const otherShops = this.shops.data.filter(
        (shop) => shop.category == "Other" || shop.category == undefined
      );
      if (!this.showAllOther) {
        return otherShops.slice(0, 5);
      } else {
        return otherShops;
      }
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
.wrapper {
  display: flex;
  justify-content: space-between;
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
