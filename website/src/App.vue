<template>
  <div id="app">
    <app-header />
    <div
      class="overlay"
      @click.prevent=""
      v-show="this.$store.state.loading.loading"
    >
      <pulse-loader class="loader" :color="loaderColor" />
    </div>
    <router-view v-show="!this.$store.state.loading.loading" />
    <ul class="notices" v-show="this.notifications.length > 0">
      <li v-for="notice in this.notifications" :key="notice.id">
        <notification :notice="notice" @destroy="destroyNotification" />
      </li>
    </ul>
    <app-footer />
  </div>
</template>

<script>
import Vue from "vue";
import { mapState } from "vuex";
import Header from "./components/Header.vue";
import Footer from "./components/Footer.vue";

export default {
  name: "App",
  components: {
    "app-header": Header,
    "app-footer": Footer,
  },
  mounted() {
    console.log = (...args) => {
      if (this.notifications !== null) {
        let message = "";
        for (let i = 0; i < args.length; i++) {
          message += ` ${args[i]}`;
        }
        this.notifications.push({
          id: Math.random(),
          info: message,
          error: "",
          timeout: 6 * 1000, // 4 seconds
        });
      }
    };
    // console.error = (...args) => {
    //   if (this.notifications !== null) {
    //     let message = "";
    //     for (let i = 0; i < args.length; i++) {
    //       message += ` ${args[i]}`;
    //     }
    //     this.notifications.push({
    //       id: Math.random(),
    //       info: "",
    //       error: message,
    //       timeout: 6 * 1000, // 4 seconds
    //     });
    //   }
    // };
    Vue.config.errorHandler = (...args) => {
      if (this.notifications !== null) {
        let message = "";
        for (let i = 0; i < args.length; i++) {
          message += ` ${args[i]}`;
        }

        this.notifications.push({
          id: Math.random(),
          info: "",
          error: message,
          timeout: 6 * 1000,
        });
      }
    };
    //this.getUserData();
  },
  data() {
    return {
      loaderColor: "#e9750b",
      notifications: [],
      destroyEvents: [],
    };
  },
  computed: mapState("account", ["token"]),
  methods: {
    destroyNotification(e) {
      const filtered = this.notifications.filter((notice) => {
        return notice.id !== e;
      });
      this.notifications = filtered;
    },
    getUserData: async function() {
      this.$store.commit("loading/start");

      const options = {
        headers: { Authorization: `Bearer ${this.$store.state.account.token}` },
      };
      const res = await this.$http.get(
        `${process.env.VUE_APP_USER_SERVICE_URL}/user`,
        options
      );
      this.$store.commit("account/user", res.data);
      this.$store.commit("loading/stop");
    },
  },
  watch: {
    "account.token"() {
      this.getUserData();
    },
  },
};
</script>

<style lang="scss">
@import "./assets/styles/config.scss";
@import "./assets/styles/loader.scss";
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  color: #000;
  font-family: "Montserrat", sans-serif;
  font-size: 16px;
  min-height: 100vh;
  max-height: 100vh;
  background-color: $color-primary-1;
  // overflow: hidden;
}

a {
  color: #000;
  &:visited {
    color: #000;
  }
  text-decoration: none;
}

ul {
  list-style: none;
}

.notices {
  z-index: 999;
  position: fixed;
  bottom: 1em;
  margin: 1em 1em 12vh;
}

router-view {
  overflow: scroll;
}
</style>
