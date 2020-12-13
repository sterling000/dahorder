<template>
  <div class="product" @click="onClick" ref="component">
    <div id="product-thumbnail" ref="thumbnail"></div>
    <div class="wrapper">
      <h2>{{ product.name }}</h2>
      <p class="remaining" v-show="product.remaining <= 10">
        Only {{ product.remaining }} left
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
    h2 {
      font-size: 18px;
      float: left;
      margin: 0.25em 0;
    }
    .remaining {
      color: #fff;
      float: right;
      margin: 0.25em 0;
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
