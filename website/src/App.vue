<template>
  <div id="app">
    <!-- <app-header/> -->
    <router-view/>
  </div>
</template>

<script>
// import Header from './components/Header.vue';
export default {
  name: 'App',
  components: {
    // 'app-header': Header
  }
}
</script>

<style lang="scss">
*{
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body{
  color: #000;
  font-family: 'Montserrat', sans-serif;
  font-size: 16px;
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

</style>
