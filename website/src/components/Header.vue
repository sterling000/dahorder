<template>
    <header>
        <h1 class="logo">Dah Order</h1>
        <!-- <div class="menu-btn" v-on:click='toggleMenu'>
            <div class="btn-line"></div>
            <div class="btn-line"></div>
            <div class="btn-line"></div>
        </div>

        <nav class="menu">
            <ul class="menu-nav">
                <li id="Home" class="nav-item">
                    <router-link to="/" class="nav-link">Home</router-link>
                </li>
            </ul>
        </nav> -->
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

<style lang="scss" scoped>
@import "../assets/styles/config.scss";
@import "../assets/styles/menu.scss";

.text-secondary{
    color: $secondary-color;
}

header {
    .logo{
        font-weight: bold;
        text-transform: uppercase;
    }
    // display: flex;
    // justify-content: space-between;
}
</style>