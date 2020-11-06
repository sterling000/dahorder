<template>
    <div class="login">
        <form @submit="signin" method="POST">
            <ul>
                <li>
                    <label for="email">Email:</label>
                    <input 
                        v-model="email" 
                        placeholder="john.doe@email.com" 
                        name="email"
                        @blur="$v.email.$touch()"
                    />
                    <p v-if="$v.email.$dirty && $v.email.$invalid">{{ emailErrors }}</p>
                </li>
                <li>
                    <label for="password">Password:</label>
                    <input 
                        v-model="password" 
                        type="password" 
                        name="password" 
                        placeholder="Password"
                        @blur="$v.password.$touch()"
                    />
                    <p v-if="$v.password.$dirty && $v.password.$invalid">{{ passwordErrors }}</p>
                </li>
            </ul>
            
            <input id="submit" type="submit" value="Sign in" :disabled="$v.$invalid"/>
            <button @click.stop.prevent="register()">Register</button>
            <a href="#" class="forgot-password">Forgot Password?</a>
        </form>
        <p v-if="this.errors.length > 0" class="error">{{ errors }}</p>
    </div>
</template>

<script>
import axios from 'axios';
import { required, email } from 'vuelidate/lib/validators';
import { mapState } from 'vuex';
axios.defaults.headers.post['Content-Type'] = 'application/json';
export default {
    data(){
        return {
            email: '',
            password: '',
            errors: ''
        }
    },
    methods:{
        signin: function(e) {
            e.preventDefault();
            this.$v.$touch();
            if(this.$v.$anyError){
                return;
            }
            const params = {
                'email': this.email,
                'password': this.password
            }
            
            axios.post('https://7g2ixxqv2k.execute-api.us-east-1.amazonaws.com/dev/v1/user/login', // todo: move the url to config
            params)
            .then((res) => {
                if(res.status === 404)
                {
                    console.log('That email/password combination does not match our records.');
                    this.errorMessages = 'That email/password combination does not match our records.';
                } else {
                    this.error = '';
                    console.log('Success!' , res.data.token);
                    this.$store.commit('account/login', res.data.token);
                    this.$router.push('/');
                }
            })
            .catch((error) => {
                console.log('Oh No! An Error!', error);
            })
            .finally(() => {
                // console.log('Do this always... or else...');
            });
        },
        register: function() {
            console.log('Register clicked');
            this.$router.push('/register');
        }
    },
    validations: {
        email: { required, email },
        password: {required}
    },
    computed: {
        emailErrors() {
            const errors = [];
            if(!this.$v.email.$dirty && !this.$v.password.$dirty) return errors;
            !this.$v.email.required && errors.push('Email is required.');
            !this.$v.email.email && errors.push('Email is not valid.');
            return errors;
        },
        passwordErrors() {
            const errors = [];
            if(!this.$v.password.$dirty) return errors;
            !this.$v.password.required && errors.push('Password is required.');
            return errors;
        },
        ...mapState('account', ['token'])
    }
}
</script>

<style lang="scss" scoped>
@import "../assets/styles/config.scss";
.login {
    form{
        li{
            margin: 1em 0;
        }
        padding: 5em 3em;
        label{
            width: 275px;
            margin: 0 0 0.5em;
            font-weight: 600;
            display: block;
        }
        input{
            width: 275px;
            height: 3em;
            box-shadow: 0 4px 8px 0 rgba(0, 0, 0, 0.2), 0 6px 20px 0 rgba(0, 0, 0, 0.19);
            border-radius: 5%;
            border: none;
            &#submit{
                font-size: 36px;
                font-weight: 600;
                border: none;
            }
        }
        button {
            width: 275px;
            height: 3em;
            box-shadow: 0 4px 8px 0 rgba(0, 0, 0, 0.2), 0 6px 20px 0 rgba(0, 0, 0, 0.19);
            border-radius: 5%;
            border: none;
            margin: 1em 0;
        }
        .error{
            color: #f00;
        }
    }
    .forgot-password{
        display: block;
        justify-content: space-around;
    }
    .logo{
        font-weight: bold;
        text-transform: uppercase;
    }
    
}
</style>