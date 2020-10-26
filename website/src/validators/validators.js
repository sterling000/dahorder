import parsePhoneNumberWithError from 'libphonenumber-js';

const validPhone = (value) => {
    console.log('Validating Phone...', value);
    try{
        const phoneNumber = parsePhoneNumberWithError("+6" + value);
        return phoneNumber.isValid();
    } catch (error) {
        console.log(error);
    }
    return false;
};

export default validPhone;