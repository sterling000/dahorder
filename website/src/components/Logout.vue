<template>
  <div>Logging out...</div>
</template>

<script>
export default {
  mounted() {
    this.$store.commit("account/logout");
    this.$router.push("/");
  },
};
</script>
