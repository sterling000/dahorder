<template>
  <div class="image-uploader">
    <label for="thumbnail" id="thumbnailLabel">
      <p class="thumbnail">Image</p>
      <div class="wrapper">
        <div class="camera" v-if="image === null">
          <font-awesome-icon :icon="['fas', 'camera']" />
          <p>Camera</p>
        </div>
        <p class="or" v-if="image === null">Or</p>
        <div class="custom-file-upload" v-if="image === null">
          <font-awesome-icon :icon="['fas', 'file-upload']" />
          <p>Upload</p>
        </div>
      </div>
    </label>
    <div class="cropper-wrapper">
      <cropper
        class="cropper"
        :src="image"
        :stencil-props="this.stencilProps"
        ref="cropper"
        :wheelResize="false"
        :touchResize="false"
      />
    </div>
    <div class="image-actions">
      <font-awesome-icon
        class="share-icon"
        :icon="['fas', 'share']"
        @click.prevent="rotate"
        v-show="image !== null"
      />
    </div>

    <input
      id="camera"
      name="camera"
      type="file"
      accept="image/*"
      capture="camera"
      @change="loadImage($event)"
    />
    <input
      id="thumbnail"
      type="file"
      name="thumbnail"
      accept="image/*"
      @change="loadImage($event)"
    />
  </div>
</template>

<script>
export default {
  data() {
    return {
      image: null,
    };
  },
  methods: {
    rotate() {
      var image = document.createElement("img");
      image.crossOrigin = "anonymous";
      image.src = this.image;
      image.onload = () => {
        var canvas = document.createElement("canvas");
        var ctx = canvas.getContext("2d");

        if (image.width > image.height) {
          canvas.width = image.height;
          canvas.height = image.width;
          ctx.translate(image.height, image.width / image.height);
        } else {
          canvas.height = image.width;
          canvas.width = image.height;
          ctx.translate(image.height, image.width / image.height);
        }
        ctx.rotate(Math.PI / 2);
        ctx.drawImage(image, 0, 0);
        this.image = canvas.toDataURL();
      };
    },
    loadImage(event) {
      // Reference to the DOM input element
      var input = event.target;
      // Ensure that you have a file before attempting to read it
      if (input.files && input.files[0]) {
        // create a new FileReader to read this image and convert to base64 format
        var reader = new FileReader();
        // Define a callback function to run, when FileReader finishes its job
        reader.onload = (e) => {
          // Note: arrow function used here, so that "this.imageData" refers to the imageData of Vue component
          // Read image as base64 and set to imageData
          this.image = e.target.result;
          this.$emit("render", this.image);
          this.validate();
        };
        // Start the reader job - read file as a data url (base64 format)
        reader.readAsDataURL(input.files[0]);
      }
    },
    uploadImage: async function(presignedURL) {
      this.$store.commit("loading/start");
      const { canvas } = this.$refs.cropper.getResult();
      if (canvas) {
        const form = new FormData();
        canvas.toBlob(async (blob) => {
          form.append("file", blob);

          // You can use axios, superagent and other libraries instead here
          var options = {
            headers: {
              "Content-Type": "image/jpeg",
              "x-amz-acl": "public-read",
            },
          };
          try {
            await this.$http.put(presignedURL, blob, options);
          } catch (error) {
            console.error("Upload Error...", error);
          }
          // Perhaps you should add the setting appropriate file format here
        }, "image/jpeg");
      }
    },
    validate: function() {
      if (this.validation !== null) {
        this.validation.$touch();
      }
    },
  },
  props: ["validation", "stencilProps"],
};
</script>

<style lang="scss" scoped>
@import "../assets/styles/config.scss";
.image-uploader {
  margin: 1em 0;

  .image-actions {
    text-align: center;
    font-size: 3em;
  }
  label {
    .thumbnail {
      font-size: 1.5em;
    }
    .wrapper {
      width: 350px;
      margin: 0 0 0.5em;
      font-weight: 600;
      display: flex;
      .or {
        margin: 3em 1em;
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
        line-height: 1;
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
        line-height: 1.5;
        p {
          font-size: 24px;
          font-weight: 600;
        }
        font-awesome-icon {
          font-weight: 600;
        }
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
