const Appointment = require('../models/Appointment');
const Hospital = require('../models/Hospital');

//@desc get all appointment
//@route GET /api/v1/appointments
//@access
exports.getAppointments = async (req,res,next)=> {
    let query
    
    //general user can only see their own appointment
    if (req.user.role !== 'admin') {
        query = Appointment.find({user:req.user.id}).populate({
            path: 'hospital',
            select: 'name province tel'
        });
    }else { //admin can sees all appointment
        if (req.params.hospitalId) {
            console.log(req.params.hospitalId);

            query = Appointment.find({
                hospital: req.params.hospitalId
            }).populate({
                path: 'hospital',
                select: 'name province tel'
            });
        }
        else {
            query = Appointment.find().populate({
                path: 'hospital',
                select: 'name province tel'
            });
        }
    }
    
    try {
        const appointments  = await query;
        
        res.status(200).json({
            success: true,
            count: appointments.length,
            data: appointments
        })
    } catch(err) {
        console.log(err);
        return res.status(500).json({
            success: false,
            message: "cannot find appointment"
    })
    }
};

//@desc get single appointment
//@route GET /api/v1/appointments/:id
//@access Public
exports.getAppointment = async (req,res,next) => {
    try {
        const appointment = await Appointment.findById(req.params.id).populate({
            path: 'hospital',
            select: 'name province tel'
        });

        if (!appointment) {
            res.status(404).json({
                success: false,
                message: `no appointment with the id of ${req.params.id}`
            });
        }

        res.status(200).json({
            success: true,
            data: appointment
        });

    } catch(err) {
        console.log(err);
        return res.status(500).json({
            success: false,
            message: "cannot find appointment"
        });
    }
};

//@desc Add Appointment
//@route POST /api/v1/hospitals/:hospitalId/appointment
//@access Private
exports.addAppointment = async (req,res,next)=> {
    try {
        req.body.hospital = req.params.hospitalId;

        const hospital = await Hospital.findById(req.params.hospitalId);

        if(!hospital) {
            res.status(404).json({
                success: false,
                message: `no hospital with the id of ${req.params.hospitalId}`
            });
        }

        //add userId to req.body
        req.body.user = req.user.id;

        //check for existed appointment
        const existedAppointment = await Appointment.find({user:req.user.id});

        //if the user is not admin, allow atmost 3 appointments
        if (existedAppointment.length >= 3 && req.user.role != 'admin') {
            return res.status(400).json({
                success: false,
                message: `this user with ID ${req.user.id} has already made 3 appointments`
            })
        }

        const appointment = await Appointment.create(req.body);
        
        res.status(200).json({
            success:true,
            data: appointment
        })
    } catch(err) {
        console.log(err);
        return res.status(500).json({
            success: false,
            message: "cannot create appointment"
        });
    }
};

//@desc update appointment
//@route PUT /api/v1/appointments/:id
//@access Private
exports.updateAppointment = async (req,res,next) => {
    try {
        let appointment = await Appointment.findById(req.params.id);
        
        if (!appointment) {
            return res.status(404).json({
                success: false,
                message: `no appointment with the id of ${req.params.id}`
            })
        }
        
        //check if user is appointment owner
        if (appointment.user.toString() !== req.user.id && req.user.role !== 'admin'){
            return res.status(401).json({
                success: false,
                message: `User ${req.user.id} is not authorized to update this appointment`
            })
        }

        appointment = await Appointment.findByIdAndUpdate(req.params.id, req.body, {
            new: true,
            runValidators: true
        });

        res.status(200).json({
            success: true,
            data: appointment
        })
    } catch(err) {
        console.log(err);
        res.status(500).json({
            success: false,
            message: "cannot update appointment"
        });     
    }
}   

//@desc Delete appointment
//@route DELETE /api/v1/appointments/:id
//@access Private
exports.deleteAppointment = async (req,res,next) => {
    try {
        const appointment = await Appointment.findById(req.params.id);
        if (!appointment) {
            return res.status(404).json({
                success: false,
                message: `no appointment with the id of ${req.params.id}`
            });
        }

        //check if user is appointment owner
        if (appointment.user.toString() !== req.user.id && req.user.role !== 'admin'){
            return res.status(401).json({
                success: false,
                message: `User ${req.user.id} is not authorized to delete this appointment`
            })
        }
        await appointment.deleteOne();

        res.status(200).json({
            success: true,
            data: {}
        });
    } catch(err) {
        console.log(err);
        return res.status(500).json({
            success: false,
            message: "cannot delete appointment"
        })
    }
}