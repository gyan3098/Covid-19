const express = require("express")
const app = express()
require("./mongoose")
const port = process.env.PORT || 3000
const bodyParser = require('body-parser');
const auth = require('./middleware/auth')
var cookieParser = require('cookie-parser')
const bcrypt = require("bcryptjs")
const multer = require('multer')
const Profile = require("./model/user")
const Patient = require("./model/patient")
const State = require("./model/states")
const MonthCase =require("./model/monthwise")
// const Hash_search = require("./model/searches")
const path = require("path")

// console.log(path.join(__dirname+'/index.html'))
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser()) 
app.use(express.json())


app.get('/', (req,res) => {
    res.sendFile(path.join(__dirname+'/index.html'));

})

app.get('/signup',auth,async (req, res) => {

    // console.log(req.cookies['Auth'])
    if (req.not_found) {
        console.log("signup req not found")
        res.sendFile(path.join(__dirname + '/register.html'))
    }
    else {
        res.sendFile(path.join(__dirname+'/index.html'));
    }
    // res.sendFile(path.join(__dirname+'/index.html'));
    // res.redirect('/');

})


app.post('/signup',async (req,res)=> {
    console.log(req.body)

    
    if(req.body.password === req.body.re_pass){

        const password = await bcrypt.hash(req.body.password,8)
        const profile = new Profile({
            name: req.body.fname+" "+ req.body.lname,
            email: req.body.email,
            password: password
   
        })

        try{
            await profile.save()
            console.log("Successfully signed up");
            res.sendFile(path.join(__dirname+'/login.html'));
        }catch(e) {
            // res.status(400).send(e)
            console.log(e)
            res.redirect('/signup')
        }
           
        
    }else {
        res.send("Your passwords don't match");
    }
     
 })

app.get('/login',auth,async (req, res) => {

    // console.log(req.cookies['Auth'])
    if (req.not_found) {
        console.log("login req not found")
        res.sendFile(path.join(__dirname + '/login.html'));
    }
    else{
        res.sendFile(path.join(__dirname+'/index.html'));
    }
    
    // res.redirect('/');

})



app.post('/login', async (req,res) => {
    console.log("Signing in..")
    console.log(req.body)
    try {
        const profile = await Profile.findByCredentials(req.body.email, req.body.pass)
        console.log("Successfully signed in");
        //const token = await profile.generateAuthToken()
        const token = await profile.generateAuthToken()
        
        //res.send({ user: profile.getPublicProfile(), token})
        var options = {
            root: path.join(__dirname, '/'),
            dotfiles: 'deny',
            headers: {
                'x-timestamp': Date.now(),
                'x-sent': true,
                'Authorization' : 'Bearer ' + token
            }
            }
        
            var fileName = 'index.html'
            res.cookie('Auth','Bearer '+ token).sendFile(fileName, options, function (err) {
            if (err) {
                next(err)
            } else {
                console.log('Sent:', fileName)
            }
            })
           
    
    }catch {
        console.log("Sign in failed")
        res.status(401).redirect('/login')
    }
    
})

app.post('/logout' , auth ,async (req,res) => {
    console.log("logout")
    try{
        req.user.tokens = req.user.tokens.filter((token) =>{
            return token.token !== req.token
        })
        await req.user.save()
        res.redirect('/')
        res.end()
    } catch (e) {
        res.status(500).send()
    }
})

app.get('/medical_form',auth, async (req,res) => {

    if (req.not_found) {
        res.sendFile(path.join(__dirname + '/login.html'))
    } else if(await Patient.findOne({owner: req.user._id})) {
        res.redirect('/');
    }else {
        res.sendFile(path.join(__dirname+'/form.html'));
    }
    
})

app.post('/medical_form',auth, async (req,res)=> {
    console.log(req.body);
    var d = new Date();
    var month = new Array();
    month = ["January","February","March","April","May","June","July","August","September","October","November","December"]
    var n = month[d.getMonth()];
    console.log(n)
    // console.log(typeof(req.body.cur))
        const patient = new Patient({
            cur_problem: req.body.cur ,
            past_problem: req.body.history,
            age: req.body.age,
            address: req.body.addr1+ req.body.addr2,
            state: req.body.state,
            city: req.body.city,
            phoneNumber: req.body.contact,
            corona_positive: req.body.corona_positive,
            sex: req.body.sex,
            owner: req.user._id
   
        })
        try{
            await patient.save()
            if(req.body.corona_positive == 'true'){
                const state = await State.findOne({loc: req.body.state})
                state.confirmed = state.confirmed + 1
                state.new_cases = state.new_cases + 1
                await state.save();
                console.log(state)
                const monthWise = await MonthCase.findOne({month: n})
                monthWise.confirmed = monthWise.confirmed + 1
                monthWise.new_cases = monthWise.new_cases + 1
                await monthWise.save()
                console.log(monthWise)

            }
            console.log("Successfully filled up");
            res.redirect('/')
        }catch(e) {
            // res.status(400).send(e)
            console.log(e)
            res.redirect("/medical_form")
        }
        // res.redirect('/medical_form');
 })



app.get('/profile',auth,async (req,res ) => {
    try{
        const user = await Profile.findById(req.user._id)
        const profile = req.user.getPublicProfile(user);
        res.status(200).send(profile);
    } catch(e) {
        // console.log(e);
        profile = {name: "Anonymous"}
        console.log("not found");
        res.status(404).send(profile)
    }
})


    
// })
app.get('/charts',async(req,res) => {
    res.sendFile(path.join(__dirname+'/charts.html'));
})

app.get('/tables',async(req,res) => {
    res.sendFile(path.join(__dirname+'/tables2.html'));
})

app.get('/states', async(req, res) => {
// , ['confirmed','deaths','recovered','loc','new_cases']
    try {
        const data = await State.find({}, ['confirmed','deaths','recovered','loc','new_cases']);
        // console.log(data)
        const total = await State.aggregate([{
            $group: {
                _id: '',
                "confirmed": { $sum: '$confirmed' },
                "deaths": {$sum: "$deaths"},
                "recovered": {$sum: "$recovered"},
                "new_cases": {$sum: "$new_cases"}
             }
             }, {
                $project: {
                   _id: 0,
                   "totalConfirmed": '$confirmed',
                   "totalDeaths": "$deaths",
                   "totalRecovered": "$recovered",
                   "totalNewCases": "$new_cases"
                }
        }])
        const months = await MonthCase.find({},['month','confirmed']);
        // console.log(months)
        res.send({data,total,months}).status(200)
    } catch(e) {
        res.send("Error occured" +e ).status(500)
    }
    
})

app.post('/states',async (req,res)=> {
    // console.log(req)
    // console.log(req.body)
    var i=0;
    // console.log(Object.keys(data.shareInfo[i]).length)
    console.log(req.body.States.length)
    for(i=0;i<req.body.States.length ; i++){
        console.log(i)
        console.log(req.body.States[i])
        const state = new State({
            confirmed: req.body.States[i].confirmed,
            deaths: req.body.States[i].deaths,
            recovered: req.body.States[i].recovered,
            loc: req.body.States[i].loc,
            new_cases: req.body.States[i].new_cases 

        })

        try{
            await state.save()
            console.log("Successfully added");
            // res.send(req.body).status(200)
            // res.sendFile(path.join(__dirname+'/login.html'));
        }catch(e) {
            // res.status(400).send(e)
            console.log(e)
            // res.sendFile(path.join(__dirname+'/register.html'));
            res.status(500).send("something wrong happens")
        }
    }
    res.send(req.body)
        
})

app.post('/update/states', auth, async (req,res) => {
   
    const updates = Object.keys(req.body)
    const allowedUpdates  = ['confirmed','deaths','recovered','loc','new_cases'];
    const isValidOperation = updates.every((updates) => allowedUpdates(updates))

    if(!isValidOperation) {
        return res.status(400).send( { error: 'Invalid Updates!' })

    }

    try {
        const state = await Sate.findOneAndUpdate({loc : req.body.loc},{name: req.body.name ,age: req.body.age},{runValidators: true,new: true})
        //const profile = await Profile.findOne({username: req.body.username})
        //const 
        updates.forEach((update) => req.user[update] = req.body[update])
        //await profile.save()
        await req.user.save()
        
        res.send(profile)
    }catch(e) {
        res.status(400).send(e)
    }
})

   
app.post('/monthWise',async (req,res)=> {
    // console.log(req)
    // console.log(req.body)
    var i=0;
    // console.log(Object.keys(data.shareInfo[i]).length)
    console.log(req.body.monthWise.length)
    for(i=0;i<req.body.monthWise.length ; i++){
        console.log(i)
        console.log(req.body.monthWise[i])
        const monthCase = new MonthCase({
            month: req.body.monthWise[i].month,
            confirmed: req.body.monthWise[i].confirmed,
            death: req.body.monthWise[i].death,
            recovered: req.body.monthWise[i].recovered,
            new_cases: req.body.monthWise[i].new_cases,
            new_deaths: req.body.monthWise[i].new_deaths,
            new_recovered: req.body.monthWise[i].new_recovered 

        })

        try{
            await monthCase.save()
            console.log("Successfully added");
            // res.status(200).send(req.body)
            // res.sendFile(path.join(__dirname+'/login.html'));
        }catch(e) {
            // res.status(400).send(e)
            console.log(e)
            // res.sendFile(path.join(__dirname+'/register.html'));
            res.status(500).send("something wrong happens")
        }
    }
    res.send(req.body)
        
})


// app.use('/start',express.static(__dirname + '/start'));
// app.use('/',express.static(__dirname + '/start/style1.css'));
// app.use('/login',express.static(__dirname + '/login'));
app.use('/img',express.static(__dirname + '/img'));
// app.use('/static',express.static(__dirname+ '/static'));
app.use('/node_modules',express.static(__dirname+ '/node_modules'))
// app.use('/rough',express.static(__dirname + '/rough'))
// app.use('/login',express.static(__dirname + '/login/css/style.css'));
// app.use('/login',express.static(__dirname + '/login/fonts/material-icon/css/material-design-iconic-font.min.css'));
// app.use('/login',express.static(__dirname + '/login/images'));
app.use('/js',express.static(__dirname + '/js'));
app.use('/login',express.static(__dirname + '/login/scss'));
app.use('/css',express.static(__dirname + '/css/sb-admin-2.css'));
app.use('/vendor',express.static(__dirname + '/vendor'))
app.use('/css',express.static(path.join(__dirname,'css')))
app.use('/scss',express.static(path.join(__dirname,'scss')))
console.log("dirname : " + __dirname)
app.listen(port,() => {
    console.log("Server is running on "+port)
})

// app.get('/users/me',auth, (req,res) =>{
// // res.send("hello");
//     res.sendFile(path.join(__dirname+'/start/profile.html'));
//     //res.send(req.user)
// })
 
// app.post('/users/logoutAll' , auth ,async (req,res) => {
//     try{
//         req.user.tokens = []
//         await req.user.save()
//         res.redirect('http://localhost:3000/')
//         res.end()
//     } catch (e) {
//         res.status(500).send()
//     }
// })

// app.use(bodyParser.json())

// app.get('/users/me/search',auth,async (req,res) => {
//     //console.log(req)

//     var query = req.query
    
//     console.log(query)
//     item = query.quer
//     console.log(item)
//     var hsh = /[\*a-zA-Z0-9]*/;
//     var resi = item.match(hsh); 
//     console.log(resi)
//     if(resi[0][0] === '*')
//     {
//         resi = '#'+resi[0].slice(1,)
//         console.log(resi)
//         try {
//             const hash = await Hashtag.find({hashtag : resi})
//             if(!hash){
//                 return res.status(404).send()
//             }
//             const hash_search = await  Hash_search.findOne({hashtag: resi});
//             console.log(hash_search)
//             if(!hash_search){
//                 var new_hashtag = new Hash_search({
//                     hashtag: resi,
//                     number: 1
//                 })
//                 await new_hashtag.save();
//              } 
//              else {
//                 hash_search.number = hash_search.number+1;
//                 await hash_search.save()
//             }
//             var sendRequest = {}
//             var arr= []
//             for(i=0; i<hash.length;i++){
                
                
//                 //sendRequest = {...sendRequest,...images}
//                 arr.push(hash[i].imageId)
//                 //var gyan = res.write(images);

//                 //console.log(gyan)


//             }
//             var images = await Image.find({
//                 _id:{
//                     $in: arr
//                 }});
//             //const images = await Image.findById(hash.imageId)
//             //res.send(hash)
//             //console.log(sendRequest)
//             res.send({images})
//             console.log(images)
//             //console.log(hash)
//             console.log(hash.length)
//         }catch(e) {
//             res.status(404).send(e)
//             console.log(e)
//         }
//     }
        
        
//     else {
//         // query = query.slice(1,)
//         console.log("profile")
//         try {
//             console.log(resi[0])
//             const profile = await Profile.findOne({username : resi[0]})

//             if(!profile){
//                 return res.send('<script><alert>No user found</alert></script>')
//                // return res.status(404).send()
//             }
//             res.send({'name' : profile.name ,'username' : profile.username,"profile_image":profile.profile_image}) 
//             console.log(profile)
//         }catch (e){
//             res.status(404).send(e)
//         }
        
            
//     }
    
// })
 
// app.get('/profile' ,async (req ,res) => {
//     _id = await Profile.decoder(token);


// })

// app.get('/users/me/query',async (req,res) => {
//     var query = req.query
    
//     console.log(query)
//     //console.log(req.query.id)
//     //console.log("query " + req.body.query)
//     item = query.quer
//     console.log(item)
//     var hsh = /[\*a-zA-Z0-9]*/;
//     var resi = item.match(hsh); 
//     console.log(resi)
//     if(resi[0][0] === '*')
//     {
//         resi = '#'+resi[0].slice(1,)
//         console.log(resi)
//         try {
//             const hash = await Hashtag.find({hashtag : {
//                 '$regex': '^'+resi
//             }})
            
            
            
//             console.log({hash})
//             res.send({hash})
//             //console.log(images)
//             //console.log(hash)
//             console.log(hash.length)
//         }catch(e) {
//             res.status(400).send(e)
//             console.log(e)
//         }
//     }
        
        
//     else {
//         // query = query.slice(1,)
//         console.log("profile")
//         try {
//             console.log(resi[0])
//             const profile = await Profile.find({username: /^t/})

//             if(!profile){
//                 return res.send('<script><alert>No user found</alert></script>')
//                // return res.status(404).send()
//             }
//             res.send({'name' : profile.name ,'username' : profile.username,"profile_image":profile.profile_image}) 
//             console.log(profile)
//         }catch (e){
//             res.status(400).send(e)
//         }
        
            
//     }
    

// app.get('/users/del_image/:id',auth,  async (req, res) => {
//     try{
//         const image = await Image.findOneAndDelete({ _id: req.params.id, owner: req.user._id})
        
//         if(!image) {
//             res.status(404).send()
//         }

//         res.send(image)
//     } catch (e) {
//         res.status(500).send()
//     }
// })

// app.use("/uploads",express.static(__dirname+ "/uploads"))

// var Storage = multer.diskStorage({
//     destination: "./uploads",
//     filename: (req, file, cb) => {
//         cb(null, file.fieldname+ "-"+Date.now() + path.extname(file.originalname))
//     }

// });

// var uploaddp = multer({
//     storage:Storage
// })
// var upload = multer({
//      dest: 'uploads/' 
// })

// app.post('/users/me/image_upload' ,auth, uploaddp.single('image'), async (req,res) =>{
//     console.log("updating profile")
//     console.log(req.body.comment)
//     console.log(req.file)

//     try{
//         //const update = Object.keys(req.body);
//          var success = req.file.filename + " uploaded successfully";
//         // res.render('upload-file', { title: 'Upload File' ,success: success})
//        // var success = req.body.filename + " uploaded successfully"
//         //res.render('upload-file', { title: 'Upload File' ,success: success})
        
//         var image = new Image({
//             imageName: req.file.filename,
//             owner: req.user._id
//         })

//         var imageId = await image.save();
//         var uploads = req.user[uploads];
//         req.user[uploads] = uploads+1;
//         await req.user.save()

//         var reg = req.body.comment.toString();
//         var hashtag = /#[a-zA-Z0-9]*/g;
//         //console.log(reg)
//         var result = reg.match(hashtag);
//         //console.log("result " +result + result.length)
//         var i=0;
//         if(result.length >0){
//             for(i=0;i<result.length;i++){
//                 //console.log(result[i])
//                 var hashes = new Hashtag({
//                     hashtag: result[i],
//                     imageId: imageId._id
//                 })
//                 await hashes.save();
//             }
//         }
        
//         console.log(imageId)
//         res.status(200).sendFile(path.join(__dirname+'/start/image_upload.html'));
//     } catch(e) {
//         console.log(e)
//         res.status().send()
//     }
    
// })

// // Image Uploading
// app.use(upload2())
// app.post('/users/me/avatar', auth, async (req, res) => {
    
//     try {
//             console.log(req.files.name)
//             var file = req.files.filename,

//             filename = file.name.split('.');
//             var newfilename = filename[0] +Date.now().toString()+'.'+filename[1]
//             //console.log(file);
//             console.log(newfilename);
//             file.mv('./uploads/' + newfilename, function(err){
//                 if(err){
//                     console.log("404 error");
//                     res.send("error occured");
//                     throw Error;
    
//                 }})
//                 req.user['profile_image'] = newfilename;
//                 //await profile.save()
//                 await req.user.save()
            
//             res.status(201).redirect('/users/signin')
                
//     } catch (e) {
//         console.log(e)
//         res.send("Something wrong happens")
//     }  
    
// })

// app.post('/users/me/image_upload', auth, async (req, res) => {
//     console.log(req.body)   
//     console.log(req.body.filename) 
//     console.log(req.body.comment) 
//     console.log(req.files.filename)
//     // try {
//     //         req.files = req.body.filename;
//     //         var file = req.files.filename,
            
//     //         filename = file.split('.');
//     //         var newfilename = filename[0] +Date.now().toString()+'.'+filename[1]
//     //         //console.log(file);
//     //         console.log(newfilename);
//     //         file.mv('./uploads/' + newfilename, function(err){
//     //             if(err){
//     //                 console.log("404 error");
//     //                 res.send("error occured");
//     //                 throw Error;
    
//     //             }})
//     //         const images = new Image({
//     //             imageName: newfilename,
//     //             owner: req.user._id
//     //         })
//     //         console.log(images);
//     //         const image = await images.save();
//     //         console.log(image);
//     //         res.status(201).send("Successfully uploaded")
                
//     // } catch (e) {
//     //     console.log(e)
//     //     res.send("Something wrong happens")
//     // }  
    
// })

// app.get("/users/me/file_uploads", auth,function(req,res){
//     res.sendFile(path.join(__dirname+'/start/file_upload.html'));
// })

// app.post("/users/me/file_uploads",auth, function(req, res){
//     if(req.files){
//         var file = req.files.filename,
//         filename = file.name;
//         console.log(file);
//         console.log(filename);
//         file.mv('./uploads/' + filename, function(err){
//             if(err){
//                 console.log("404 error");
//                 res.send("error occured");

//             }else{
//                 res.send("done!.");
//             }
//         })
//     }
// })

// app.get('/users/me/image_download', auth, async (req, res) => {
//     const name = req.query.filename;
//     try {
//         var fileLocation = path.join('./uploads',name);
//         console.log(fileLocation);
//         res.download(fileLocation, name);
//     } catch (e) {
//         res.status(500).send()
//     }
// })

// app.get('/users/me/delete',auth, async (req,res) => {
//     try {
//         // const user = await Profile.findByIdAndDelete( req.user._id)

//         // if(!user) {
//         //     return res.status(404).send()
//         // }
//         await req.user.remove()
//         console.log(req.user)
//         res.sendFile(path.join(__dirname+'/login/index.html'));
//     }catch(e) {
//         res.status().send({error : "User can't be deleted"})
//     }
// })


// const profile = Profile.find().toArray(function(err, result) {
//     if (err) throw err;
//     console.log(result);

// })
// // console.log(profile)
 
// filtering
// GET /pictures?profile=true
// GET /pictures?limit=10&skip=10
// GET /pictures?sortBy=createdAt:asc
// GET /pictures?sortBy=createdAt:desc
// app.get('/pictures', auth, async (req ,res) => {
//     const match = {}
//     const sort = {}
//     if(req.query.completed) {
//         match.completed = req.query.completed === 'true'
//     }


//     if(req.query.sortBy) {
//         const parts = req.query.sortBy.split(':')
//         sort[parts[0]] = parts[1] === 'desc' ? -1 : 1
//     }
//     try {
//         await req.user.populate({
//             path: 'images',
//             match,
//             options: {
//                 limit: parseInt(req.query.limit),
//                 skip: parseInt(req.query.skip),
//                 // sort: {
//                 //     createdAt: -1
//                 // }
//                 sort
//             }
//         }).execPopulate()
//     } catch (e) {
//         res.status(500).send()
//     }
// })

