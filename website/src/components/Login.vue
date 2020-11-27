<template>
  <div class="login">
    <form @submit="signin" method="POST">
      <ul>
        <label for="phone">Phone:</label>
        <p class="countrycode">+6</p>
        <input
          class="phone"
          v-model.trim="phone"
          placeholder=""
          name="phone"
          autocomplete="username"
          @blur="$v.phone.$touch"
        />
        <ul>
          <li class="error" v-for="error in phoneErrors" :key="error">
            <p class="error">{{ error }}</p>
          </li>
        </ul>
        <li>
          <label for="password">Password:</label>
          <input
            v-model="password"
            type="password"
            name="password"
            autocomplete="current-password"
            @blur="$v.password.$touch"
          />
          <p v-if="$v.password.$invalid && $v.password.$dirty">
            {{ passwordErrors }}
          </p>
        </li>
      </ul>

      <button
        id="submit"
        type="submit"
        title="ADD"
        @click.prevent="signin"
        :disabled="$v.$invalid"
      >
        Sign In
      </button>
      <button @click.stop.prevent="register()">Register</button>
      <a href="#" class="forgot-password">Forgot Password?</a>
    </form>
    <p v-if="this.errors.length > 0" class="error">{{ errors }}</p>
  </div>
</template>

<script>
import axios from "axios";
import { required } from "vuelidate/lib/validators";
import { validPhone } from "../validators/validators";
import { mapState } from "vuex";
export default {
  data() {
    return {
      phone: "",
      password: "",
      errors: "",
      from: {},
    };
  },
  methods: {
    signin: function() {
      this.signingAsync();
    },
    signingAsync: async function() {
      this.$v.$touch();
      if (this.$v.$anyError) {
        return;
      }
      this.$store.commit("loading/start");
      const params = {
        phone: `+6${this.phone}`,
        password: this.password,
      };

      const res = await axios.post(
        `${process.env.VUE_APP_USER_SERVICE_URL}/user/login`,
        params
      );
      if (res.status === 404) {
        throw "That phone/password combination does not match our records.";
      } else {
        console.log("Success!");
        this.$store.commit("account/login", res.data.token);
        const options = {
          headers: {
            Authorization: `Bearer ${this.$store.state.account.token}`,
          },
        };
        const res2 = await axios.get(
          `${process.env.VUE_APP_USER_SERVICE_URL}/user`,
          options
        );
        this.$store.commit("account/user", res2.data);
        this.$store.commit("loading/stop");
        if (this.from.name !== null) {
          this.$router.back();
        } else {
          this.$router.push("/");
        }
      }
    },
    register: function() {
      this.$router.push("/register");
    },
  },
  validations: {
    phone: { required, validPhone },
    password: { required },
  },
  computed: {
    phoneErrors() {
      const errors = [];
      if (!this.$v.phone.$dirty) return errors;
      !this.$v.phone.required && errors.push("Phone is required.");
      !this.$v.phone.validPhone && errors.push("Phone is not valid.");
      return errors;
    },
    passwordErrors() {
      const errors = [];
      if (!this.$v.password.$dirty) return errors;
      !this.$v.password.required && errors.push("Password is required.");
      return errors;
    },
    ...mapState("account", ["token"]),
  },
  mounted() {
    this.$store.commit("loading/stop");
    if (this.$store.state.account.token !== null) {
      this.$router.push("/");
    }
  },
  beforeRouteEnter: (to, from, next) => {
    next((vm) => {
      vm.from = from;
    });
  },
};
</script>

<style lang="scss" scoped>
@import "../assets/styles/config.scss";
.login {
  form {
    li {
      margin: 1em 0;
    }
    padding: 5em 3em;
    label {
      width: 275px;
      margin: 0 0 0.5em;
      font-weight: 600;
      display: block;
    }
    input {
      width: 275px;
      height: 3em;
      box-shadow: 0 4px 8px 0 rgba(0, 0, 0, 0.2),
        0 6px 20px 0 rgba(0, 0, 0, 0.19);
      border-radius: 5%;
      border: none;
      &#submit {
        font-size: 36px;
        font-weight: 600;
        border: none;
      }
    }
    button {
      width: 275px;
      height: 3em;
      box-shadow: 0 4px 8px 0 rgba(0, 0, 0, 0.2),
        0 6px 20px 0 rgba(0, 0, 0, 0.19);
      border-radius: 5%;
      border: none;
      margin: 1em 0;
    }
    .error {
      color: #f00;
    }
  }
  .forgot-password {
    display: block;
    justify-content: space-around;
  }

  .countrycode {
    display: inline-block;
    width: 40px;
    color: #aaa;
    padding: 0 0.5em;
  }
  input.phone {
    display: inline-block;
    width: 175px;
  }
}
</style>
