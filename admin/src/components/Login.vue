<template>
  <div class="login">
    <h2>Dah Order Admin</h2>
    <form @submit="login" method="POST">
      <ul>
        <li>
          <label for="username">Username:</label>
          <input
            type="text"
            name="username"
            v-model="username"
            autocomplete="username"
          />
        </li>
        <li>
          <label for="password">Password:</label>
          <input
            type="password"
            name="password"
            v-model="password"
            autocomplete="current-password"
          />
        </li>
        <li>
          <button type="submit" title="Login" @click.prevent="login">
            Login
          </button>
        </li>
      </ul>
    </form>
  </div>
</template>

<script>
import axios from "axios";
export default {
  methods: {
    async login() {
      try {
        const res = await axios.post(
          `${process.env.VUE_APP_ADMIN_SERVICE}/login`,
          {
            username: this.username,
            password: this.password,
          }
        );
        if (res.status === 200) {
          this.$store.commit("account/login", res.data.token);
          this.$router.push("/");
        }
      } catch (error) {
        console.error(error);
      }
    },
  },
  data() {
    return {
      username: "",
      password: "",
    };
  },
  mounted() {
    this.$store.commit("loading/stop");
  },
};
</script>

<style lang="scss">
.login {
  li {
    margin: 1em;
  }
  button {
    margin: 1em;
  }
}
</style>
