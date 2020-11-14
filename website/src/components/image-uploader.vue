<template>
  <div class="image-uploader">
    <label for="thumbnail" id="thumbnailLabel"
      ><p class="thumbnail">Image</p>
      <div class="wrapper">
        <div class="camera" v-if="this.thumbnail === ''">
          <font-awesome-icon :icon="['fas', 'camera']" />
          <p>Camera</p>
        </div>
        <p class="or" v-if="this.thumbnail === ''">Or</p>
        <div class="custom-file-upload" v-if="this.thumbnail === ''">
          <font-awesome-icon :icon="['fas', 'file-upload']" />
          <p>Upload</p>
        </div>
      </div>
      <canvas id="imagePreview" />
    </label>

    <input
      id="camera"
      name="camera"
      type="file"
      accept="image/*"
      capture="camera"
      @change="thumbnailChanged"
      @blur="validate"
    />
    <input
      id="thumbnail"
      type="file"
      name="thumbnail"
      accept="image/*"
      @change="thumbnailChanged"
      @blur="validate"
    />
  </div>
</template>

<script>
import axios from "axios";
import MegaPixImage from "../utils/MegaPixImage";
export default {
  data() {
    return {
      thumbnail: "",
      imagePreview: {},
    };
  },
  mounted() {
    this.imagePreview = document.getElementById("imagePreview");
  },
  methods: {
    thumbnailChanged: function(e) {
      if (e.target.files.length === 0) {
        return;
      }
      const file = e.target.files[0];
      const mpImg = new MegaPixImage(file);
      // Render resized image into canvas element.
      const ctx = this.imagePreview.getContext("2d");
      ctx.fillStyle = "#000";
      this.imagePreview.classList.add("show");
      mpImg.render(
        this.imagePreview,
        { maxWidth: 680, maxHeight: 360 },
        this.renderCallback
      );
    },
    renderCallback: function() {
      this.imagePreview.toBlob(
        (blob) => {
          this.thumbnail = blob;
          this.$emit("render", this.thumbnail);
        },
        "image/jpeg",
        0.9
      );
    },
    uploadImage: async function(presignedURL) {
      this.$store.commit("loading/start");
      console.log("Uploading to: ", presignedURL);
      var options = {
        headers: { "Content-Type": "image/jpeg", "x-amz-acl": "public-read" },
      };
      let res = {};
      try {
        res = await axios.put(presignedURL, this.thumbnail, options);
        console.log("Upload Response... ", res);
      } catch (error) {
        console.log("Upload Error...", error);
      }
      this.$store.commit("loading/stop");
    },
    validate: function() {
      if (this.validation !== null) {
        this.validation.$touch();
      }
    },
  },
  props: ["validation"],
};
</script>

<style lang="scss" scoped>
@import "../assets/styles/config.scss";
.image-uploader {
  margin: 1em 0;
  label {
    width: 350px;
    margin: 0 0 0.5em;
    font-weight: 600;
    .wrapper {
      display: flex;
    }
    .or {
      margin: 5em 1em;
    }
    .custom-file-upload {
      width: 100px;
      margin: 0.75em 0.5em 0 0;
      height: 2em;
      box-shadow: 0 4px 8px 0 rgba(0, 0, 0, 0.2),
        0 6px 20px 0 rgba(0, 0, 0, 0.19);
      border-radius: 5%;
      border: solid 1px $color-primary-0;
      cursor: pointer;
      text-align: center;
      font-size: 48px;
      padding: 0.2em 0;
      p {
        font-size: 18px;
        font-weight: 600;
      }
      font-awesome-icon {
        font-weight: 600;
      }
    }
    .camera {
      width: 175px;
      margin: 0.25em 0 0 0;
      height: 3em;
      box-shadow: 0 4px 8px 0 rgba(0, 0, 0, 0.2),
        0 6px 20px 0 rgba(0, 0, 0, 0.19);
      border-radius: 5%;
      border: solid 1px $color-primary-0;
      cursor: pointer;
      text-align: center;
      font-size: 48px;
      padding: 0.5em 0;
      p {
        font-size: 24px;
        font-weight: 600;
      }
      font-awesome-icon {
        font-weight: 600;
      }
    }
    canvas {
      position: absolute;
      top: 9999px;
      &.show {
        position: unset;
        top: 0px;
        display: block;
      }
    }
  }

  input {
    display: block;
    width: 100%;
    height: 3em;
    box-shadow: 0 4px 8px 0 rgba(0, 0, 0, 0.2), 0 6px 20px 0 rgba(0, 0, 0, 0.19);
    border-radius: 5%;
    border: solid 1px $color-primary-0;

    &#thumbnail {
      text-align: center;
      display: none;
    }
    &#camera {
      text-align: center;
      display: none;
    }
  }
}
</style>
