<template>
  <div class="store" @click="onClick">
    <div id="store-thumbnail" ref="thumbnail"></div>
    <h2>{{ displayName(store.name) }}</h2>
  </div>
</template>

<script>
export default {
  data() {
    return {};
  },
  methods: {
    onClick: function() {
      this.$emit("selected", this.store);
    },
    displayName(fullName) {
      if (fullName.length > 20) {
        return fullName.substring(0, 20) + "...";
      } else {
        return fullName;
      }
    },
  },
  mounted() {
    this.$refs[
      "thumbnail"
    ].style.backgroundImage = `url(${this.store.thumbnail})`;
  },
  props: ["store"],
};
</script>

<style lang="scss" scoped>
@import "../assets/styles/config.scss";
.store {
  padding: 0.5em 0;
  margin: 0 0 1em;
  box-shadow: 0 4px 8px 0 rgba(0, 0, 0, 0.2), 0 6px 20px 0 rgba(0, 0, 0, 0.19);
  width: 260px;
  height: 167px;
  border-radius: 5%;
  background-color: $color-primary-0;

  h2 {
    padding: 0.35em 0.25em;
    font-size: 16px;
    float: left;
    margin: 0.1em 0;
    max-width: 200px;
  }
  cursor: pointer;
  #store-thumbnail {
    width: 260px;
    height: 120px;
    background-size: cover;
  }
}
</style>
