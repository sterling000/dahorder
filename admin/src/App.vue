<template>
  <div id="app">
    <div
      class="overlay"
      @click.prevent=""
      v-show="this.$store.state.loading.loading"
    >
      <pulse-loader class="loader" :color="loaderColor" />
    </div>
    <router-view />
  </div>
</template>

<script>
export default {
  name: "App",
  data() {
    return {
      loaderColor: "#e9750b",
    };
  },
};
</script>

<style lang="scss">
@import "./assets/styles/loader.scss";
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
  margin: 0 auto;
  max-width: 550px;

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
}
</style>
