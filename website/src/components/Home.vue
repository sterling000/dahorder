<template>
    <div class='home'>
        <div class="category">
            <h2>Recent</h2>
            <div class="carousel">
                <div class="store"><img src='../assets/images/test.jpg'/><h2>Amy's Home Cooking</h2></div>
                <div class="store"><img src='../assets/images/test.jpg'/><h2>Amy's Home Cooking</h2></div>
            </div>
        </div>
        <div class="category">
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
        </div>
    </div>
</template>

<script>
export default {
    mounted() {
        const stores = document.querySelectorAll('.store');

        stores.forEach(el => {
            el.style.setProperty('--total', 2);
        })
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
}
.carousel{
    padding: 15px 0 0 0;
    overflow: scroll;
    overflow-y: hidden;
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

    .store{
        padding: 0.5em 0;
        box-shadow: 0 4px 8px 0 rgba(0, 0, 0, 0.2), 0 6px 20px 0 rgba(0, 0, 0, 0.19);
        width: 260px;
        height: 167px;
        border-radius: 5%;
        background-color: $primary-color;
        h2 {
            font-size: 18px;
        }
    }
}
    
</style>