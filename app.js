import express from "express";
import expressLayout from "express-ejs-layouts";
import basicRoute from './server/routes/main.js';
import adminRoute from './server/routes/admin.js';
import connectDB from "./server/config/db.js";
import cookieParser from "cookie-parser";
import MongoStore from "connect-mongo";
import session from "express-session";
import methodOverride from "method-override";
import isActiveRoute from "./server/helpers/routeHelpers.js";
const app = express();
const PORT = 5000 || process.env.PORT;

// Connect to DB
connectDB();

// Use methodOverride middleware
app.use(methodOverride('_method'));

app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(cookieParser());

app.use(session({
   secret: 'keyboard cat',
   resave: false,
   saveUninitialized: true,
   store: MongoStore.create({
      mongoUrl: process.env.MONGODB_URI
   })
}));

app.use(express.static('public'));

app.use(expressLayout);
app.set('layout', './layouts/main');
app.set('view engine', 'ejs');

app.locals.isActiveRoute = isActiveRoute;

app.use('/', basicRoute);
app.use('/', adminRoute);

app.listen(PORT, () => {
   console.log(`App listening on port ${PORT}`);
});
