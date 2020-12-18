<template>
  <div class="product" @click="onClick" ref="component">
    <div id="product-thumbnail" ref="thumbnail"></div>
    <div class="wrapper">
      <h2>{{ displayName(product.name) }}</h2>
      <p
        class="remaining"
        v-show="
          product.remaining <= 10 &&
            product.remaining > 0 &&
            product.status != 'sold out'
        "
      >
        {{ product.remaining }} left
      </p>
      <p
        class="remaining"
        v-show="product.remaining == 0 || product.status == 'sold out'"
      >
        Sold Out
      </p>
    </div>
  </div>
</template>

<script>
export default {
  data() {
    return {};
  },
  mounted() {
    this.$refs[
      "thumbnail"
    ].style.backgroundImage = `url(${this.product.thumbnail})`;
    if (this.product.status != "active") {
      this.$el.classList.add("cancelled");
    }
  },
  props: ["product"],
  methods: {
    displayName(fullName) {
      if (fullName.length > 15) {
        return fullName.substring(0, 15) + "...";
      } else {
        return fullName;
      }
    },
    onClick: function() {
      this.$emit("selected", this.product);
    },
  },
};
</script>

<style lang="scss" scoped>
@import "../assets/styles/config.scss";
.product {
  padding: 0.5em 0;
  margin: 0 0 1em;
  box-shadow: 0 4px 8px 0 rgba(0, 0, 0, 0.2), 0 6px 20px 0 rgba(0, 0, 0, 0.19);
  width: 260px;
  height: 167px;
  border-radius: 5%;
  background-color: $color-primary-0;

  .wrapper {
    display: flex;
    justify-content: space-between;
    padding: 0.35em 0.25em;
    h2 {
      font-size: 16px;
      float: left;
      margin: 0.1em 0;
      max-width: 170px;
    }
    .remaining {
      color: #fff;
      float: right;
      margin: 0.1em 0;
      font-size: 14px;
    }
  }

  cursor: pointer;
  #product-thumbnail {
    width: 260px;
    height: 120px;
    background-size: cover;
    display: block;
  }
}
.cancelled {
  background-color: grey;
}
</style>
