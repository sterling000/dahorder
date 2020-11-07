<template>
    <div class="add-shop">
        <h1>New Shop</h1>
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
                    <label for="thumbnail" id="thumbnailLabel"><p class="thumbnail">Photo</p>
                        <div class="wrapper">
                            <div class="camera" v-if="this.thumbnail === ''"><font-awesome-icon :icon="['fas', 'camera']"/><p>Camera</p></div>
                            <p class="or" v-if="this.thumbnail === ''">Or</p>
                            <div class="custom-file-upload" v-if="this.thumbnail === ''"><font-awesome-icon :icon="['fas', 'file-upload']"/><p>Upload</p></div>
                        </div>
                        <canvas id='resultCanvas1'/>
                    </label>

                    <input 
                        id="camera" 
                        name="camera" 
                        type="file" 
                        accept="image/*" 
                        capture="camera" 
                        @change="thumbnailChanged"
                        @blur="$v.thumbnail.$touch()"
                    />
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
                    <label for="description">Description</label>
                    <textarea
                        id="description"
                        v-model="description"
                        name="description"
                        @blur="$v.description.$touch()"
                        placeholder="Enter a description here..."
                    />
                    <p v-if="$v.description.$dirty && $v.description.$invalid">{{ descriptionErrors }}</p>
                </li>
                <li>
                    <label for="condo">Condo</label>
                    <input
                        v-model="condo"
                        name="condo"
                        @blur="$v.condo.$touch()"
                    />
                    <p v-if="$v.condo.$dirty && $v.condo.$invalid">{{ condoErrors }}</p>
                </li>
            </ul>

            <input id="submit" type="submit" value="ADD" :disabled="$v.$invalid"/>
        </form>
    </div>
</template>

<script>
import axios from 'axios';

import { required, minLength } from 'vuelidate/lib/validators';

import MegaPixImage from '../utils/MegaPixImage';

export default {
    data(){
        return {
            name: '',
            description: '',
            condo: '',
            thumbnail: '',
            croppedImage: {},
            presignedURL: '',
            photoFilename: ''
        }
    },
    methods:{
        submit: function(e) {
            e.preventDefault();
            // e.submitter.disabled = true;
            this.$v.$touch();
            if(this.$v.$anyError){
                return;
            }

            let presignedURL = '';
            axios.get('https://kin9q3i70f.execute-api.us-east-1.amazonaws.com/dev/v1/image/url')
            .then((res) =>{
                presignedURL = res.data.uploadURL;
                this.uploadImage(presignedURL);
                const params = {
                    name: this.name,
                    description: this.description,
                    thumbnail: `https://imagesq323dsad.s3.amazonaws.com/${res.data.photoFilename}`,
                    condo: this.condo
                }
                console.log('Adding Shop: ', params);
                const options = {
                    headers: {'Authorization': `Bearer ${this.$store.state.account.token}`}
                }
                axios.post('https://bcaf0sq478.execute-api.us-east-1.amazonaws.com/dev/shop', params, options)
                .then((res) => {
                    console.log(res);
                    this.$router.push('/shops');
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
        uploadImage: function(presignedURL) {
            console.log('Uploading: ', this.croppedImage);
            let binary = atob(this.croppedImage.split(',')[1]);

            let array = [];
            for(var i = 0; i < binary.length; i++){
                array.push(binary.charCodeAt(i));
            }
            let blobData = new Blob([new Uint8Array(array)], {type: 'image/jpeg'});
            console.log('Uploading to: ', presignedURL);
            console.log("blobData", blobData);
            var options = { headers: { 'Content-Type': 'image/jpeg', 'x-amz-acl': 'public-read' } };
            axios.put(presignedURL, blobData, options)
            .then((res) => {
                console.log('Upload Response... ', res);
            })
            .catch((error) => {
                console.log('Upload Error...', error);
            })
            .finally(() => {
                console.log('Upload Complete');
            })

            // const params = {
            //     'name': this.name,
            //     'description': this.description,
            //     'condo': this.condo,
            //     'thumbnail': this.thumbnail
            // }
            
            // axios.post('', // todo: move this to configuration
            // params)
            // .then((res) => {
            //     if(res.status === 404)
            //     {
            //         console.log('That email/password combination does not match our records.');
            //         this.errorMessages = 'That email/password combination does not match our records.';
            //     } else {
            //         this.error = '';
            //         console.log('Success!' , res.data.token);
            //     }
            // })
            // .catch((error) => {
            //     console.log('Oh No! An Error!', error);
            // })
            // .finally(() => {
            //     // console.log('Do this always... or else...');
            // });
        },
        thumbnailChanged: function(e){
            this.thumbnail = e.target.files[0];

            const MAX_IMAGE_SIZE = 30000000;
            let reader = new FileReader()
            reader.onload = (e) => {
                if (!e.target.result.includes('data:image/jpeg')) {
                return alert('Wrong file type - JPG only.')
                }
                if (e.target.result.length > MAX_IMAGE_SIZE) {
                return alert('Image is loo large - 1Mb maximum')
                }
                this.croppedImage = e.target.result
            }
            reader.readAsDataURL(this.thumbnail);

            const mpImg = new MegaPixImage(this.thumbnail);

            // Render resized image into canvas element.
            const resCanvas1 = document.getElementById('resultCanvas1');
            
            resCanvas1.classList.add('show');
            mpImg.render(resCanvas1, { maxWidth: 325, maxHeight: 180 });
            // const dataURL = resCanvas1.toDataURL('image/jpeg');
            // console.log(dataURL);
            // this.croppedImage = dataURL;
            // console.log('croppedImage', this.croppedImage);
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
    },
    mounted(){
        if(this.$store.state.account.token === null){
            this.$router.push('/login');
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
                
                width: 350px;
                margin: 0 0 0.5em;
                font-weight: 600;
                .wrapper{
                    display: flex;
                }
                .or{
                    margin: 5em 1em;
                }
                .custom-file-upload {
                    width: 100px;
                    margin: 0.75em 0.5em 0 0;
                    height: 2em;
                    box-shadow: 0 4px 8px 0 rgba(0, 0, 0, 0.2), 0 6px 20px 0 rgba(0, 0, 0, 0.19);
                    border-radius: 5%;
                    border: solid 1px $color-primary-0;
                    cursor: pointer;
                    text-align: center;
                    font-size: 48px;
                    padding: 0.2em 0;
                    p{
                        font-size: 18px;
                        font-weight: 600;
                    }
                    font-awesome-icon{
                        font-weight: 600;
                    }
                    
                }
                .camera {
                    width: 175px;
                    margin: 0.25em 0 0 0;
                    height: 3em;
                    box-shadow: 0 4px 8px 0 rgba(0, 0, 0, 0.2), 0 6px 20px 0 rgba(0, 0, 0, 0.19);
                    border-radius: 5%;
                    border: solid 1px $color-primary-0;
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
                border: solid 1px $color-primary-0;
                
                &#thumbnail{
                    text-align: center;
                    display:none;
                }
                &#camera{
                    text-align: center;
                    display:none;
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