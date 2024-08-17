const router = require("express").Router();
const User = require("../models/User");
const CryptoJS = require("crypto-js");
const jwt = require("jsonwebtoken");

//Register
router.post("/register", async (req,res)=>{
    const newUser = new User({
        username:req.body.username,
        email:req.body.email,
        password: CryptoJS.AES.encrypt(req.body.password, process.env.SECRET_KEY).toString(),
    });

    try{

    const user = await newUser.save();
    res.status(201).json(user)
    }catch(err){
        res.status(500).json(err);
    }

});

//LOGIN
// router.post("login",async (req,res)=>{
//     try{
//         const user = await User.findOne({email:req.body.email});
//         !user && res.status(401).json("Wrong Password Or Username");

//          const bytes = CryptoJS.AES.decrypt(user.password,process.env.SECRET_KEY);
//          const originalPassword = bytes.toString(CryptoJS.enc.Utf8);

//          originalPassword !== req.body.password && res.status(401).json("Wrong Password");


//          res.status(200).json(user);
//     }catch(err){
//         res.status(500).json(err)
//     }
// })
// 
router.post("/login", async (req, res) => {
    try {
        const user = await User.findOne({ email: req.body.email });
        if (!user) return res.status(401).json("Wrong Password Or Username");

        const bytes = CryptoJS.AES.decrypt(user.password, process.env.SECRET_KEY);
        const originalPassword = bytes.toString(CryptoJS.enc.Utf8);

        if (originalPassword !== req.body.password) return res.status(401).json("Wrong Password");

        // Correct the reference to user._id
        const accessToken = jwt.sign({ id: user._id, isAdmin: user.isAdmin }, process.env.SECRET_KEY, { expiresIn: "5d" });

        // Destructure the user object to remove the password and send other info
        const { password, ...info } = user._doc;

        // Send the user info along with the access token
        res.status(200).json({ ...info, accessToken });
    } catch (err) {
        res.status(500).json(err);
    }
});


module.exports = router;