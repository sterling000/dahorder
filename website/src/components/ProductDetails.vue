<template>
  <div class="product">
    <div class="hero" ref="thumbnail"></div>
    <div class="wrapper">
      <h2 class="name">{{ details.name }}</h2>
      <font-awesome-icon
        class="share-icon"
        :icon="['fas', 'share']"
        @click.prevent="share"
        v-show="!edit"
      />
      <div class="description">
        <p v-show="!edit">{{ details.description }}</p>
        <textarea
          name="description"
          :placeholder="details.description"
          v-show="edit"
        ></textarea>
      </div>
      <ul>
        <li>
          <h2>Price</h2>
          <p v-show="!edit">{{ details.price }} RM</p>
          <input
            type="text"
            name="price"
            :placeholder="details.price"
            v-show="edit"
          />
        </li>
        <li>
          <h2>Quantity</h2>
          <p v-show="!edit">{{ details.quantity }}</p>
          <input
            type="text"
            name="quantity"
            :placeholder="details.quantity"
            v-show="edit"
          />
        </li>
        <li>
          <h2>Date Available</h2>

          <p v-show="!edit">{{ localeTime(details.available) }}</p>
          <date-picker
            v-show="edit"
            :option="timeOption"
            :date="date"
            :limit="limit"
          />
        </li>
        <li>
          <h2>Delivery</h2>
          <p v-show="!edit">{{ details.delivery }}</p>
          <div v-show="edit" class="can-toggle">
            <input type="checkbox" id="delivery" v-model="changes.delivery" />
            <label for="delivery">
              <div
                class="can-toggle__switch"
                data-checked="Delivery"
                data-unchecked="Pickup"
              ></div>
            </label>
          </div>
        </li>
        <li v-show="this.isOwner()">
          <button v-show="!this.edit" class="edit" @click="toggleEdit">
            Edit
          </button>
          <button v-show="this.edit" class="save" @click="save">
            Save
          </button>
          <button v-show="this.edit" class="cancel" @click="toggleEdit">
            Cancel
          </button>
        </li>
        <li v-show="!this.isOwner()">
          <button class="addToCart" @click="addToCart">
            <p v-show="this.$store.state.account.token !== null">
              Add To Cart
            </p>
            <p v-show="this.$store.state.account.token === null">
              Sign In to Add To Cart
            </p>
          </button>
        </li>
      </ul>
    </div>
  </div>
</template>

<script>
export default {
  data() {
    return {
      details: {},
      changes: {
        delivery: true,
      },
      edit: false,
      thumbnail: "",
      date: {
        time: "",
      },
      timeOption: {
        type: "min",
        week: ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"],
        month: [
          "January",
          "February",
          "March",
          "April",
          "May",
          "June",
          "July",
          "August",
          "September",
          "October",
          "November",
          "December",
        ],
        format: "YYYY-MM-DD HH:mm",
      },
    };
  },
  methods: {
    localeTime(utc) {
      const dateTime = new Date(utc);
      return dateTime.toLocaleString();
    },
    async share() {
      await navigator.clipboard.writeText(window.location);
      console.log("Link copied to clipboard.");
    },
    thumbnailRendered: function(e) {
      this.thumbnail = e;
    },
    addToCart() {
      if (this.$store.state.account.token === null) {
        this.$router.push("/login");
      }
      this.$store.commit("cart/addProduct", this.details);
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
      console.log("Saving changes.");
      this.$store.commit("loading/start");
      if (params.thumbnail !== undefined) {
        const resUrl = await this.$http.get(
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
        await this.$http.put(
          `${process.env.VUE_APP_PRODUCT_SERVICE_URL}/product`,
          params,
          options
        );
      } catch (putError) {
        console.error(putError);
      }
      this.details = this.changes;
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
        const res = await this.$http.get(
          `${process.env.VUE_APP_PRODUCT_SERVICE_URL}/product`,
          options
        );
        this.details = res.data[0];
        this.details.delivery = this.details.delivery == "true";
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
  computed: {
    limit() {
      const from = new Date();
      const fromDate = new Date(
        from.getTime() - from.getTimezoneOffset() * 60000
      )
        .toISOString()
        .split("T")[0];
      const to = new Date(from);
      to.setDate(to.getDate() + 90); // 90 days is the furthest out we should let people book to start.
      const toDate = new Date(to.getTime() - to.getTimezoneOffset() * 60000)
        .toISOString()
        .split("T")[0];
      return [
        {
          type: "fromto",
          from: fromDate,
          to: toDate,
        },
      ];
    },
  },
  mounted() {
    this.$store.commit("loading/start");
    this.getProduct();
  },
};
</script>

<style lang="scss">
@import "../assets/styles/config.scss";
@import "../assets/styles/toggle.scss";

.product {
  padding: 4em 0 10em;
  .hero {
    // margin: 4em 0 0;
    background: var(--thumbnail);
    background-size: cover;
    min-width: 325px;
    min-height: 25vh;
  }
  .wrapper {
    .name {
      display: inline-flex;
      min-width: 0;
      min-height: 0;
      margin: 1em 0.5em 0;
      border: none;
      line-height: 0.8;
    }
    .share-icon {
      color: #aaa;
      font-size: 24px;
      margin: 0 0.5em;
      cursor: pointer;
    }
    .description {
      margin: 1em;
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
    ul {
      margin: 1em;
      input {
        height: 1.5em;

        box-shadow: 0 4px 8px 0 rgba(0, 0, 0, 0.2),
          0 6px 20px 0 rgba(0, 0, 0, 0.19);
        border-radius: 5%;
        border: solid 1px $color-primary-0;
        text-indent: 0.25em;
        font-size: 1.5em;
      }
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
    .cancel {
      margin: 1em 0;
      min-width: 340px;
      min-height: 2em;
      background-color: rgb(143, 143, 143);
      border-radius: 5%;
      border: solid 1px $color-primary-4;
      color: $color-primary-1;
      font-size: 24px;
      &:disabled {
        background-color: rgb(143, 143, 143);
      }
    }
  }
}
</style>
