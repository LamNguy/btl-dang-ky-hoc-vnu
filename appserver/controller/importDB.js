const urlExcel = './user.xlsx' ;
const user = require('../models/user');
const course = require('../models/course');
const room = require('../models/room');
let   read = require('xlsx')
let uri =  require('../config/database')

let mongoose = require('mongoose') ;

mongoose.connect( uri.url , {useNewUrlParser: true} ,{ useFindAndModify: false }) ;

let database = read.readFile(urlExcel);

// get list of sheet name [ user, course , room ]
let data = database.SheetNames;

// insert database
for ( let index in data ){
    // console.log(index);
    let db = read.utils.sheet_to_json(database.Sheets[data[index]]);

    switch (data[index] ) {

        case 'user' : {
            user.insertMany(db,function (err) {
                if (err) console.log(err)
                else console.log('user imported !')
            })

            break ;
        }

        case 'course':  {
            course.insertMany(db,function (err) {
                if (err) console.log(err)
                else console.log('course imported !')
            })
            break ;
        }

        case 'room' : {
            room.insertMany(db,function (err) {
                if (err) console.log(err)
                else console.log('room imported !')
            })
            break ;
        }

        default : console.log(index + ' not imported');
    }
}

// do not care
/*
for  ( let User in  db){
    let _id = db[User].id ;
    console.log(_id);
    user.findOne({id:  _id} , function (err, data) {
         if ( err ) console.log('error')
         else {
            console.log(data)  ;
         }
    })

} */











