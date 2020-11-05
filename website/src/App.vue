<template>
  <div id="app">
    <app-header/>
    <router-view/>
    <app-footer/>
  </div>
</template>

<script>
import Header from './components/Header.vue';
import Footer from './components/Footer.vue';
export default {
  name: 'App',
  components: {
    'app-header': Header,
    'app-footer': Footer
  }
}
</script>

<style lang="scss">
@import "./assets/styles/config.scss";
*{
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body{
  color: #fff;
  font-family: 'Montserrat', sans-serif;
  font-size: 16px;
  min-height: 100vh;
  max-height: 100vh;
  background-color: $color-primary-1;
  // overflow: hidden;
}

a {
  color:#000;
  &:visited{
    color: #000;
  }
  text-decoration: none;
}

ul {
  list-style: none;
}

router-view{
  overflow: scroll;
}

</style>
