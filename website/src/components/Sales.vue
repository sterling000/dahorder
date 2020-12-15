<template>
  <div class="sales">
    <p v-if="sales.length > 0" class="wait">
      Your download will begin automatically in a few seconds.
    </p>
    <p v-if="sales.length == 0" class="wait">
      You don't have any sales yet to download.
    </p>
    <!-- <form action=""></form> -->
  </div>
</template>

<script>
import jsonexport from "jsonexport";
export default {
  data() {
    return {
      sales: [],
    };
  },
  async mounted() {
    const sales = await this.$http.get(
      `${process.env.VUE_APP_ORDER_SERVICE_URL}/sales`,
      {
        headers: {
          Authorization: `Bearer ${this.$store.state.account.token}`,
        },
      }
    );
    if (sales.status == 201) {
      return;
    }
    this.sales = sales.data[0]
      .map((sale) => {
        const { date, customerId, orderId, total } = sale;
        return {
          date: date,
          customerId: customerId,
          orderId: orderId,
          total: total,
        };
      })
      .sort((a, b) => {
        if (a.date > b.date) return -1;
        return 1;
      });
    try {
      jsonexport(this.sales, (err, csv) => {
        if (err) {
          return console.log(err);
        }
        const blob = new Blob([csv]);
        const link = document.createElement("a");
        link.href = window.URL.createObjectURL(blob);
        const now = new Date();
        link.download = `${now.getDate()}-${now.getMonth()}-${now.getFullYear()}-sales1.csv`;
        link.click();
      });
    } catch (err) {
      throw "Couldn't parse jsonexport";
    }
  },
};
</script>

<style lang="scss">
.sales {
  text-align: center;
  margin: auto;
  position: relative;
  width: 25em;
  height: 40em;
  .wait {
    padding: 0;
    margin: 0;
    position: absolute;
    top: 50%;
    left: 50%;
    transform-origin: center center;
    transform: translateX(calc((100% / 2) * (-1)))
      translateY(calc((100% / 2) * (-1)));
  }
}
</style>
