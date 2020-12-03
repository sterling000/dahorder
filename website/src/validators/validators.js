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

const validApartment = (value) => {
  const regex = new RegExp(/([A-Z][0-9][0-9]-[A-Z][0-9][0-9])/i);
  return regex.test(value);
};

const dateInFuture = (value) => {
    const now = new Date();
    const date = new Date(value);
    return date > now;
}

export { validPhone, validApartment, dateInFuture };
