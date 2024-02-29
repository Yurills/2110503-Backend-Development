const express = require('express');
const dotenv = require('dotenv');
const cookieParser = require('cookie-parser');
const mongoSanitize = require('express-mongo-sanitize');
const helmet = require('helmet');
const {xss} = require('express-xss-sanitizer');
const rateLimit = require('express-rate-limit');
const hpp = require('hpp');
const cors = require('cors');

const connectDB = require('./config/db');

const swaggerJsDoc = require('swagger-jsdoc');
const swaggerUI = require('swagger-ui-express');


//load env variable
dotenv.config({path:"./config/config.env"});


//connect to DB
connectDB();

const app = express();

//body parser
app.use(express.json());
//sanitize data
app.use(mongoSanitize());
//security headers
app.use(helmet());
//prevent xss attacks
app.use(xss());
//rate limiting
const limiter = rateLimit({
    windowsMs: 10*60*1000, // 10 mins
    max: 100
});
app.use(limiter);
//prevent http param pollutions
app.use(hpp());
//enable CORS
app.use(cors());
//cookie parser
app.use(cookieParser());

const swaggerOptions = {
    swaggerDefinition: {
        openapi: '3.0.0',
        info: {
            title: 'Library API',
            version: '1.0.0',
            description: 'A simple Express VacQ API'
        },
        servers: [
            {
                url: 'http://localhost:5000/api/v1'
            }
        ],
    },
    apis: ['./routes/*.js'],
};
const swaggerDocs = swaggerJsDoc(swaggerOptions);
app.use('/api-docs', swaggerUI.serve, swaggerUI.setup(swaggerDocs));

//routes
const hospitals = require('./routes/hospitals');
const auth = require('./routes/auth');
const appointments = require('./routes/appointments');

app.use('/api/v1/hospitals', hospitals);
app.use('/api/v1/auth', auth);
app.use('/api/v1/appointments', appointments)

const PORT = process.env.PORT || 5000;
const server = app.listen(PORT, console.log(`process is running at ${process.env.NODE_ENV} mode at port ${PORT}`));

//Handle unhandled promise rejections
process.on('unhandledRejection', (err, promise) => {
    console.log(`Error: ${err.message}`);
    server.close( () => {process.exit(1)});
});
