<template>
    <div class="add-product">
        <h1>New Product</h1>
        <form @submit="submit" method="POST">
            <ul>
                <li>
                    <label for="name">Name</label>
                    <input
                        v-model="name"
                        name="name"
                        @blur="$v.name.$touch()"
                    />
                    <p v-if="$v.name.$dirty && $v.name.$invalid">{{ nameErrors }}</p>
                </li>
                <li>
                    <label for="price">Price</label>
                    <input
                        v-model="price"
                        name="price"
                        @blur="$v.price.$touch()"
                    />
                    <p v-if="$v.price.$dirty && $v.price.$invalid">{{ priceErrors }}</p>
                </li>
                <li>
                    <label for="quantity">Quantity</label>
                    <input
                        v-model="quantity"
                        name="quantity"
                        @blur="$v.quantity.$touch()"
                    />
                    <p v-if="$v.quantity.$dirty && $v.quantity.$invalid">{{ quantityErrors }}</p>
                </li>
                <li>
                    <label for="description">Description</label>
                    <input
                        id="description"
                        v-model="description"
                        name="description"
                        @blur="$v.description.$touch()"
                    />
                    <p v-if="$v.description.$dirty && $v.description.$invalid">{{ descriptionErrors }}</p>
                </li>
                <li>
                    <label for="thumbnail">Thumbnail
                        <div class="custom-file-upload" v-if="this.thumbnail === ''"><font-awesome-icon :icon="['fas', 'file-upload']"/><p>Upload</p></div>
                        <canvas id='resultCanvas1'/>
                    </label>

                    <input
                        id="thumbnail"
                        type="file"
                        name="thumbnail"
                        @change="thumbnailChanged"
                        @blur="$v.thumbnail.$touch()"
                    />
                    <p v-if="$v.thumbnail.$dirty && $v.thumbnail.$invalid">{{ thumbnailErrors }}</p>
                </li>
                <li>
                    <label for="date">Date Available</label>
                    <input
                        v-model="date"
                        name="date"
                        @blur="$v.date.$touch()"
                    />
                    <p v-if="$v.date.$dirty && $v.date.$invalid">{{ dateErrors }}</p>
                </li>
                <li>
                    <label for="delivery">Pick Up / Delivery</label>
                    <select
                        id="delivery"
                        v-model="delivery"
                        name="delivery"
                        @change="$v.delivery.$touch()"
                        @blur="$v.delivery.$touch()"
                    >
                        <option value="Pick Up" selected>Pick Up</option>
                        <option value="Delivery">Delivery</option>
                    </select>

                    <p v-if="$v.delivery.$dirty && $v.delivery.$invalid">{{ deliveryErrors }}</p>
                </li>
            </ul>

            <input id="submit" type="submit" value="ADD" :disabled="$v.$invalid"/>
        </form>
    </div>
</template>

<script>
import axios from 'axios';
axios.defaults.headers.post['Content-Type'] = 'application/json';

import { required, minLength } from 'vuelidate/lib/validators';

import MegaPixImage from '../utils/MegaPixImage';

export default {
    data(){
        return {
            name: '',
            description: '',
            condo: '',
            thumbnail: ''
        }
    },
    methods:{
        submit: function(e) {
            e.preventDefault();
            this.$v.$touch();
            if(this.$v.$anyError){
                return;
            }
            const params = {
                'name': this.name,
                'description': this.description,
                'condo': this.condo,
                'thumbnail': this.thumbnail
            }
            
            axios.post('https://jsonplaceholder.typicode.com/photos/1', // todo: move this to configuration
            params)
            .then((res) => {
                if(res.status === 404)
                {
                    console.log('That email/password combination does not match our records.');
                    this.errorMessages = 'That email/password combination does not match our records.';
                } else {
                    this.error = '';
                    console.log('Success!' , res.data.token);
                }
            })
            .catch((error) => {
                console.log('Oh No! An Error!', error);
            })
            .finally(() => {
                // console.log('Do this always... or else...');
            });
        },
        thumbnailChanged: function(e){
            this.thumbnail = e.target.files[0];

            const mpImg = new MegaPixImage(this.thumbnail);

            // Render resized image into canvas element.
            const resCanvas1 = document.getElementById('resultCanvas1');
            
            resCanvas1.classList.add('show');
            mpImg.render(resCanvas1, { maxWidth: 325, maxHeight: 180 });
        }
    },
    validations: {
        name: { required },
        description: {required, minLength: minLength(8)},
        condo: { required },
        thumbnail: { required }
    },
    computed: {
        nameErrors() {
            const errors = [];
            if(!this.$v.name.$dirty && !this.$v.name.$dirty) return errors;
            !this.$v.name.required && errors.push('Name is required.');
            return errors;
        },
        descriptionErrors() {
            const errors = [];
            if(!this.$v.description.$dirty) return errors;
            !this.$v.description.required && errors.push('Description is required.');
            !this.$v.description.minLength && errors.push('Description must be at least 8 characters long.');
            return errors;
        },
        condoErrors() {
            const errors = [];
            if(!this.$v.condo.$dirty && !this.$v.condo.$dirty) return errors;
            !this.$v.condo.required && errors.push('Condo is required.');
            return errors;
        },
        thumbnailErrors() {
            const errors = [];
            if(!this.$v.thumbnail.$dirty && !this.$v.thumbnail.$dirty) return errors;
            !this.$v.thumbnail.required && errors.push('Thumbnail is required.');
            return errors;
        }
    }
}
</script>

<style lang="scss">
@import "../assets/styles/config.scss";
.add-shop{
    padding: 5em 1em;
    ul{
        li{
            margin: 1em 0;
            label{
                display: inline-block;
                width: 350px;
                margin: 0 0 0.5em;
                font-weight: 600;
                .custom-file-upload {
                    
                    margin: 0.25em 0.5em 0 0;
                    height: 3em;
                    box-shadow: 0 4px 8px 0 rgba(0, 0, 0, 0.2), 0 6px 20px 0 rgba(0, 0, 0, 0.19);
                    border-radius: 5%;
                    border: solid 1px $primary-color;
                    cursor: pointer;
                    text-align: center;
                    font-size: 48px;
                    padding: 0.5em 0;
                    p{
                        font-size: 24px;
                        font-weight: 600;
                    }
                    font-awesome-icon{
                        font-weight: 600;
                    }
                    
                }
                canvas{
                    display: none;
                    &.show{
                        display: block;
                    }
                }
            }
            input{
                display: block;
                width: 100%;
                height: 3em;
                box-shadow: 0 4px 8px 0 rgba(0, 0, 0, 0.2), 0 6px 20px 0 rgba(0, 0, 0, 0.19);
                border-radius: 5%;
                border: solid 1px $primary-color;
                &#description{
                    height: 8em;
                }
                &#thumbnail{
                    text-align: center;
                    display:none;
                }
            }
            
        }
    }

    input#submit{
        display: block;
        background-color: $primary-color;
        color: $secondary-color;
        width: 100%;
        height: 2em;
        box-shadow: 0 4px 8px 0 rgba(0, 0, 0, 0.2), 0 6px 20px 0 rgba(0, 0, 0, 0.19);
        border-radius: 5%;
        border: solid 1px $primary-color;
        font-size: 40px;
        font-weight: 600;
        margin-bottom: 1em;
        padding: 0.5em;
        &:disabled{
            background-color: rgb(143, 143, 143);
            color: #000;
        }
    }
}

</style>-->