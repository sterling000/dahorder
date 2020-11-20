<template>
  <div>Logging out...</div>
</template>

<script>
export default {
  mounted() {
    this.$store.dispatch("account/logout");
    this.$router.push("/");
  },
};
</script>
