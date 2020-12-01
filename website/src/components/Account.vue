<template>
  <div class="account">
    <h2>My Account</h2>
    <ul v-show="!this.edit">
      <li>
        <h3>Name:</h3>
        {{ user.name }}
      </li>
      <li>
        <h3>Phone:</h3>
        {{ user.pk }}
      </li>
      <li>
        <h3>Email:</h3>
        {{ user.email }}
      </li>
      <li>
        <h3>Condo:</h3>
        {{ user.condo }}
      </li>
      <li>
        <h3>Apartment:</h3>
        {{ user.apartment }}
      </li>
      <li>
        <h3>Role:</h3>
        {{ user.role }}
      </li>
      <li v-show="!this.edit">
        <button class="edit" @click="toggleEdit">
          Edit
        </button>
      </li>
    </ul>
    <form @submit="save" method="PUT" v-show="this.edit">
      <ul>
        <li>
          <label for="name">Name:</label>
          <input name="name" :placeholder="user.name" v-model="changes.name" />
        </li>
        <li>
          <label for="email">Email:</label>
          <input
            name="email"
            :placeholder="user.email"
            v-model="changes.email"
          />
        </li>
        <li>
          <label for="condo">Condo:</label>
          <select name="condo" v-model="user.condo">
            <option value="Armanee Terrace" selected>Armanee Terrace</option>
          </select>
        </li>
        <li>
          <label for="apartment">Apartment:</label>
          <input
            name="apartment"
            :placeholder="user.apartment"
            v-model="changes.apartment"
          />
        </li>
        <li>
          <label for="role">Role:</label>
          <select name="role" v-model="changes.role">
            <option value="buyer">Buyer</option>
            <option value="seller">Seller</option>
            <option value="both">Both</option>
          </select>
        </li>
        <li v-show="this.edit">
          <button class="save" @click.prevent="save">
            Save
          </button>
        </li>
      </ul>
    </form>
  </div>
</template>

<script>
export default {
  data() {
    return {
      edit: false,
      changes: {},
    };
  },
  methods: {
    toggleEdit() {
      this.edit = !this.edit;
    },
    save: async function() {
      const originalKeys = Object.keys(this.user);
      const filtered = originalKeys.filter((key) => {
        let result =
          this.changes[key] != undefined &&
          this.user[key] !== this.changes[key];
        return result;
      });
      const params = {};
      filtered.forEach((key) => {
        params[key] = this.changes[key];
      });
      params["pk"] = this.user.pk;
      console.log("Saving changes to: ", params);

      try {
        this.$store.commit("loading/start");
        const options = {
          headers: {
            Authorization: `Bearer ${this.$store.state.account.token}`,
          },
        };
        await this.$http.put(
          `${process.env.VUE_APP_USER_SERVICE_URL}/user`,
          params,
          options
        );
        const res = await this.$http.get(
          `${process.env.VUE_APP_USER_SERVICE_URL}/user`,
          options
        );
        this.$store.commit("account/user", res.data);
        this.toggleEdit();
      } catch (error) {
        console.error(error);
      } finally {
        this.$store.commit("loading/stop");
      }
    },
  },
  computed: {
    user() {
      return this.$store.state.account.user;
    },
  },
  mounted() {
    this.$store.commit("loading/stop");
  },
};
</script>

<style lang="scss">
.account {
  padding: 4em 1em;
  h3 {
    display: flex;
    text-transform: capitalize;
  }
  li {
    margin: 1em;
    label {
      margin: 0 0.5em 0 0;
    }
  }
}
</style>
