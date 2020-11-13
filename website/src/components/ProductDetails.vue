<template>
  <div class="product">
      
      <div class="wrapper" v-show="!edit">
          <div class="hero" ref="thumbnail">
          <h2 class="name">{{details.name}}</h2>
      </div>
      <div class="description"><p>{{details.description}}</p></div>
      <ul>
          <li>
              <h2>Price</h2>
              <p>{{details.price}} RM</p>
          </li>
          <li>
              <h2>Quantity</h2>
              <p>{{details.quantity}}</p>
          </li>
          <li>
              <h2>Date Available</h2>

              <p>{{details.available}}</p>
          </li>
          <li>
              <h2>Delivery</h2>
              <div class="can-toggle">
                <input type="checkbox" @click="log" id="delivery" v-model="details.delivery">
                <label for="delivery">
                    <div class="can-toggle__switch" data-checked="Delivery" data-unchecked="Pickup"></div>
                </label>
              </div>
          </li>
          <li>
              <button class="edit" v-show="!this.edit" @click="toggleEdit">Edit</button>
              
          </li>
      </ul>
      </div>
      <form action="submit" v-show="edit" class="editForm">
           <ul>
                <li>
                    <label for="name">Name</label>
                    <input
                        v-model="details.name"
                        name="name"
                        @blur="$v.name.$touch()"
                    />
                    <p v-if="$v.name.$dirty && $v.name.$invalid">{{ nameErrors }}</p>
                </li>
                <li class="price">
                    <div class="flex-wrapper">
                        <label for="price">Price</label>
                        <input
                            v-model="details.price"
                            name="price"
                            class="price"
                            @blur="$v.price.$touch()"
                        />RM
                    </div>
                    <p class="error" v-if="$v.price.$dirty && $v.price.$invalid">{{ priceErrors }}</p>
                </li>
                <li class="quantity">
                    <div class="wrapper">
                        <label for="quantity">Quantity</label>
                        <input
                            v-model="details.quantity"
                            name="quantity"
                            class="quantity"
                            @blur="$v.quantity.$touch()"
                        />
                    </div>
                    <p v-if="$v.quantity.$dirty && $v.quantity.$invalid">{{ quantityErrors }}</p>
                </li><!-- Add option for On-Demand -->
                <li>
                    <label for="description">Description</label>
                    <textarea
                        id="description"
                        v-model="details.description"
                        name="description"
                        @blur="$v.description.$touch()"
                        placeholder="Enter a description here..."
                    />
                    <p v-if="$v.description.$dirty && $v.description.$invalid">{{ descriptionErrors }}</p>
                </li>
                <li>
                    <image-uploader 
                        validation="$v.thumbnail" 
                        @render="thumbnailRendered" 
                        ref="imageUploader"
                    />
                    <p v-if="$v.thumbnail.$dirty && $v.thumbnail.$invalid">{{ thumbnailErrors }}</p>
                </li>
                <li>
                    <label for="date">Date Available</label>
                    <input
                        v-model="details.date"
                        type="date"
                        name="date"
                        @blur="$v.date.$touch()"
                    />
                    <p v-if="$v.date.$dirty && $v.date.$invalid">{{ dateErrors }}</p>
                </li>
                <!-- Preset Delivery Time -->
                <li>
                    <label for="delivery">Pick Up / Delivery</label>
                    <select
                        id="delivery"
                        v-model="details.delivery"
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
            <button class="save" v-show="this.edit" @click="save">Save</button>
      </form>
  </div>
</template>

<script>
import axios from 'axios';
import { required, minLength } from 'vuelidate/lib/validators';

export default {
    data(){
        return {
            details: {},
            edit: false,
            thumbnail: ''
        }
    },
    methods:{
        thumbnailRendered: function(e) {
            this.thumbnail = e;
        },
        log(){
            console.log('clicked');
        },
        toggleEdit(){
            this.edit = !this.edit;
        },
        save: function(e) {
            e.preventDefault();
            e.submitter.disabled = true;
            this.$v.$touch();
            if(this.$v.$anyError){
                return;
            }

            axios.get('https://kin9q3i70f.execute-api.us-east-1.amazonaws.com/dev/v1/image/url')
            .then((res) =>{
                this.$refs.imageUploader.uploadImage(res.data.uploadURL);
                const params = {
                    name: this.details.name,
                    description: this.details.description,
                    thumbnail: `https://imagesq323dsad.s3.amazonaws.com/${res.data.photoFilename}`,
                    price: this.details.price,
                    quantity: this.details.quantity,
                    available: this.details.date,
                    delivery: this.details.delivery,
                    shop: this.$route.params.id
                }
                const options = {
                    headers: {'Authorization': `Bearer ${this.$store.state.account.token}`}
                }
                axios.post('https://f126sn9q00.execute-api.us-east-1.amazonaws.com/dev/product', params, options)
                .then(() => {
                    this.$router.push(`/products/${this.shop}`);
                })
                .catch((error) => {
                    console.log('Oh No! An Error!', error);
                })
                .finally(() => {

                });
            })
            .catch((error) => {
                console.log('Oh No! An Error!', error);
            })
            .finally(() => {
                // console.log('Do this always... or else...');
            });
        },
        getProduct: async function() {
            console.log('fetching product...');
            try{
                const options = {
                    headers: {'Authorization': `Bearer ${this.$store.state.account.token}`},
                    params: {
                        id: this.$route.params.id
                    }
                };
                const res = await axios.get('https://f126sn9q00.execute-api.us-east-1.amazonaws.com/dev/product', options);
                console.log(res);
                this.details = res.data[0];
                this.$refs["thumbnail"].style.setProperty('--thumbnail', `url(${this.details.thumbnail})`);
            } catch(error){
                console.log(error);
            } finally{
                console.log('getProduct finally...');
            }
        }
    },
    validations: {
        name: { required },
        description: {required, minLength: minLength(8)},
        thumbnail: { required },
        price: { required }, // todo: needs validation
        quantity: { required }, // todo: needs validation
        date: { required }, // todo: needs validation
        delivery: { required } // todo: needs validation
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
        priceErrors() {
            const errors = [];
            if(!this.$v.price.$dirty && !this.$v.price.$dirty) return errors;
            !this.$v.price.required && errors.push('Price is required.');
            return errors;
        },
        quantityErrors() {
            const errors = [];
            if(!this.$v.quantity.$dirty && !this.$v.quantity.$dirty) return errors;
            !this.$v.quantity.required && errors.push('Quantity is required.');
            return errors;
        },
        dateErrors() {
            const errors = [];
            if(!this.$v.date.$dirty && !this.$v.date.$dirty) return errors;
            !this.$v.date.required && errors.push('Date is required.');
            return errors;
        },
        thumbnailErrors() {
            const errors = [];
            if(!this.$v.thumbnail.$dirty && !this.$v.thumbnail.$dirty) return errors;
            !this.$v.thumbnail.required && errors.push('Thumbnail is required.');
            return errors;
        }
    },
    mounted(){
        if(this.$store.state.account.token === null){
            this.$router.push('/login');
        }
        this.getProduct();
    }
}
</script>

<style lang='scss' scoped>
@import '../assets/styles/config.scss';
@import '../assets/styles/toggle.scss';

.product{
    .wrapper{
        .hero{
            padding: 4em 0;
            background: var(--thumbnail);
            background-size: cover;
            min-width: 325px;
            min-height: 25vh;
            .name{
                display: inline-flex;
                min-width: 0;
                min-height: 0;
                color: #fff;
                margin: 1em;
                background-color: rgba($color-primary-4, 0.4);
                border-radius: 5%;
                border: none;
                line-height: 0.8;
            }
        }
        .description{
            margin: 1em;
        }

        ul{
            margin: 1em;
        }

        .edit{
            margin: 1em 0;
            min-width: 340px;
            min-height: 2em;
            background-color: $color-primary-1;
            border-radius: 5%;
            border: solid 1px $color-primary-0;
            font-size: 24px;
            color: $color-primary-0;
        }
        .save{
            margin: 1em 0;
            min-width: 340px;
            min-height: 2em;
            background-color: $color-primary-0;
            border-radius: 5%;
            border: solid 1px $color-primary-4;
            color: $color-primary-1;
            font-size: 24px;
        }
    }
    .editForm{
        padding: 5em 1em;
        ul{
            li{
                margin: 1em 0;
                .flex-wrapper{
                    display: flex;
                }
                label{
                    display: inline-block;
                    width: 350px;
                    margin: 0 0 0.5em;
                    font-weight: 600;
                    
                    .price, .quantity{
                        width: 175px;
                    }
                    
                }
            }
            input{
                display: block;
                width: 100%;
                height: 3em;
                box-shadow: 0 4px 8px 0 rgba(0, 0, 0, 0.2), 0 6px 20px 0 rgba(0, 0, 0, 0.19);
                border-radius: 5%;
                border: solid 1px $color-primary-0;
                text-indent: 1em;

                .price, .quantity{
                    width: 50%;
                }
            }
            .price, .quantity{
                text-align: right;
                font-size: 24px;
                height: 1em;
                width: 50%;
                margin-right: 0.5em;
                .error{
                    display: inline-block;
                }
                
            }
            
            textarea{
                resize: none;
                height: 8em;
                padding: 0.5em;
                text-align: left;
                margin-top: 0;
                width: 100%;
                box-shadow: 0 4px 8px 0 rgba(0, 0, 0, 0.2), 0 6px 20px 0 rgba(0, 0, 0, 0.19);
                border-radius: 5%;
                border: solid 1px $color-primary-0;
                overflow: auto;
            }
        }
    }

    input#submit{
        display: block;
        background-color: $color-primary-0;
        color: $color-primary-3;
        width: 100%;
        height: 2em;
        box-shadow: 0 4px 8px 0 rgba(0, 0, 0, 0.2), 0 6px 20px 0 rgba(0, 0, 0, 0.19);
        border-radius: 5%;
        border: solid 1px $color-primary-0;
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

</style>