import Vue from "vue";
import VueRouter from "vue-router";
import store from "../store/index";
Vue.use(VueRouter);

const boot = (to, from, next) => {
  if (store.state.account.token === null) {
    router.push("/login");
  }
  next();
};

const routes = [
  {
    path: "/",
    name: "Admin",
    component: () => import("../components/Admin.vue"),
    beforeEnter: boot,
  },
  {
    path: "/login",
    name: "Login",
    component: () => import("../components/Login.vue"),
  },
];

const router = new VueRouter({
  routes,
  scrollBehavior(to, from, savedPosition) {
    if (savedPosition) {
      return savedPosition;
    } else {
      return { x: 0, y: 0 };
    }
  },
  mode: "history",
});

export default router;
