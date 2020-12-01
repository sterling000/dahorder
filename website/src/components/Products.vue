<template>
  <div class="products">
    <div class="category">
      <div class="title">
        <h2>Products</h2>
        <font-awesome-icon
          class="share-icon"
          :icon="['fas', 'share']"
          @click.prevent="share"
        />
      </div>

      <div class="noProducts" v-show="products.length < 1">
        <h3>
          The Owner of this shop has not added any products yet.
          <br /><br />Check back later.
        </h3>
      </div>
      <ul>
        <li v-for="product in products" :key="product.id">
          <product v-bind:product="product" @selected="selectProduct"></product>
        </li>
        <li>
          <div
            v-show="
              this.$store.state.account.token !== null &&
                this.$store.state.account.user.role !== 'buyer' &&
                this.isOwner
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
export default {
  data() {
    return {
      products: [],
    };
  },
  methods: {
    share: async function() {
      await navigator.clipboard.writeText(window.location);
      console.log("Link copied to clipboard.");
    },
    newProduct: function() {
      this.$router.push(
        `/newproduct/${this.$route.params.id}/${this.$route.params.owner}`
      );
    },
    getProducts: async function() {
      const options = {
        params: {
          shop: this.$route.params.id,
        },
      };
      const res = await this.$http.get(
        `${process.env.VUE_APP_PRODUCT_SERVICE_URL}/products`,
        options
      );
      this.$store.commit("loading/stop");

      this.products = res.data.filter((product) => {
        const date = new Date(product.date);
        const now = new Date();
        return (
          date > now || product.owner === this.$store.state.account.user.pk
        );
      });
    },
    selectProduct: function(event) {
      this.$router.push(`/product/${event.id}`);
    },
  },
  mounted() {
    this.$store.commit("loading/start");
    this.getProducts();
  },
  computed: {
    isOwner() {
      return this.$route.params.owner === this.$store.state.account.user.pk;
    },
  },
};
</script>

<style lang="scss">
@import "../assets/styles/config.scss";
.products {
  .title {
    display: flex;
  }
  .share-icon {
    font-size: 24px;
    margin: 0 1em;
    cursor: pointer;
  }
  overflow-y: auto;
  padding: 10vh 5vh 15vh;
  .noProducts {
    margin: 2em 0;
    color: $color-primary-2;
  }
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
