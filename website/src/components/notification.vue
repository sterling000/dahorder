<template>
  <div class="notification" @click="clicked" ref="root">
    <h3 class="info" v-show="this.notice.info !== ''">{{ notice.info }}</h3>
    <h3 class="error" v-show="this.notice.error !== ''">{{ notice.error }}</h3>
  </div>
</template>

<script>
export default {
  mounted() {
    setTimeout(
      () => this.$emit("destroy", this.notice.id),
      this.notice.timeout
    );
  },
  props: {
    notice: {
      info: { Type: String },
      error: { Type: String },
      id: { Type: Number },
    },
  },
  methods: {
    clicked() {
      this.$emit("destroy", this.notice.id);
    },
  },
};
</script>

<style lang="scss" scoped>
.notification {
  text-align: center;
  min-width: 90vw;
  max-width: 90vw;
  min-height: 2vh;
  font-size: 12px;
  margin: 0.5em;

  box-shadow: 0 4px 8px 0 rgba(0, 0, 0, 0.2), 0 6px 20px 0 rgba(0, 0, 0, 0.19);
  color: #fff;
  .info {
    background-color: #88cc88;
    border-radius: 5%;
    padding: 1em;
  }
  .error {
    background-color: #d46a6a;
    padding: 1em;
    border-radius: 5%;
  }
}
</style>
