<template>
    <div class='home'>
        <div class="category">
            <h2>Recent</h2>
            <div class="carousel">
                <ul>
                    <li v-for='shop in shops.data' :key='shop.pk'>
                        <store v-bind:store="shop" @click="selectStore"></store>
                    </li>
                </ul>
            </div>
        </div>
        <!-- <div class="category">
            <h2>Food</h2>
            <div class="carousel">
                <div class="store"><img src='../assets/images/test.jpg'/><h2>Amy's Home Cooking</h2></div>
                <div class="store"><img src='../assets/images/test.jpg'/><h2>Amy's Home Cooking</h2></div>
            </div>
        </div>
        <div class="category">
            <h2>Services</h2>
            <div class="carousel">
                <div class="store"><img src='../assets/images/test.jpg'/><h2>Amy's Home Cooking</h2></div>
                <div class="store"><img src='../assets/images/test.jpg'/><h2>Amy's Home Cooking</h2></div>
            </div>
        </div>
        <div class="category">
            <h2>Services</h2>
            <div class="carousel">
                <div class="store"><img src='../assets/images/test.jpg'/><h2>Amy's Home Cooking</h2></div>
                <div class="store"><img src='../assets/images/test.jpg'/><h2>Amy's Home Cooking</h2></div>
            </div>
        </div> -->
    </div>
</template>

<script>
import axios from 'axios';
export default {
    data(){
        return {
            shops: []
        }
    },
    mounted() {
        // const stores = document.querySelectorAll('.store');

        // stores.forEach(el => {
        //     el.style.setProperty('--total', 2);
        // })
        this.getShops();
    },
    methods:{
        selectStore:function(e) {
            console.log(e);
            this.$router.push('/store'); // todo: set up routing for /:id
        },
        getShops: async function() {
            this.shops = await axios.get('https://bcaf0sq478.execute-api.us-east-1.amazonaws.com/dev/listshops');
        }
    }
}
</script>

<style lang='scss' scoped>
@import "../assets/styles/config.scss";

.home{
    overflow-y: auto;
    padding: 10vh 0;
}
.category{
    margin: 1em;
    h2{
        color: #000;
    }
}
.carousel{
    padding: 15px 0 0 0;
    overflow: scroll;
    overflow-y: hidden;
    ul{
        display: grid;
        grid-gap: 10px;
        grid-template-columns: 10px;
        grid-auto-flow: column;
        grid-auto-columns: calc(50% - 20 * 2);
        grid-template-rows: minmax(175px, 1fr);
        &::before,::after{
            content: '';
            width: 10px;
        }
    }
    

    
}
    
</style>