import Vue from "vue";
import VueRouter from "vue-router";
import Home from "../components/Home.vue";
import store from "../store/index";
Vue.use(VueRouter);

const boot = (to, from, next) => {
  if (store.state.account.token === null) {
    router.push("/");
  }
  next();
};

const routes = [
  {
    path: "/",
    name: "Home",
    component: Home,
  },
  {
    path: "/buy",
    name: "Buy",
    component: Home,
  },
  {
    path: "/shops",
    name: "Shops",
    component: () => import("../components/Shops.vue"),
    beforeEnter: boot,
  },
  {
    path: "/products/:id/:owner",
    name: "Products",
    component: () => import("../components/Products.vue"),
  },
  {
    path: "/newshop",
    name: "New Shop",
    component: () => import("../components/NewShop.vue"),
    beforeEnter: boot,
  },
  {
    path: "/newproduct/:id/:owner",
    name: "New Product",
    component: () => import("../components/NewProduct.vue"),
    beforeEnter: boot,
  },
  {
    path: "/product/:id",
    name: "Product Details",
    component: () => import("../components/ProductDetails.vue"),
  },
  {
    path: "/cart",
    name: "Cart",
    component: () => import("../components/Cart.vue"),
    beforeEnter: boot,
  },
  {
    path: "/checkout/:shop/:owner",
    name: "Checkout",
    component: () => import("../components/Checkout.vue"),
    beforeEnter: boot,
  },
  {
    path: "/account",
    name: "Account",
    component: () => import("../components/Account.vue"),
    beforeEnter: boot,
  },
  {
    path: "/login",
    name: "Login",
    component: () => import("../components/Login.vue"),
  },
  {
    path: "/logout",
    name: "Logout",
    component: () => import("../components/Logout.vue"),
  },
  {
    path: "/register",
    name: "Register",
    component: () => import("../components/Register.vue"),
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
