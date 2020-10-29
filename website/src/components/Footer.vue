<template>
    <footer>
        <ul>
            <li class="shortcut">
                <font-awesome-icon class="shortcut-icon" :icon="['fas','list']" /><p>ORDERS</p>
            </li>
            <li class="shortcut">
                <font-awesome-icon class="shortcut-icon" :icon="['fas','utensils']" /><p>BUY</p>
            </li>
            <li class="shortcut">
                <font-awesome-icon class="shortcut-icon" :icon="['fas','money-bill-wave']" /><p>SELL</p>
            </li>
            <li class="shortcut">
                <font-awesome-icon class="shortcut-icon" :icon="['fas','shopping-cart']" /><p>CART</p>
            </li>
        </ul>
    </footer>
</template>

<script>
export default {
    
}
</script>

<style lang="scss">
@import "../assets/styles/config.scss";
    footer{
        background-color: $primary-color;
        min-height: 10vh;
        position: absolute;
        bottom: 0;
        min-width: 100vw;
        ul {
            display: flex;
            width: 100vw;
            justify-content: space-around;
            .shortcut{
                &:hover{
                    background-color: $secondary-color;
                }
                cursor: pointer;
                width: 22vw; 
                height: 9vh;
                text-align: center;
                display: block;
                padding: 1.5em 0;
                font-size: 12px;
                font-weight: 600;
                border: 1px solid $secondary-color;
                .shortcut-icon{
                    font-size: 24px;
                    margin-bottom: 5px;
                }
            }
            
        }
    }
</style>