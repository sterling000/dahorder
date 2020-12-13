<template>
  <div class="checkout">
    <h2>Check Out</h2>
    <h3 class="number">
      Order #:
      <span class="orderNum" @click.prevent="backToOrder">{{ orderId }}</span>
    </h3>
    <h3 class="total">
      Total: <span class="totalNum">{{ total }} RM</span>
    </h3>
    <label class="paymentMethod" for="duitNow">Pay By DuitNow</label>
    <input
      type="radio"
      id="duitNow"
      value="DuitNow"
      v-model="paymentMethod"
      @change="paymentChanged"
    />
    <label class="paymentMethod" for="duitNow">Pay By Cash</label>
    <input
      type="radio"
      id="cash"
      value="Cash"
      v-model="paymentMethod"
      @change="paymentChanged"
    />

    <h3 class="owner" v-if="paymentMethod == 'DuitNow'">
      Send To: <span class="ownerNum">{{ owner }}</span>
    </h3>
    <form>
      <label v-if="paymentMethod == 'DuitNow'"
        >Upload a screenshot of your DuitNow payment.</label
      >
      <image-uploader
        :validation="$v.payment"
        @render="paymentRendered"
        ref="imageUploader"
        v-if="paymentMethod == 'DuitNow'"
      />
      <p
        v-if="
          $v.payment.$dirty && $v.payment.$invalid && paymentMethod == 'DuitNow'
        "
      >
        {{ paymentErrors }}
      </p>
      <button
        id="submit"
        type="submit"
        title="ADD"
        @click.prevent="submit"
        :disabled="$v.$invalid"
      >
        Confirm Order
      </button>
    </form>
  </div>
</template>

<script>
import { mapState } from "vuex";
import { required } from "vuelidate/lib/validators";
export default {
  data() {
    return {
      payment: "",
      paymentMethod: "DuitNow",
      shop: {},
    };
  },
  mounted() {
    this.$store.commit("loading/start");
    setTimeout(() => {}, 2000);
    console.debug("mounted", JSON.stringify(this.orders, null, 4));
    this.getOrderDetails();

    this.$store.commit("loading/stop");
  },
  methods: {
    submit: async function() {
      console.log("Confirming: ", this.$route.params.orderId);
      let params = {
        shop: this.shop.id,
        date: this.orders[this.orderId].date,
      };
      if (this.paymentMethod == "DuitNow") {
        const imageUrl = await this.$http.get(
          `${process.env.VUE_APP_IMAGE_SERVICE_URL}/image/url`
        );
        this.$refs.imageUploader.uploadImage(imageUrl.data.uploadURL);
        params[
          "payment"
        ] = `${process.env.VUE_APP_IMAGE_S3_BUCKET}/${imageUrl.data.photoFilename}`;
      } else {
        params["payment"] = "cash";
      }

      const options = {
        headers: { Authorization: `Bearer ${this.$store.state.account.token}` },
      };
      await this.$http.post(
        `${process.env.VUE_APP_ORDER_SERVICE_URL}/payment`,
        params,
        options
      );
      console.log("Upload of payment successful.");
      this.$store.commit("loading/stop");
      this.$router.push("/orders");
    },
    paymentRendered(e) {
      this.payment = e;
    },
    backToOrder() {
      this.$router.push(`/orders/${this.orderId}`);
    },
    getOrderDetails: async function() {
      console.debug(this.orderId);
      if (this.orders[this.orderId] === undefined) {
        throw "order does not exist yet.";
      }
      console.debug("getOrderDetails", this.orders);
      const order = this.orders[this.orderId];
      console.debug("order:", order);
      const shopResponse = await this.$http.get(
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
    paymentChanged(e) {
      if (e.target.id == "cash") {
        this.payment = "cash";
      } else {
        this.payment = "";
      }
    },
  },
  computed: {
    ...mapState("cart", {
      orders: (state) => state.orders,
    }),
    total() {
      console.debug("total", this.orders);
      if (this.orders == undefined || this.orders.length == 0) {
        return 0;
      }
      return this.orders[this.orderId].total;
    },
    owner() {
      if (this.shop == undefined) {
        return "";
      }
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
  .paymentMethod {
    margin: 0.5em 1em;
  }
  input {
    margin: 1em 0;
  }
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
