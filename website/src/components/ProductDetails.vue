<template>
  <div class="product">
    <div class="wrapper" v-show="!edit">
      <div class="hero" ref="thumbnail">
        <h2 class="name">{{ details.name }}</h2>
      </div>
      <div class="description">
        <p>{{ details.description }}</p>
      </div>
      <ul>
        <li>
          <h2>Price</h2>
          <p>{{ details.price }} RM</p>
        </li>
        <li>
          <h2>Quantity</h2>
          <p>{{ details.quantity }}</p>
        </li>
        <li>
          <h2>Date Available</h2>

          <p>{{ details.available }}</p>
        </li>
        <li>
          <h2>Delivery</h2>

          <p>{{ details.delivery }}</p>
        </li>
        <li v-show="!this.edit && this.isOwner()">
          <button class="edit" @click="toggleEdit">
            Edit
          </button>
        </li>
        <li v-show="!this.isOwner()">
          <button class="addToCart" @click="addToCart">
            <p v-show="this.$store.state.account.token !== null">Add To Cart</p>
            <p v-show="this.$store.state.account.token === null">
              Sign In to Add To Cart
            </p>
          </button>
        </li>
      </ul>
    </div>
    <form action="submit" v-show="edit" class="editForm">
      <ul>
        <li class="price">
          <div class="flex-wrapper">
            <label for="price">Price</label>
            <input v-model="changes.price" name="price" class="price" />RM
          </div>
        </li>
        <li class="quantity">
          <div class="wrapper">
            <label for="quantity">Quantity</label>
            <input
              v-model="changes.quantity"
              name="quantity"
              class="quantity"
            />
          </div>
        </li>
        <!-- Add option for On-Demand -->
        <li>
          <label for="description">Description</label>
          <textarea
            id="description"
            v-model="changes.description"
            name="description"
            placeholder="Enter a description here..."
          />
        </li>
        <li>
          <image-uploader @render="thumbnailRendered" ref="imageUploader" />
        </li>
        <li>
          <label for="date">Date Available</label>
          <input v-model="changes.date" type="date" name="date" />
        </li>
        <!-- Preset Delivery Time -->
        <li>
          <div class="can-toggle">
            <input type="checkbox" id="delivery" v-model="changes.delivery" />
            <label for="delivery">
              <div
                class="can-toggle__switch"
                data-checked="Delivery"
                data-unchecked="Pickup"
              ></div>
            </label>
          </div>

          <label for="deliveryTime">
            Set Delivery Time
            <input
              type="checkbox"
              id="setDeliveryTime"
              v-model="changes.setDeliveryTime"
            />
          </label>
        </li>
      </ul>
      <button class="save" v-show="this.edit" @click="save">Save</button>
    </form>
  </div>
</template>

<script>
import axios from "axios";
// import { required, minLength } from "vuelidate/lib/validators";

export default {
  data() {
    return {
      details: {},
      changes: {},
      edit: false,
      thumbnail: "",
    };
  },
  methods: {
    thumbnailRendered: function(e) {
      this.thumbnail = e;
    },
    addToCart() {
      if (this.$store.state.account.token === null) {
        this.$router.push("/login");
      }
      this.$store.commit("cart/add", this.details);
      console.log(`Added ${this.details.name} to Cart!`);
    },
    isOwner() {
      if (this.details.owner === null) {
        return false;
      }
      if (this.$store.state.account.token === null) {
        return false;
      }
      if (this.$store.state.account.user === null) {
        return false;
      }
      if (this.$store.state.account.user.pk === this.details.owner) {
        return true;
      }
      return false;
    },
    toggleEdit() {
      this.edit = !this.edit;
    },
    save: async function(e) {
      e.preventDefault();
      const originalKeys = Object.keys(this.details);
      const filtered = originalKeys.filter(
        (key) => this.details[key] !== this.changes[key]
      );
      const params = {};
      filtered.forEach((key) => {
        params[key] = this.changes[key];
      });
      params["id"] = this.$route.params.id;
      console.log("Saving changes to: ", params);
      this.$store.commit("loading/start");
      if (params.thumbnail !== undefined) {
        const resUrl = await axios.get(
          `${process.env.VUE_APP_IMAGE_SERVICE_URL}/image/url`
        );
        const resUpload = await this.$refs.imageUploader.uploadImage(
          resUrl.data.uploadURL
        );
        params.thumbnail = `${process.env.VUE_APP_IMAGE_S3_BUCKET}/${resUpload.data.photoFilename}`;
      }

      const options = {
        headers: {
          Authorization: `Bearer ${this.$store.state.account.token}`,
        },
      };

      try {
        await axios.put(
          `${process.env.VUE_APP_PRODUCT_SERVICE_URL}/product`,
          params,
          options
        );
      } catch (putError) {
        console.error(putError);
      }
      this.$store.commit("loading/stop");
      this.toggleEdit();
    },
    getProduct: async function() {
      try {
        const options = {
          params: {
            id: this.$route.params.id,
          },
        };
        const res = await axios.get(
          `${process.env.VUE_APP_PRODUCT_SERVICE_URL}/product`,
          options
        );
        this.details = res.data[0];
        this.changes = { ...this.details };
        this.$refs["thumbnail"].style.setProperty(
          "--thumbnail",
          `url(${this.details.thumbnail})`
        );
        this.$store.commit("loading/stop");
      } catch (error) {
        console.error(error);
      }
    },
  },
  validations: {},
  computed: {},
  mounted() {
    this.$store.commit("loading/start");
    this.getProduct();
  },
};
</script>

<style lang="scss" scoped>
@import "../assets/styles/config.scss";
@import "../assets/styles/toggle.scss";

.product {
  overflow: auto;
  .wrapper {
    .hero {
      padding: 4em 0;
      background: var(--thumbnail);
      background-size: cover;
      min-width: 325px;
      min-height: 25vh;
      .name {
        display: inline-flex;
        min-width: 0;
        min-height: 0;
        color: #fff;
        margin: 1em;
        background-color: rgba($color-primary-4, 0.4);
        border-radius: 5%;
        border: none;
        line-height: 0.8;
      }
    }
    .description {
      margin: 1em;
    }

    ul {
      margin: 1em;
    }

    .edit {
      margin: 1em 0;
      min-width: 340px;
      min-height: 2em;
      background-color: $color-primary-1;
      border-radius: 5%;
      border: solid 1px $color-primary-0;
      font-size: 24px;
      color: $color-primary-0;
    }
    .save,
    .addToCart {
      margin: 1em 0;
      min-width: 340px;
      min-height: 2em;
      background-color: $color-primary-0;
      border-radius: 5%;
      border: solid 1px $color-primary-4;
      color: $color-primary-1;
      font-size: 24px;
      &:disabled {
        background-color: rgb(143, 143, 143);
      }
    }
  }
  .editForm {
    padding: 5em 1em;
    ul {
      li {
        margin: 1em 0;
        .flex-wrapper {
          display: flex;
        }
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

  input#submit {
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
