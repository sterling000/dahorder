<template>
  <div class="register">
    <h1>Sign Up</h1>
    <form @submit="register" method="POST">
      <label for="name">Name:</label>
      <input
        v-model.trim="name"
        placeholder="John Doe"
        name="name"
        @blur="$v.name.$touch"
      />
      <ul>
        <li class="error" v-for="error in nameErrors" :key="error">
          <p class="error">{{ error }}</p>
        </li>
      </ul>
      <label for="condo">Condominium:</label>
      <select v-model="condo" name="condo" @blur="$v.condo.$touch">
        <option selected>Armanee Terrace</option>
      </select>
      <ul>
        <li class="error" v-for="error in condoErrors" :key="error">
          <p class="error">{{ error }}</p>
        </li>
      </ul>
      <label for="apartment">Apartment:</label>
      <input v-model="apartment" name="apartment" @blur="$v.apartment.$touch" />
      <ul>
        <li class="error" v-for="error in apartmentErrors" :key="error">
          <p class="error">{{ error }}</p>
        </li>
      </ul>
      <label for="phone">Phone:</label>
      <p class="countrycode">+6</p>
      <input
        class="phone"
        v-model.trim="phone"
        placeholder="0123456789"
        name="phone"
        @blur="logEvent"
        @change="logEvent"
      />
      <ul>
        <li class="error" v-for="error in phoneErrors" :key="error">
          <p class="error">{{ error }}</p>
        </li>
      </ul>
      <label for="email">Email:</label>
      <input
        v-model.trim="email"
        placeholder="john.doe@email.com"
        name="email"
        @blur="$v.email.$touch"
      />
      <ul>
        <li class="error" v-for="error in emailErrors" :key="error">
          <p class="error">{{ error }}</p>
        </li>
      </ul>
      <label for="password"
        >Password
        <span class="hint">(Must be 8 or more characters)</span>:</label
      >
      <input
        v-model.trim="password"
        name="password"
        type="password"
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
        placeholder=""
        name="confirm"
        type="password"
        @blur="$v.confirm.$touch"
      />
      <ul>
        <li class="error" v-for="error in confirmErrors" :key="error">
          <p class="error">{{ error }}</p>
        </li>
      </ul>
      <label for="role">Select a Role:</label>
      <select
        id="role"
        name="role"
        v-model="role"
        @change="$v.role.$touch"
        @blur="$v.role.$touch"
      >
        <option value="buyer" selected>Buyer</option>
        <option value="seller">Seller</option>
        <option value="both">Both</option>
      </select>

      <input
        id="submit"
        type="submit"
        value="Sign Up"
        :disabled="$v.$invalid"
      />
    </form>
  </div>
</template>

<script>
import axios from "axios";
axios.defaults.headers.post["Content-Type"] = "application/json";
import { required, minLength, email, sameAs } from "vuelidate/lib/validators";

import { validPhone, validApartment } from "../validators/validators";

export default {
  data() {
    return {
      name: "",
      condo: "",
      apartment: "",
      phone: "",
      email: "",
      password: "",
      confirm: "",
      role: "both",
      error: "",
    };
  },
  methods: {
    logEvent: function(e) {
      console.log(e);
    },
    register: function(e) {
      e.preventDefault();
      this.$v.$touch();
      if (this.$v.$anyError) {
        return;
      }
      const params = {
        email: this.email,
        password: this.password,
        name: this.name,
        condo: this.condo,
        apartment: this.apartment,
        phone: "+6" + this.phone,
        role: this.role,
      };

      axios
        .post(`${process.env.VUE_APP_USER_SERVICE_URL}/v1/user`, params)
        .then((res) => {
          if (res.status === 202) {
            console.log("Another user exists with that phone.");
            this.error = "Another user exists with that phone.";
          } else {
            this.error = "";
            console.log("Success! User Created!", res);
            this.$store.commit("account/login", res.data.token);
            this.$router.push("/");
          }
        })
        .catch((error) => {
          console.log("Oh No! An Error!", error);
        })
        .finally(() => {
          // console.log('Do this always... or else...');
        });
    },
  },
  validations: {
    name: { required, between: (3, 20) },
    email: { required, email },
    password: { required, minLength: minLength(8) },
    confirm: { sameAsPassword: sameAs("password") },
    condo: { required },
    apartment: { required, validApartment },
    phone: { required, validPhone },
    role: { required },
  },
  computed: {
    nameErrors() {
      const errors = [];
      if (!this.$v.name.$dirty) return errors;
      !this.$v.name.required && errors.push("Name is required.");
      !this.$v.name.between &&
        errors.push("Name must be between 3 and 20 characters long.");
      return errors;
    },
    emailErrors() {
      const errors = [];
      if (!this.$v.email.$dirty) return errors;
      !this.$v.email.required && errors.push("Email is required.");
      !this.$v.email.email && errors.push("Email is not valid.");
      return errors;
    },
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
    condoErrors() {
      const errors = [];
      if (!this.$v.condo.$dirty) return errors;
      !this.$v.condo.required && errors.push("Condo is required.");
      return errors;
    },
    phoneErrors() {
      const errors = [];
      if (!this.$v.phone.$dirty) return errors;
      !this.$v.phone.required && errors.push("Phone Number is required.");
      !this.$v.phone.validPhone && errors.push("Phone number is invalid.");

      return errors;
    },
    roleErrors() {
      const errors = [];
      if (!this.$v.role.$dirty) return errors;
      !this.$v.role.required && errors.push("Role is required.");
      return errors;
    },
    apartmentErrors() {
      const errors = [];
      if (!this.$v.apartment.$dirty) return errors;
      !this.$v.apartment.required && errors.push("Apartment is required.");
      !this.$v.apartment.towerFloorUnit &&
        errors.push("Apartment is in the wrong format.");
      return errors;
    },
  },
  mounted() {
    this.$store.commit("loading/stop");
  },
};
</script>

<style lang="scss" scoped>
@import "../assets/styles/config.scss";
.register {
  overflow: auto;
  form {
    li {
      .error {
        margin: 0;
      }
    }
    padding: 2em 2.5em 5em;
    label {
      width: 275px;
      margin: 0 0 0.5em;
      font-weight: 600;
    }
    input,
    select {
      display: block;
      width: 275px;
      height: 2em;
      margin: 0 0 0.5em;
      box-shadow: 0 4px 8px 0 rgba(0, 0, 0, 0.2),
        0 6px 20px 0 rgba(0, 0, 0, 0.19);
      border-radius: 5%;
      border: none;
      &#submit {
        font-size: 36px;
        font-weight: 600;
      }
    }
    .error {
      color: #f00;
      margin: 0;
      font-weight: 600;
    }
    .hint {
      font-style: italic;
      font-size: 12px;
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
  .forgot-password {
    display: block;
    justify-content: space-around;
  }
  h1 {
    text-align: center;
    font-weight: bold;
    text-transform: uppercase;
    margin: 0 0 0.5em;
  }
  .error {
    color: #f00;
  }
}
</style>
