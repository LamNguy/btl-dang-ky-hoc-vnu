/*
 *  TODO : upload excel,csv file service
 */

const bcrypt = require('bcryptjs')
const user = require('../models/user');
const course = require('../models/course');
const room = require('../models/room');
//const auth = require('../models/authentication');
const read = require('xlsx');
require('../config/mongoose') ;
let async = require('async');
const auth = require('../models/authentication')


const uploadFileService = {};

// todo : import database
uploadFileService.importDB = function(filename){
    return new Promise((resolve, reject) => {

        let database = read.readFile('./uploads/' +filename);

        async.each(database.SheetNames, sheet=>{
            let db = read.utils.sheet_to_json(database.Sheets[sheet]);
            switch ( sheet ) {

                case 'user' : {
                    user.insertMany(db,function (err) {
                        if (err) console.log(err);
                        else console.log('user imported !')
                    });
                    break ;
                }

                case 'course':  {
                    course.insertMany(db,function (err) {
                        if (err) console.log(err);
                        else console.log('course imported !')
                    });
                    break ;
                }

                case 'room' : {
                    room.insertMany(db,function (err) {
                        if (err) console.log(err);
                        else console.log('room imported !')
                    });
                    break ;
                }
                default:    reject({message: "wrong file imported",
                              success: false});
            }
        });

        resolve({message: "import completed",
                      success: true});
    })
};

// todo : import list of students who are qualified
uploadFileService.updateStudentQualified = function(filename){
    return new  Promise((resolve, reject) => {
        let database = read.readFile('./uploads/'+ filename);

        async.each(database.SheetNames,sheet=>{

            let db = read.utils.sheet_to_json(database.Sheets[sheet]);
            let splits =  sheet.split(" ");
            console.log(splits);
            course.findOne({id:splits[0]}).then(response=>{
                if (!response)
                  reject({message: "imported failed",
                    success: false})
                async.each(db,e=>{
                    user.findOneAndUpdate({id: e.id}, {
                        $push: {
                            subject: {
                                idCourse: response._id,
                                status: splits[1]
                            }
                        }
                    }, {new: true,}, function (err, result) {
                        if (err) reject({message: "imported failed",
                                      success: false});
                      /*  if (!result) reject({message: "imported failed",
                                      success: false});*/

                        resolve({message: "update completed",
                                      success: true});

                    })
                })
            })
              .catch(err => {
                reject({message: "imported failed",
                              success: false});
              })
        });
    });
};

// todo : import list of students who are not qualified
uploadFileService.updateStudentUnQualified = function(filename){
    return new  Promise((resolve, reject) => {
        let database = read.readFile('./uploads/'+ filename);

        async.each(database.SheetNames,sheet=>{
            let db = read.utils.sheet_to_json(database.Sheets[sheet]);
            let splits =  sheet.split(" ");
            //console.log(splits);

            course.findOne({id:splits[0]}).then(response=>{
                async.each(db,e=>{
                    console.log(e);
                    user.findOneAndUpdate({id: e.id,"subject.idCourse":response._id}, {
                        $set: {

                            "subject.$.status": splits[1]
                        }
                    }, {new: true}, function (err, result) {
                        if (err) reject(err);

                        resolve({message: "update completed",
                                      success: true});

                    })
                });
            })
              .catch(err => {
                reject({message: "imported failed",
                              success: false});
              })
        });

    })
};


uploadFileService.updateAuth = (filename) => {
  return new Promise((resolve, reject) => {

        let database = read.readFile('./uploads/'+ filename);
        // get list of sheet name [ user, course , room ]
        let data = read.utils.sheet_to_json(database.Sheets['auth']);

        for (var i = 0; i < data.length; i++){
          data[i].password = bcrypt.hashSync(data[i].password.toString(), 8);
        }

        auth.insertMany(data,function (err) {
          if (err){
            reject({message: "imported failed",
                        success: false});
          } else console.log('auth imported !')
          resolve({message: "update completed",
                        success: true});
        })



  })
}
module.exports = uploadFileService;
