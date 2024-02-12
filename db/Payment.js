const mongoose = require('mongoose');

const paymentSchema = new mongoose.Schema({
    reference: String,
    transaction: String,
});
const Payment = mongoose.model('Payment', paymentSchema);

module.exports = Payment;