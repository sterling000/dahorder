<template>
  <div class="request-reset">
    <h2>Reset Password</h2>
    <p class="instructions" v-if="!sent">
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
      <button
        id="submit"
        type="submit"
        @click.prevent="sendResetLink"
        :disabled="$v.phone.invalid"
      >
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
@import "../assets/styles/config.scss";
.request-reset {
  // margin: auto;
  max-width: 1200px;
  padding: 5em 2.5em 0;
  .instructions {
    margin: 0.5em 0;
  }
  form {
    .wrapper {
      display: flex;
      justify-content: space-between;
    }
    label {
      width: 275px;
      margin: 0 0 0.5em;
      font-weight: 600;
    }
    input,
    select {
      display: block;
      width: 100%;
      height: 2em;
      margin: 0 0 1em;
      box-shadow: 0 4px 8px 0 rgba(0, 0, 0, 0.2),
        0 6px 20px 0 rgba(0, 0, 0, 0.19);
      border-radius: 5%;
      border: none;
    }
    button#submit {
      display: block;
      background-color: $color-primary-0;
      color: #fff;
      width: 100%;
      height: 2em;
      box-shadow: 0 4px 8px 0 rgba(0, 0, 0, 0.2),
        0 6px 20px 0 rgba(0, 0, 0, 0.19);
      border-radius: 5%;
      border: solid 1px $color-primary-0;
      font-size: 40px;
      font-weight: 600;
      margin-bottom: 1em;
      // padding: 0.5em;
      &:disabled {
        background-color: rgb(143, 143, 143);
        color: #fff;
      }
    }
    .countrycode {
      display: inline-block;
      width: 40px;
      color: #aaa;
      padding: 1.5em 0.5em;
    }
    input.phone {
      display: inline-block;
      width: 65%;
      margin: 1.5em 0;
    }
  }
}
</style>
