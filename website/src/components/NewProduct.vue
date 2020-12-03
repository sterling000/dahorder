<template>
  <div class="add-product">
    <h1>New Product</h1>
    <form @submit="submit" method="POST">
      <ul>
        <li>
          <div class="wrapper">
            <label for="name">Name</label>
            <input
              class="name"
              v-model="name"
              name="name"
              @blur="$v.name.$touch()"
            />
          </div>

          <p v-if="$v.name.$dirty && $v.name.$invalid">{{ nameErrors }}</p>
        </li>
        <li class="price">
          <div class="wrapper">
            <label for="price">Price (RM)</label>
            <input
              v-model="price"
              name="price"
              class="price"
              @blur="$v.price.$touch()"
            />
          </div>
          <p class="error" v-if="$v.price.$dirty && $v.price.$invalid">
            {{ priceErrors }}
          </p>
        </li>
        <li class="quantity">
          <div class="wrapper">
            <label for="quantity">Quantity</label>
            <input
              v-model="quantity"
              name="quantity"
              class="quantity"
              @blur="$v.quantity.$touch()"
            />
          </div>
          <p v-if="$v.quantity.$dirty && $v.quantity.$invalid">
            {{ quantityErrors }}
          </p>
        </li>

        <li>
          <label for="description">Description</label>
          <textarea
            id="description"
            v-model="description"
            name="description"
            @blur="$v.description.$touch()"
            placeholder="Enter a description here..."
          />
          <p v-if="$v.description.$dirty && $v.description.$invalid">
            {{ descriptionErrors }}
          </p>
        </li>
        <li>
          <image-uploader
            :validation="$v.thumbnail"
            @render="thumbnailRendered"
            ref="imageUploader"
          />
          <p v-if="$v.thumbnail.$dirty && $v.thumbnail.$invalid">
            {{ thumbnailErrors }}
          </p>
        </li>
        <li>
          <label for="date">Date Available</label>
          <!-- <date-picker :option="timeOption" :date="date" :limit="limit" /> -->
          <input
            type="datetime-local"
            name="date"
            id="date"
            v-model="date"
            @change="$v.date.$touch()"
          />
          <p v-if="$v.date.$dirty && $v.date.$invalid">
            {{ dateErrors }}
          </p>
        </li>
        <li>
          <div class="can-toggle">
            <input type="checkbox" id="delivery" v-model="delivery" />
            <label for="delivery">
              <div
                class="can-toggle__switch"
                data-checked="Delivery"
                data-unchecked="Pickup"
              ></div>
            </label>
          </div>

          <p v-if="$v.delivery.$dirty && $v.delivery.$invalid">
            {{ deliveryErrors }}
          </p>
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
import {
  required,
  minLength,
  minValue,
  numeric,
  integer,
} from "vuelidate/lib/validators";
import { dateInFuture } from "../validators/validators";

export default {
  data() {
    return {
      name: "",
      description: "",
      date: "",
      thumbnail: "",
      price: null,
      quantity: null,
      croppedImage: {},
      presignedURL: "",
      photoFilename: "",
      delivery: true,
      shop: "",
    };
  },
  methods: {
    thumbnailRendered: function(e) {
      this.thumbnail = e;
    },
    submit: async function() {
      this.$v.$touch();
      if (this.$v.$anyError) {
        return;
      }
      this.$store.commit("loading/start");
      // request a signedUrl to upload the image to.
      let imageResponse;
      try {
        imageResponse = await this.$http.get(
          `${process.env.VUE_APP_IMAGE_SERVICE_URL}/image/url`
        );
      } catch (error) {
        console.error(error);
        this.$store.commit("loading/stop");
        return;
      }
      // upload the image.
      try {
        await this.$refs.imageUploader.uploadImage(
          imageResponse.data.uploadURL
        );
      } catch (error) {
        console.error(error);
        this.$store.commit("loading/stop");
        return;
      }
      const splitString = this.date.time.split(" ");
      const deliveryDateTime = new Date(`${splitString[0]}T${splitString[1]}`);
      // add the product to the database.
      const params = {
        name: this.name,
        description: this.description,
        thumbnail: `${process.env.VUE_APP_IMAGE_S3_BUCKET}/${imageResponse.data.photoFilename}`,
        price: this.price,
        quantity: this.quantity,
        remaining: this.quantity,
        available: deliveryDateTime,
        delivery: this.delivery,
        shop: this.$route.params.id,
      };
      const options = {
        headers: {
          Authorization: `Bearer ${this.$store.state.account.token}`,
        },
      };
      try {
        await this.$http.post(
          `${process.env.VUE_APP_PRODUCT_SERVICE_URL}/product`,
          params,
          options
        );
      } catch (error) {
        console.error("Oh No! An Error!", error);
        this.$store.commit("loading/stop");
        return;
      }
      this.$router.push(`/products/${this.shop}/${this.$route.params.owner}`);
      this.$store.commit("loading/stop");
    },
  },
  validations: {
    name: { required, minLength: minLength(3) },
    description: { required, minLength: minLength(8) },
    thumbnail: { required },
    price: { required, minValue: minValue(0), numeric },
    quantity: { required, minValue: minValue(1), integer },
    delivery: { required },
    date: { required, dateInFuture },
  },
  computed: {
    nameErrors() {
      const errors = [];
      if (!this.$v.name.$dirty) return errors;
      !this.$v.name.required && errors.push("Name is required.");
      !this.$v.name.minLength &&
        errors.push("Name must be at least 3 characters long.");
      return errors;
    },
    descriptionErrors() {
      const errors = [];
      if (!this.$v.description.$dirty) return errors;
      !this.$v.description.required && errors.push("Description is required.");
      !this.$v.description.minLength &&
        errors.push("Description must be at least 8 characters long.");
      return errors;
    },
    priceErrors() {
      const errors = [];
      if (!this.$v.price.$dirty) return errors;
      !this.$v.price.required && errors.push("Price is required.");
      !this.$v.price.minValue && errors.push("Price cannot be below zero.");
      !this.$v.price.numeric && errors.push("Price must be a number.");

      return errors;
    },
    quantityErrors() {
      const errors = [];
      if (!this.$v.quantity.$dirty) return errors;
      !this.$v.quantity.required && errors.push("Quantity is required.");
      !this.$v.quantity.minValue && errors.push("Quantity must be at least 1.");
      return errors;
    },
    dateErrors() {
      const errors = [];
      if (!this.$v.date.$dirty) return errors;
      !this.$v.date.required && errors.push("Date is required.");
      !this.$v.date.dateInFuture &&
        errors.push("Date must not be in the past.");
      return errors;
    },
    thumbnailErrors() {
      const errors = [];
      if (!this.$v.thumbnail.$dirty) return errors;
      !this.$v.thumbnail.required && errors.push("Thumbnail is required.");
      return errors;
    },
  },
  mounted() {
    this.$store.commit("loading/stop");
    if (this.$store.state.account.token === null) {
      this.$router.push("/login");
    }
    this.shop = this.$route.params.id;
  },
};
</script>

<style lang="scss">
@import "../assets/styles/config.scss";
@import "../assets/styles/toggle.scss";
.add-product {
  padding: 5em 1em;
  ul {
    li {
      margin: 1em 0;

      .wrapper {
        display: flex;
        justify-content: space-between;
        .name {
          width: 65vw;
        }
      }
      label {
        margin: 0 0 0.5em;
        font-weight: 600;

        line-height: 2;
        .price,
        .quantity {
          width: 175px;
        }
      }
      input {
        height: 1.5em;

        box-shadow: 0 4px 8px 0 rgba(0, 0, 0, 0.2),
          0 6px 20px 0 rgba(0, 0, 0, 0.19);
        border-radius: 5%;
        border: solid 1px $color-primary-0;
        text-indent: 0.25em;
        font-size: 1.5em;
      }
      #date {
        font-size: 1em;
        width: 85%;
      }
      .price,
      .quantity {
        text-align: right;
        font-size: 1.5em;
        height: 1.5em;

        width: 20%;
        padding-right: 0.25em;
        .error {
          display: inline-block;
        }
      }

      textarea {
        resize: none;
        font-size: 1.5em;
        height: 8em;
        padding: 0.5em;
        text-align: left;
        margin-top: 0;
        width: 100%;
        box-shadow: 0 4px 8px 0 rgba(0, 0, 0, 0.2),
          0 6px 20px 0 rgba(0, 0, 0, 0.19);
        border-radius: 5%;
        border: solid 1px $color-primary-0;
        overflow: auto;
      }
    }
  }

  button#submit {
    display: block;
    background-color: $color-primary-0;
    color: $color-primary-3;
    width: 100%;
    height: 2em;
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
