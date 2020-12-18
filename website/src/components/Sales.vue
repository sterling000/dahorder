<template>
  <div class="sales">
    <ul>
      <li v-if="sales.length > 0">
        <p class="wait">
          Click here to download your sales data.
        </p>
      </li>
      <li v-if="sales.length > 0">
        <button class="download" @click.prevent="download">
          Download Sales
        </button>
      </li>
      <li v-if="sales.length == 0">
        <p class="wait">
          You don't have any sales yet to download.
        </p>
      </li>
    </ul>
  </div>
</template>

<script>
import jsonexport from "jsonexport";
export default {
  data() {
    return {
      sales: [],
      customerNames: [],
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
    const customerIds = [...new Set(this.sales.map((sale) => sale.customerId))];
    await Promise.all(
      customerIds.map(async (customerId) => {
        await this.getCustomerInfo(customerId);
      })
    );
    this.sales.map((sale) => {
      sale.customerName = this.customerNames[sale.customerId];
    });
  },
  methods: {
    async getCustomerInfo(customerId) {
      const userResponse = await this.$http.get(
        `${process.env.VUE_APP_USER_SERVICE_URL}/user`,
        {
          params: {
            user: customerId,
          },
        }
      );
      if (userResponse.data) {
        const { name } = userResponse.data;
        this.customerNames[customerId] = name;
      }
    },
    async download() {
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
  },
};
</script>

<style lang="scss">
@import "../assets/styles/config.scss";
.sales {
  text-align: center;
  margin: auto;
  width: 100%;
  height: 85vh;
  position: relative;
  ul {
    position: absolute;
    top: 50%;
    right: 50%;
    width: 100%;
    -ms-transform: translateY(-50%);
    transform: translateY(-50%);
    -ms-transform: translateX(50%);
    transform: translateX(50%);
    li {
      margin: 1em 0;
    }
  }
  .download {
    display: block;
    background-color: $color-primary-0;
    color: #fff;
    width: 80%;
    height: 2em;
    box-shadow: 0 4px 8px 0 rgba(0, 0, 0, 0.2), 0 6px 20px 0 rgba(0, 0, 0, 0.19);
    border-radius: 5%;
    border: solid 1px $color-primary-0;
    font-size: 1.5em;
    font-weight: 600;
    margin: auto;
    &:disabled {
      background-color: rgb(143, 143, 143);
      color: #fff;
    }
  }
}
</style>
