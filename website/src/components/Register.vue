 <template>
    <div class='register'>
        <h1>Sign Up</h1>
        <form @submit="register" method="POST">
            <label for="name">Name:</label>
            <input 
                v-model.trim="name" 
                placeholder="John Doe" 
                name="name" 
                @blur="$v.name.$touch()"
            />
            <p v-if="nameErrors.length > 0">{{nameErrors}}</p>
            <label for="condo">Condominium / Apartment Name:</label>
            <input 
                v-model.trim="condo"
                name="condo" 
                placeholder="Petaling Jaya" 
                @blur="$v.condo.$touch()"
            />
            <label for="apartment">Apartment:</label>
            <input 
                v-model.trim="apartment" 
                placeholder="999" 
                name="apartment" 
            />
            <label for="phone">Phone:</label>
            <input 
                v-model.trim="phone" 
                placeholder="16045551234" 
                name="phone" 
                @blur="$v.phone.$touch()"
            />
            <label for="email">Email:</label>
            <input 
                v-model.trim="email" 
                placeholder="john.doe@email.com" 
                name="email" 
                @blur="$v.email.$touch()"
            />
            <label for="password">Password (Must be 8 or more characters):</label>
            <input 
                v-model.trim="password"
                name="password" 
                type="password" 
                @blur="$v.password.$touch()"
            />
            <label for="confirm">Confirm Password:</label>
            <input 
                v-model.trim="confirm" 
                placeholder="" 
                name="confirm" 
                type="password" 
                @blur="$v.confirm.$touch()"
            />
            <label for="role">Select a Role:</label>
            <select 
                id="role" 
                name="role" 
                v-model="role" 
                @change="$v.role.$touch()" 
                @blur="$v.role.$touch()"
            >
                <option value="buyer" selected>Buyer</option>
                <option value="seller">Seller</option>
                <option value="both">Both</option>
            </select>

            <input type="submit" value="Sign Up"/>
        </form>
        <p class="error">{{ errorMessages }}</p>
    </div>
</template>

<script>
import axios from 'axios';
axios.defaults.headers.post['Content-Type'] = 'application/json';
import { required, minLength,  email, sameAs, numeric } from 'vuelidate/lib/validators';

export default {
    data(){
        return {
            'name': '',
            'condo': '',
            'apartment': '',
            'phone': '',
            'email': '',
            'password': '',
            'confirm': '',
            'role': 'both',
            'error': ''
        }
    },
    methods: {
        register: function(e){
            
            const params = {
                'email': this.email,
                'password': this.password,
                'name': this.name,
                'condo': this.condo,
                'apartment': this.apartment,
                'phone': this.phone,
                'role': this.role
            }
            
            axios.post('https://7g2ixxqv2k.execute-api.us-east-1.amazonaws.com/dev/v1/user',
            params)
            .then((res) => {
                if(res.status === 202)
                {
                    console.log('Another user exists with that email.');
                    this.error = 'Another user exists with that email.';
                } else {
                    this.error = '';
                    console.log('Success! User Created!', res);
                    this.$router.push('/login');
                }
            })
            .catch((error) => {
                console.log('Oh No! An Error!', error);
            })
            .finally(() => {
                // console.log('Do this always... or else...');
            });
            e.preventDefault();
        }
    },
    validations: {
        name: { required, between: (3, 20) },
        email: { required, email },
        password: { required, minLength: minLength(8) },
        confirm: { sameAsPassword: sameAs('password')},
        condo: { required },
        phone: { required, numeric },
        role: { required }
    },
    computed: {
        nameErrors() {
            const errors = [];
            if(!this.$v.name.$dirty) return errors;
            !this.$v.name.required && errors.push('Name is required.');
            !this.$v.name.between && errors.push('Name must be between 3 and 20 characters long.');
            return errors;
        },
        emailErrors() {
            const errors = [];
            if(!this.$v.email.$dirty) return errors;
            !this.$v.email.required && errors.push('Email is required.');
            !this.$v.email.email && errors.push('Email is not valid.');
            return errors;
        },
        passwordErrors() {
            const errors = [];
            if(!this.$v.password.$dirty) return errors;
            !this.$v.password.required && errors.push('Password is required.');
            !this.$v.password.minLength && errors.push('Password must be at least 8 characters long.');
            return errors;
        },
        confirmErrors() {
            const errors = [];
            if(!this.$v.confirm.$dirty) return errors;
            !this.$v.confirm.sameAsPassword && errors.push('Password does not match.');
            return errors;
        },
        condoErrors() {
            const errors = [];
            if(!this.$v.condo.$dirty) return errors;
            !this.$v.condo.required && errors.push('Condo is required.');
            return errors;
        },
        phoneErrors() {
            const errors = [];
            if(!this.$v.phone.$dirty) return errors;
            !this.$v.phone.required && errors.push('Phone Number is required.');
            !this.$v.phone.numeric && errors.push('Phone Number must be numeric.');
            
            return errors;
        },
        roleErrors() {
            const errors = [];
            if(!this.$v.role.$dirty) return errors;
            !this.$v.role.required && errors.push('Role is required.');
            return errors;
        },
        errorMessages() {
            return this.nameErrors + this.emailErrors + this.passwordErrors + this.confirmErrors + this.condoErrors + this.phoneErrors + this.roleErrors;
        }
    }
}
</script>

<style lang="scss" scoped>
.register{
    max-width: 1200px;
    top: 50%;
    left: 50%;
    margin: 0 auto;
    transform: translate(-50%, -50%);
    overflow: hidden;
    position: fixed;
    form{
        margin: auto 0;
        label{
            display: inline-block;
            width: 250px;
            margin: 0 0 0.5em;
        }
        input, select{
            display: block;
            width: 250px;
            margin: 0 0 1em;
        }
        .error{
            color: #f00;
        }
    }
    .forgot-password{
        display: block;
        justify-content: space-around;
    }
    h1{
        text-align: center;
        font-weight: bold;
        text-transform: uppercase;
        margin: 0 0 0.5em;
    }
    .error{
        color: #f00;
    }
}

</style>