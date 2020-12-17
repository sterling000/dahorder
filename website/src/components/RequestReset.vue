<template>
  <div class="request-reset">
    <h2>Reset Password</h2>
    <p v-if="!sent">
      Enter your phone number. We will Whatsapp you a link to reset your
      password.
    </p>
    <form v-if="!sent">
      <div class="wrapper">
        <div>
          <label for="phone">Phone:</label>
          <p class="countrycode">+6</p>
        </div>
        <input
          class="phone"
          v-model.trim="phone"
          name="phone"
          autocomplete="username"
          @blur="$v.phone.$touch"
          @change="$v.phone.$touch"
        />
      </div>
      <ul>
        <li class="error" v-for="error in phoneErrors" :key="error">
          <p class="error">{{ error }}</p>
        </li>
      </ul>
      <button type="submit" @click.prevent="sendResetLink">
        Request Reset
      </button>
    </form>
    <p v-if="sent">Check your Whatsapp for instructions!</p>
  </div>
</template>

<script>
import { required } from "vuelidate/lib/validators";
import { validPhone } from "../validators/validators";
export default {
  data() {
    return {
      phone: "",
      sent: false,
    };
  },
  validations: {
    phone: { required, validPhone },
  },
  computed: {
    phoneErrors() {
      const errors = [];
      if (!this.$v.phone.$dirty) return errors;
      !this.$v.phone.required && errors.push("Phone Number is required.");
      !this.$v.phone.validPhone && errors.push("Phone number is invalid.");

      return errors;
    },
  },
  methods: {
    async sendResetLink() {
      if (this.$v.phone.invalid) {
        console.error("Phone is invalid.");
        return;
      }
      let client = `${window.location.hostname}`;
      if (client == "localhost") {
        client += ":8080";
      }
      await this.$http.get(
        `${process.env.VUE_APP_USER_SERVICE_URL}/user/reset`,
        {
          params: {
            phone: this.phone,
            client: client,
          },
        }
      );
    },
  },
};
</script>

<style lang="scss">
.request-reset {
  margin: auto;
  max-width: 1200px;
  padding: 4em 0 0;
}
</style>
