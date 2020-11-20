<template>
  <div class="add-product">
    <h1>New Product</h1>
    <form @submit="submit" method="POST">
      <ul>
        <li>
          <label for="name">Name</label>
          <input v-model="name" name="name" @blur="$v.name.$touch()" />
          <p v-if="$v.name.$dirty && $v.name.$invalid">{{ nameErrors }}</p>
        </li>
        <li class="price">
          <div class="wrapper">
            <label for="price">Price</label>
            <input
              v-model="price"
              name="price"
              class="price"
              @blur="$v.price.$touch()"
            />RM
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
        <!-- Add option for On-Demand -->
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
            validation="$v.thumbnail"
            @render="thumbnailRendered"
            ref="imageUploader"
          />
          <p v-if="$v.thumbnail.$dirty && $v.thumbnail.$invalid">
            {{ thumbnailErrors }}
          </p>
        </li>
        <li>
          <label for="date">Date Available</label>
          <input
            v-model="date"
            type="date"
            name="date"
            @blur="$v.date.$touch()"
          />
          <p v-if="$v.date.$dirty && $v.date.$invalid">{{ dateErrors }}</p>
        </li>
        <!-- Preset Delivery Time -->
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
import axios from "axios";

import { required, minLength } from "vuelidate/lib/validators";

export default {
  data() {
    return {
      name: "",
      description: "",
      date: "",
      thumbnail: "",
      price: 0,
      quantity: 0,
      croppedImage: {},
      presignedURL: "",
      photoFilename: "",
      delivery: "Delivery",
      shop: "",
    };
  },
  methods: {
    thumbnailRendered: function(e) {
      this.thumbnail = e;
    },
    submit: function() {
      this.$v.$touch();
      if (this.$v.$anyError) {
        return;
      }

      axios
        .get(`${process.env.VUE_APP_IMAGE_SERVICE_URL}/image/url`)
        .then((res) => {
          this.$refs.imageUploader.uploadImage(res.data.uploadURL);
          const params = {
            name: this.name,
            description: this.description,
            thumbnail: `${process.env.VUE_APP_IMAGE_S3_BUCKET}/${res.data.photoFilename}`,
            price: this.price,
            quantity: this.quantity,
            available: this.date,
            delivery: this.delivery,
            shop: this.$route.params.id,
          };
          this.$store.commit("loading/start");
          const options = {
            headers: {
              Authorization: `Bearer ${this.$store.state.account.token}`,
            },
          };
          axios
            .post(
              `${process.env.VUE_APP_PRODUCT_SERVICE_URL}/product`,
              params,
              options
            )
            .then(() => {
              this.$router.push(
                `/products/${this.shop}/${this.$route.params.owner}`
              );
            })
            .catch((error) => {
              console.error("Oh No! An Error!", error);
            })
            .finally(() => {
              this.$store.commit("loading/stop");
            });
        })
        .catch((error) => {
          console.error("Oh No! An Error!", error);
        })
        .finally(() => {
          // console.log('Do this always... or else...');
        });
    },
  },
  validations: {
    name: { required },
    description: { required, minLength: minLength(8) },
    thumbnail: { required },
    price: { required }, // todo: needs validation
    quantity: { required }, // todo: needs validation
    date: { required }, // todo: needs validation
    delivery: { required }, // todo: needs validation
  },
  computed: {
    nameErrors() {
      const errors = [];
      if (!this.$v.name.$dirty && !this.$v.name.$dirty) return errors;
      !this.$v.name.required && errors.push("Name is required.");
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
      if (!this.$v.price.$dirty && !this.$v.price.$dirty) return errors;
      !this.$v.price.required && errors.push("Price is required.");
      return errors;
    },
    quantityErrors() {
      const errors = [];
      if (!this.$v.quantity.$dirty && !this.$v.quantity.$dirty) return errors;
      !this.$v.quantity.required && errors.push("Quantity is required.");
      return errors;
    },
    dateErrors() {
      const errors = [];
      if (!this.$v.date.$dirty && !this.$v.date.$dirty) return errors;
      !this.$v.date.required && errors.push("Date is required.");
      return errors;
    },
    thumbnailErrors() {
      const errors = [];
      if (!this.$v.thumbnail.$dirty && !this.$v.thumbnail.$dirty) return errors;
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

      label {
        display: inline-block;
        width: 350px;
        margin: 0 0 0.5em;
        font-weight: 600;

        .price,
        .quantity {
          width: 175px;
        }
      }
      input {
        display: block;
        width: 100%;
        height: 3em;
        box-shadow: 0 4px 8px 0 rgba(0, 0, 0, 0.2),
          0 6px 20px 0 rgba(0, 0, 0, 0.19);
        border-radius: 5%;
        border: solid 1px $color-primary-0;
        text-indent: 1em;

        .price,
        .quantity {
          width: 50%;
        }
      }
      .price,
      .quantity {
        text-align: right;
        font-size: 24px;
        height: 1em;
        width: 50%;
        margin-right: 0.5em;
        .error {
          display: inline-block;
        }
      }

      textarea {
        resize: none;
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
