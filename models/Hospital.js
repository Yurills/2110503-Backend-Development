const mongoose = require('mongoose');

const HospitalSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, "please add a name"],
        unique: true,
        trim: true,
        maxlength: [50, "name cannot be more than 50 characters"]
    },
    address: {
        type: String,
        required: [true, "please add an address"]
    },
    district: {
        type: String,
        required: [true, "please add a district"]
    },
    province: {
        type: String,
        required: [true, "please add a province"]
    },
    postalcode: {
        type: String,
        required: [true, "please add a postal code"],
        maxlegnth: [5, "postal code cannot be more than 5 digits"]
    },
    tel: {
        type: String
    },
    region: {
        type: String,
        required: [true, "please add a region"]
    },
    
},
{
    toJSON: {virtuals: true},
    toObject: {virtuals: true}
});

//cascade delete
HospitalSchema.pre('deleteOne', {document: true, query: false}, async function(next) {
    console.log(`Appointments being remove from hospital ${this._id}`);
    await this.model('Appointment').deleteMany({hospital: this._id});
    next();
})
//reverse populate with virtuals
HospitalSchema.virtual('appointments', {
    ref: 'Appointment',
    localField: '_id',
    foreignField: 'hospital',
    justOne: false
});


module.exports = mongoose.model('Hospital', HospitalSchema);