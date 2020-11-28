<template>
  <div class="checkout">
    <h2>Check Out</h2>
    <h3 class="number">
      Order #: <span class="orderNum">{{ orderId }}</span>
    </h3>
    <h3 class="total">
      Total: <span class="totalNum">{{ total }} RM</span>
    </h3>
    <h3 class="owner">
      Send To: <span class="ownerNum">{{ owner }}</span>
    </h3>
    <form>
      <label>Upload a screenshot of your DuitNow payment.</label>
      <image-uploader
        validation="$v.payment"
        @render="paymentRendered"
        ref="imageUploader"
      />
      <p v-if="$v.payment.$dirty && $v.payment.$invalid">
        {{ paymentErrors }}
      </p>
      <button
        id="submit"
        type="submit"
        title="ADD"
        @click.prevent="submit"
        :disabled="$v.$invalid"
      >
        Confirm Payment
      </button>
    </form>
  </div>
</template>

<script>
import { mapState } from "vuex";
import { required } from "vuelidate/lib/validators";
import axios from "axios";
export default {
  data() {
    return {
      payment: "",
      shop: {},
    };
  },
  mounted() {
    this.getOrderDetails();
  },
  methods: {
    submit: async function() {
      console.log("Confirming: ", this.$route.params.orderId);
      const imageUrl = await axios.get(
        `${process.env.VUE_APP_IMAGE_SERVICE_URL}/image/url`
      );
      this.$refs.imageUploader.uploadImage(imageUrl.data.uploadURL);

      const params = {
        shop: this.shop.id,
        date: this.orders[this.orderId].date,
        payment: `${process.env.VUE_APP_IMAGE_S3_BUCKET}/${imageUrl.data.photoFilename}`,
      };
      const options = {
        headers: { Authorization: `Bearer ${this.$store.state.account.token}` },
      };
      await axios.post(
        `${process.env.VUE_APP_ORDER_SERVICE_URL}/payment`,
        params,
        options
      );
      console.log("Payment Details Submitted.");
    },
    paymentRendered(e) {
      this.payment = e;
    },
    getOrderDetails: async function() {
      console.debug(this.orderId);
      if (this.orders[this.orderId] === undefined) {
        console.debug("order does not exist yet.");
      }
      console.debug("getOrderDetails", this.orders);
      const order = this.orders[this.orderId];
      console.debug("order:", order);
      const shopResponse = await axios.get(
        `${process.env.VUE_APP_SHOP_SERVICE_URL}/shop`,
        {
          params: {
            owner: this.orders[this.orderId].owner,
            id: this.orders[this.orderId].shopId,
          },
        }
      );
      console.debug(shopResponse.data);
      this.shop = shopResponse.data[0];
    },
  },
  computed: {
    ...mapState("cart", {
      orders: (state) => state.orders,
    }),
    total() {
      if (
        this.order !== undefined &&
        this.order.products !== undefined &&
        this.order.products.length > 0
      ) {
        return this.order.products.reduce(
          (acc, curr) => acc + curr.price * curr.quantity,
          0
        );
      } else {
        return 0;
      }
    },
    owner() {
      return `${this.shop.name} @${this.shop.pk}`;
    },
    orderId() {
      return this.$route.params.orderId;
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

<style lang="scss">
@import "../assets/styles/config.scss";

.checkout {
  padding: 4em 1em;
  .totalNum {
    margin: 0 2em;
    color: #55ff55;
  }
  button#submit {
    display: block;
    background-color: $color-primary-0;
    color: $color-primary-3;
    width: 100%;
    height: 4em;
    box-shadow: 0 4px 8px 0 rgba(0, 0, 0, 0.2), 0 6px 20px 0 rgba(0, 0, 0, 0.19);
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
</style>
