<template>
  <div id="app">
    <app-header/>
    <router-view/>
    <app-footer/>
  </div>
</template>

<script>
import axios from 'axios';
import Header from './components/Header.vue';
import Footer from './components/Footer.vue';
export default {
  name: 'App',
  components: {
    'app-header': Header,
    'app-footer': Footer
  },
  mounted(){
    if(this.$store.state.account.token !== null){
      const options = {
          headers: {'Authorization': `Bearer ${this.$store.state.account.token}`}
      };
      axios.get('https://nqq2u2wci7.execute-api.us-east-1.amazonaws.com/dev/user', options).then((res) =>{
          this.$store.commit('account/user', res.data);
          if(this.$route.name !== 'Home'){
            this.$router.push('/');
          }
      })
      .catch((error) =>{
          console.log('Oh No! An Error!', error);
      })
    }
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
  color: #000;
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
