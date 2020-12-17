<template>
  <div class="reset">
    <h2>Reset Password</h2>
    <form>
      <label for="password"
        >Password
        <span class="hint">(Must be 8 or more characters)</span>:</label
      >
      <input
        v-model.trim="password"
        name="password"
        type="password"
        autocomplete="new-password"
        @blur="$v.password.$touch"
      />
      <ul>
        <li class="error" v-for="error in passwordErrors" :key="error">
          <p class="error">{{ error }}</p>
        </li>
      </ul>
      <label for="confirm">Confirm Password:</label>
      <input
        v-model.trim="confirm"
        name="confirm"
        type="password"
        autocomplete="new-password"
        @blur="$v.confirm.$touch"
      />
      <ul>
        <li class="error" v-for="error in confirmErrors" :key="error">
          <p class="error">{{ error }}</p>
        </li>
      </ul>

      <button
        id="submit"
        type="submit"
        title="ADD"
        @click.prevent="submit"
        :disabled="$v.$invalid"
      >
        ADD
      </button>
    </form>
  </div>
</template>

<script>
import { required, minLength, sameAs } from "vuelidate/lib/validators";
export default {
  data() {
    return {
      password: "",
      confirm: "",
    };
  },
  computed: {
    passwordErrors() {
      const errors = [];
      if (!this.$v.password.$dirty) return errors;
      !this.$v.password.required && errors.push("Password is required.");
      !this.$v.password.minLength &&
        errors.push("Password must be at least 8 characters long.");
      return errors;
    },
    confirmErrors() {
      const errors = [];
      if (!this.$v.confirm.$dirty) return errors;
      !this.$v.confirm.sameAsPassword &&
        errors.push("Password does not match.");
      return errors;
    },
  },
  validations: {
    password: { required, minLength: minLength(8) },
    confirm: { sameAsPassword: sameAs("password") },
  },
  methods: {
    async submit() {
      const res = await this.$http.put(
        `${process.env.VUE_APP_USER_SERVICE_URL}/user/password`,
        {
          newPassword: this.password,
          token: this.$route.params.token,
        }
      );
      if (res.status == 200) {
        console.log("Success, please log in with your new password");
        this.$router.push("/login");
      }
    },
  },
};
</script>

<style lang="scss">
@import "../assets/styles/config.scss";
.reset {
  padding: 4em 0 0;
  margin: 0 1em;
  max-width: 1200px;
  form {
    padding: 2em 2.5em 5em;
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
      color: $color-primary-3;
      width: 100%;
      height: 2em;
      box-shadow: 0 4px 8px 0 rgba(0, 0, 0, 0.2),
        0 6px 20px 0 rgba(0, 0, 0, 0.19);
      border-radius: 5%;
      border: solid 1px $color-primary-0;
      font-size: 40px;
      font-weight: 600;
      margin-bottom: 1em;
      padding: 0.5em;
      &:disabled {
        background-color: rgb(143, 143, 143);
        color: #000;
      }
    }
  }
}
</style>
