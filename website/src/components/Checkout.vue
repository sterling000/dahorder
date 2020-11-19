<template>
  <div class="checkout">
    <h2>Check Out</h2>
    <h3 class="total">{{ total }} RM</h3>

    <form action="submit" method="POST">
      <image-uploader
        validation="$v.payment"
        @render="paymentRendered"
        ref="imageUploader"
      />
      <p v-if="$v.payment.$dirty && $v.payment.$invalid">
        {{ paymentErrors }}
      </p>
      <input type="submit" value="Confirm Payment" />
    </form>
  </div>
</template>

<script>
import { required } from "vuelidate/lib/validators";

export default {
  data() {
    return {
      payment: "",
    };
  },
  methods: {
    submit() {
      console.log("Submitted: ", this.$store.state.cart.products);
    },
    paymentRendered(e) {
      this.payment = e;
    },
  },
  computed: {
    total() {
      let prices = this.$store.state.cart.products.map(
        (product) => product.price * product.quantity
      );
      return prices.reduce(
        (accumulator, currentValue) => accumulator + currentValue,
        0
      );
    },
    paymentErrors() {
      const errors = [];
      if (!this.$v.payment.$dirty) return errors;
      !this.$v.payment.required &&
        errors.push("Payment Screenshot is required.");
      return errors;
    },
  },
  validations: {
    payment: { required },
  },
};
</script>

<style lang="scss"></style>
