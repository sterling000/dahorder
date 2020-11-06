<template>
    <footer>
        <ul>
            <li v-show="signedIn" id="orders" class="shortcut" @click="shortcut('/orders')">
                <font-awesome-icon class="shortcut-icon" :icon="['fas','list']" /><p>ORDERS</p>
            </li>
            <li v-show="signedIn" id="buy" class="shortcut current" @click="shortcut('/buy')">
                <font-awesome-icon class="shortcut-icon" :icon="['fas','utensils']" /><p>BUY</p>
            </li>
            <li v-show="signedIn" id="sell" class="shortcut" @click="shortcut('/sell')">
                <font-awesome-icon class="shortcut-icon" :icon="['fas','money-bill-wave']" /><p>SELL</p>
            </li>
            <li v-show="signedIn" id="cart" class="shortcut" @click="shortcut('/cart')">
                <font-awesome-icon class="shortcut-icon" :icon="['fas','shopping-cart']" /><p>CART</p>
            </li>

            <li v-show="!signedIn" id="login" class="cta" @click="signIn">
                <div>Sign In</div>
            </li>
            <li v-show="!signedIn" id="register" class="cta" @click="register">
                <div>Register</div>
            </li>
        </ul>
        
    </footer>
</template>

<script>
export default {
    methods: {
        shortcut: function(route){
            if(route === this.$router.history.current.path){
                return;
            }
            const shortcuts = document.querySelectorAll(".shortcut");
            shortcuts.forEach(shortcut => shortcut.classList.remove('current'));

            const id = route.substring(1);
            const shortcut = document.querySelector("#" + id);
            shortcut.classList.add('current');
            this.$router.push(route);
        },
        signIn(){
            this.$router.push('/login');
        },
        register(){
            this.$router.push('/register');
        }
    },
    computed:{
        signedIn(){
            return this.$store.state.account.token !== null; // check the token is valid next time?
        }
    }
}
</script>

<style lang="scss">
@import "../assets/styles/config.scss";
    footer{
        background-color: $color-primary-0;
        min-height: 10vh;
        position: fixed;
        bottom: 0;
        min-width: 100vw;
        justify-content: space;
        ul {
            display: flex;
            width: 100vw;
            justify-content: space-around;
            color: set-text-color($color-primary-0);
            .shortcut{
                &.current{
                    background-color: $color-primary-3;
                }
                &:hover{
                    background-color: $color-primary-3;
                }
                cursor: pointer;
                width: 22vw; 
                height: 12vh;
                text-align: center;
                display: block;
                margin: 5px 0 0;
                padding: 1.5em 0;
                font-size: 12px;
                font-weight: 600;
                border: 1px solid $color-primary-3;
                .shortcut-icon{
                    font-size: 24px;
                    margin-bottom: 5px;
                    padding: auto auto 1.5em;
                }
            }
            .cta{
                text-align: center;
                
                padding: 1em 3em;
                border: 1px solid $color-primary-3;
                font-weight: 600;
                font-size: 18px;
            }
        }
        
        #signIn{
            color: set-text-color($color-primary-0);
            cursor: pointer;
            display: flex;
        }
        
    }
</style>

