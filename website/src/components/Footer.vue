<template>
    <footer>
        <ul>
            <li id="orders" class="shortcut" @click="shortcutClicked('/orders')">
                <font-awesome-icon class="shortcut-icon" :icon="['fas','list']" /><p>ORDERS</p>
            </li>
            <li id="buy" class="shortcut" @click="shortcutClicked('/buy')">
                <font-awesome-icon class="shortcut-icon" :icon="['fas','utensils']" /><p>BUY</p>
            </li>
            <li id="sell" class="shortcut" @click="shortcutClicked('/sell')">
                <font-awesome-icon class="shortcut-icon" :icon="['fas','money-bill-wave']" /><p>SELL</p>
            </li>
            <li id="cart" class="shortcut" @click="shortcutClicked('/cart')">
                <font-awesome-icon class="shortcut-icon" :icon="['fas','shopping-cart']" /><p>CART</p>
            </li>
        </ul>
    </footer>
</template>

<script>
export default {
    methods: {
        shortcutClicked: function(route){
            if(route === this.$router.history.current.path){
                return;
            }
            const shortcuts = document.querySelectorAll(".shortcut");
            shortcuts.forEach(shortcut => shortcut.classList.remove('current'));

            const id = route.substring(1);
            const shortcut = document.querySelector("#" + id);
            shortcut.classList.add('current');
            this.$router.push(route);
        }
    }
}
</script>

<style lang="scss">
@import "../assets/styles/config.scss";
    footer{
        background-color: $primary-color;
        min-height: 10vh;
        position: fixed;
        bottom: 0;
        min-width: 100vw;
        ul {
            display: flex;
            width: 100vw;
            justify-content: space-around;
            .shortcut{
                &.current{
                    background-color: $secondary-color;
                }
                &:hover{
                    background-color: $secondary-color;
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
                border: 1px solid $secondary-color;
                .shortcut-icon{
                    font-size: 24px;
                    margin-bottom: 5px;
                    padding: auto auto 1.5em;
                }
            }
            
        }
    }
</style>