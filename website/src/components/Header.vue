<template>
    <header>
            <h1 class="logo">DAH ORDER</h1>
            <div class="menu-btn" v-on:click='toggleMenu'>
                <div class="btn-line"></div>
                <div class="btn-line"></div>
                <div class="btn-line"></div>
            </div>

        <nav class="menu">
            <ul class="menu-nav">
                <li id="Home" class="nav-item">
                    <router-link to="/" class="nav-link">Home</router-link>
                    <router-link to="/account" class="nav-link">My Account</router-link>
                    <router-link to="/orders" class="nav-link">My Orders</router-link>
                    <router-link to="/shops" class="nav-link">My Shops</router-link>
                    <router-link to="/logout" class="nav-link">Log out</router-link>
                </li>
            </ul>
        </nav>
    </header>
</template>
    
<script>
export default {
    data(){
        return {
            showMenu: false
        }
    },
    methods:{
        toggleMenu(){
            if(!this.showMenu){
                this.menuBtn.classList.add('close');
                this.menu.classList.add('show');
                this.menuNav.classList.add('show');
                this.navItems.forEach(item => item.classList.add('show'));

                this.showMenu = true;
            } else {
                this.menuBtn.classList.remove('close');
                this.menu.classList.remove('show');
                this.menuNav.classList.remove('show');
                this.navItems.forEach(item => item.classList.remove('show'));

                this.showMenu = false;
            }
        }
    },
    computed:{
        menuBtn(){
            return document.querySelector('.menu-btn');
        },
        menu(){
            return document.querySelector('.menu');
        },
        menuNav(){
            return document.querySelector('.menu-nav');
        },
        navItems(){
            return document.querySelectorAll('.nav-item');
        },
    },
    watch: {
        $route(to, from){
            this.menuBtn.classList.remove('close');
            this.menu.classList.remove('show');
            this.menuNav.classList.remove('show');
            this.navItems.forEach(item => item.classList.remove('show'));

            this.showMenu = false;

            this.navItems.forEach(navItem => {
                if(navItem.id == to.name)
                {
                    navItem.classList.add('current');
                } else if(navItem.id == from.name){
                    navItem.classList.remove('current');
                }
            });
        }
    },
    mounted(){
    }
}
</script>

<style lang="scss">
@import "../assets/styles/config.scss";
@import "../assets/styles/menu.scss";

.text-secondary{
    color: $secondary-color;
}

header {
    background-color: $primary-color;
    min-height: 5vh;
    display: flex;
    justify-content: space-between;
    
    margin: 0 auto;
    max-width: 1200px;
    min-width: 375px;
    .logo{
        font-weight: bold;
        text-transform: uppercase;
        font-size: 18px;
        padding: 1em;
        display: inline-flex;
        max-width: 155px;
    }
    
}
</style>