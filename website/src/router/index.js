import Vue from 'vue'
import VueRouter from 'vue-router'
import Home from '../components/Home.vue'

Vue.use(VueRouter)

const routes = [
  {
    path: '/',
    name: 'Home',
    component: Home
  },
  {
    path: '/buy',
    name: 'Buy',
    component: Home
  },
  {
    path: '/shops',
    name: 'Shops',
    component: () => import('../components/Shops.vue')
  },
  {
    path: '/products',
    name: 'Products',
    component: () => import('../components/Products.vue')
  },
  {
    path: '/newshop',
    name: 'New Shop',
    component: () => import('../components/NewShop.vue')
  },
  {
    path: '/newproduct',
    name: 'New Product',
    component: () => import('../components/NewProduct.vue')
  },
  {
    path: '/login',
    name: 'Login',
    component: () => import('../components/Login.vue')
  },
  {
    path: '/register',
    name: 'Register',
    component: () => import('../components/Register.vue')
  },
]

const router = new VueRouter({
  routes,
  mode: 'history'
})

export default router
