<template>
  <footer>
    <ul>
      <li
        v-show="signedIn"
        id="orders"
        class="shortcut"
        @click="shortcut('/orders')"
        ref="orders"
      >
        <font-awesome-icon class="shortcut-icon" :icon="['fas', 'list']" />
        <p>ORDERS</p>
      </li>
      <li
        v-show="signedIn"
        id="buy"
        class="shortcut"
        @click="shortcut('/buy')"
        ref="buy"
      >
        <font-awesome-icon class="shortcut-icon" :icon="['fas', 'utensils']" />
        <p>BUY</p>
      </li>
      <li
        v-show="signedIn"
        id="shops"
        class="shortcut"
        @click="shortcut('/shops')"
        ref="sell"
      >
        <font-awesome-icon
          class="shortcut-icon"
          :icon="['fas', 'money-bill-wave']"
        />
        <p>SELL</p>
      </li>
      <li
        v-show="signedIn"
        id="cart"
        class="shortcut"
        @click="shortcut('/cart')"
        ref="cart"
      >
        <font-awesome-icon
          class="shortcut-icon"
          :icon="['fas', 'shopping-cart']"
        />
        <span class="badge" v-show="this.cartSize">{{ this.cartSize }}</span>
        <p>CART</p>
      </li>

      <li v-show="!signedIn" id="login" class="cta" @click="signIn" ref="login">
        <div>Log In</div>
      </li>
      <li
        v-show="!signedIn"
        id="register"
        class="cta"
        @click="register"
        ref="register"
      >
        <div>Register</div>
      </li>
    </ul>
  </footer>
</template>

<script>
import { mapState } from "vuex";
export default {
  methods: {
    shortcut: function(route) {
      if (route === this.$router.history.current.path) {
        return;
      }
      this.$router.push(route);
    },
    signIn() {
      if (this.$route.path === "/login") {
        return;
      }
      this.$router.push("/login");
    },
    register() {
      if (this.$route.path === "/register") {
        return;
      }
      this.$router.push("/register");
    },
    productReducer(acc, cur) {
      console.debug("reducer", acc, cur);
    },
  },
  computed: {
    ...mapState("cart", {
      products: (state) => state.products,
    }),
    signedIn() {
      return this.$store.state.account.token !== null; // check the token is valid next time?
    },
    cartSize() {
      let total = 0;
      const shopKeys = Object.keys(this.products);
      if (shopKeys.length > 0) {
        shopKeys.forEach((key) => {
          let quantities = this.products[key].map(
            (product) => product.quantity
          );
          total += quantities.reduce(
            (accumulator, currentValue) => accumulator + currentValue,
            0
          );
        });
      }
      return total;
    },
  },
  watch: {
    $route(to) {
      if (to.name === "Register") {
        this.$refs["register"].classList.add("current");
      } else {
        this.$refs["register"].classList.remove("current");
      }
      if (to.name === "Login") {
        this.$refs["login"].classList.add("current");
      } else {
        this.$refs["login"].classList.remove("current");
      }
      if (to.name === "Home" || to.name === "Buy") {
        this.$refs["buy"].classList.add("current");
      } else {
        this.$refs["buy"].classList.remove("current");
      }
      if (to.name === "Shops") {
        this.$refs["sell"].classList.add("current");
      } else {
        this.$refs["sell"].classList.remove("current");
      }
      if (to.name === "Cart") {
        this.$refs["cart"].classList.add("current");
      } else {
        this.$refs["cart"].classList.remove("current");
      }
      if (to.name === "Orders") {
        this.$refs["orders"].classList.add("current");
      } else {
        this.$refs["orders"].classList.remove("current");
      }
    },
  },
};
</script>

<style lang="scss">
@import "../assets/styles/config.scss";
footer {
  background-color: $color-primary-0;
  min-height: 10vh;
  position: fixed;
  bottom: 0;
  min-width: 100vw;
  justify-content: space;
  z-index: 10;
  ul {
    display: flex;
    width: 100vw;
    justify-content: space-around;
    color: set-text-color($color-primary-0);
    .shortcut {
      &.current {
        background-color: $color-primary-3;
      }
      &:hover {
        background-color: $color-primary-3;
      }
      cursor: pointer;
      width: 22vw;
      height: 12vh;
      text-align: center;
      display: block;
      margin: 5px 0 0;
      padding: 1.5em 0;
      font-size: 12px;
      font-weight: 600;
      border: 1px solid $color-primary-3;
      position: relative;
      .shortcut-icon {
        font-size: 24px;
        margin-bottom: 5px;
        padding: auto auto 1.5em;
      }
      .badge {
        font-size: 2em;
        display: block;
        position: absolute;
        top: 0.12em;
        left: 0.25em;
        width: 1em;
        height: 1em;
        line-height: 1em;
        border-radius: 50%;
        text-align: center;
        background: $color-primary-2;
      }
    }
    .cta {
      text-align: center;

      padding: 1em 3em;
      border: 1px solid $color-primary-3;
      font-weight: 600;
      font-size: 18px;
    }
  }

  #signIn {
    color: set-text-color($color-primary-0);
    cursor: pointer;
    display: flex;
  }
}
</style>
