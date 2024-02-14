const mongoose = require("mongoose");
const plm = require("passport-local-mongoose");

require('dotenv').config()
const dbconnect = process.env.ATLASDB_URL

mongoose.connect(dbconnect)
    .then(() => { console.log("Connected to MongoDB") })
    .catch(err => { console.log(err) });

const userSchema = mongoose.Schema({
    username: {
        type: String,
        unique: true,
        required: [true, "Username is required"]
    },
    password: {
        type: String,
        // required:[true, 'Password is required']
    },
    // contact: {
    //     type: String,
    //     required:true
    // },
    contact: {
        type: String,
        required: true,
        maxlength: [10, 'Contact number cannot exceed 10 characters'],
        validate: {
            validator: function (v) {
                return /^\d+$/.test(v); // Using regular expression to ensure it contains only numbers
            },
        }
    },
    profileimg: {
        type: String,
        default: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcT-Pnt1rnG5_oeghvwAVvVBhcLrR5yZRqLRFw&usqp=CAU"
    },
    socketId: {
        type: String
    }
});

userSchema.plugin(plm);

// Exporting the model with uppercase "User"
module.exports = mongoose.model("User", userSchema);
