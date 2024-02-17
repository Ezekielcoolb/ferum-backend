const mongoose = require('mongoose');

const paymentSchema = new mongoose.Schema({
    reference: String,
    transaction: String,
    firstName: String,
    surname: String,
    gender: String,
    presentClass: String,
    classOfInterest: String,
    dayOfBoarding: String,
    parentEmailAddress: String,
    parentPhoneNumber: String,
});
const Payment = mongoose.model('Payment', paymentSchema);

module.exports = Payment;