<template>
  <div class="add-shop">
    <h1>New Shop</h1>
    <form>
      <ul>
        <li>
          <label for="name">Name</label>
          <input v-model="name" name="name" @blur="$v.name.$touch()" />
          <p v-if="$v.name.$dirty && $v.name.$invalid">{{ nameErrors }}</p>
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
          <label for="condo">Condo</label>
          <select v-model="condo" name="condo" @blur="$v.condo.$touch()">
            <option selected>Armanee Terrace</option>
          </select>
          <p v-if="$v.condo.$dirty && $v.condo.$invalid">{{ condoErrors }}</p>
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
import { required, minLength } from "vuelidate/lib/validators";

export default {
  data() {
    return {
      name: "",
      description: "",
      condo: "Armanee Terrace",
      thumbnail: "",
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

      this.$http
        .get(`${process.env.VUE_APP_IMAGE_SERVICE_URL}/image/url`)
        .then((res) => {
          this.$refs.imageUploader.uploadImage(res.data.uploadURL);
          this.$store.commit("loading/start");
          const params = {
            name: this.name,
            description: this.description,
            thumbnail: `${process.env.VUE_APP_IMAGE_S3_BUCKET}/${res.data.photoFilename}`,
            condo: this.condo,
          };
          const options = {
            headers: {
              Authorization: `Bearer ${this.$store.state.account.token}`,
            },
          };
          this.$http
            .post(
              `${process.env.VUE_APP_SHOP_SERVICE_URL}/shop`,
              params,
              options
            )
            .then(() => {
              this.$router.push("/shops");
            })
            .catch((error) => {
              const errorKeys = Object.keys(error);
              console.log(errorKeys);
              const errors = [];
              errorKeys.forEach((key) => errors.push(error[key]));
              console.error("Oh No! An Error!", JSON.stringify(errors));
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
    condo: { required },
    thumbnail: { required },
  },
  computed: {
    nameErrors() {
      const errors = [];
      if (!this.$v.name.$dirty) return errors;
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
    condoErrors() {
      const errors = [];
      if (!this.$v.condo.$dirty && !this.$v.condo.$dirty) return errors;
      !this.$v.condo.required && errors.push("Condo is required.");
      return errors;
    },
    thumbnailErrors() {
      const errors = [];
      if (!this.validation.$dirty && !this.validation.$dirty) return errors;
      !this.validation.required && errors.push("Thumbnail is required.");
      return errors;
    },
  },
  mounted() {
    this.$store.commit("loading/stop");
    if (this.$store.state.account.token === null) {
      this.$router.push("/login");
    }
  },
};
</script>

<style lang="scss">
@import "../assets/styles/config.scss";
.add-shop {
  padding: 5em 1em;
  ul {
    li {
      margin: 1em 0;
      label {
        width: 350px;
        margin: 0 0 0.5em;
        font-weight: 600;
        font-size: 1.5em;
      }

      input {
        display: block;
        width: 100%;
        height: 1.5em;
        text-indent: 0.5em;
        box-shadow: 0 4px 8px 0 rgba(0, 0, 0, 0.2),
          0 6px 20px 0 rgba(0, 0, 0, 0.19);
        border-radius: 5%;
        border: solid 1px $color-primary-0;
        font-size: 1.5em;
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
        font-size: 1.5em;
      }
      select {
        font-size: 1.5em;
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
