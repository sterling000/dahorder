import parsePhoneNumberWithError from "libphonenumber-js";

const validPhone = (value) => {
  try {
    const phoneNumber = parsePhoneNumberWithError("+6" + value);
    if (phoneNumber === undefined) {
      return false;
    }
    return phoneNumber.isValid();
  } catch (error) {
    console.log(error);
  }
  return false;
};

export default validPhone;
