var express = require('express');
var router = express.Router();

let UsersModel = require('../models/users')

/* GET users listing. */
router.get('/', function(req, res, next) {
  res.send('respond with a resource');
});

// 登陆
router.post('/login', (req, res, next) => {
  const param = {
    userName: req.body.userName,
    userPwd: req.body.userPwd
  }
  UsersModel.findOne(param, (err, doc) => {
    if (err) {
      res.json({
        status: 'error',
        msg: err.message
      })
    } else {
      if (doc) {
        res.cookie("userId", doc.userId, {
          path: '/', // cookie存放位置: 服务器根目录
          maxAge: 1000 * 60 * 60 // 有效时间
          // req.session.user = doc
        })
        res.cookie("userName", doc.userName, {
          path: '/', // cookie存放位置: 服务器根目录
          maxAge: 1000 * 60 * 60 // 有效时间
          // req.session.user = doc
        })
        res.json({
          status: 'success',
          msg: '',
          result: {
            userName: doc.userName
          }
        })
      } else {
        UsersModel.findOne({
          userName: req.body.userName
        }, (userNameErr, userNameDoc) => {
          if (userNameErr) {
            res.json({
              status: 'error',
              msg: userNameErr.message
            })
          } else {
            if (userNameDoc) {
              res.json({
                status: 'error',
                msg: '用户密码错误',
                result: {}
              })
            } else {
              res.json({
                status: 'error',
                msg: '用户名不存在',
                result: {}
              })
            }
          }
        })
      }
    }
  })
});

// 登出
router.post('/logOut', (req, res, next) => {
  res.cookie('userId', '', {
    path: '/',
    maxAge: -1
  })
  res.cookie('userName', '', {
    path: '/',
    maxAge: -1
  })
  res.json({
    status: 'success',
    msg: '登出成功！',
    result: {}
  })
});

// 注册
router.post('/signIn', (req, res, next) => {
  UsersModel.findOne({
    userName: req.body.userName,
  }, (usersErr, usersDoc) => {
    if (usersErr) {
      res.json({
        status: 'error',
        msg: usersErr.message
      })
    } else {
      if (usersDoc) {
        res.json({
          status: 'exist',
          msg: '该用户名已存在',
          result: ''
        })
      } else {
        let newUserId = '1' + Math.ceil(Math.random()*100000)      
        UsersModel.findOne({
          userId: newUserId
        }, (newUserErr, newUserDoc) => {
          if (newUserErr) {
            res.json({
              status: 'error',
              msg: newUserErr.message,
              result: ''
            })
          } else {
            if (newUserErr) {
              newUserId = '1' + Math.ceil(Math.random()*100000)
            }
            const newUserMsg = {
              "userId": newUserId,
              "userName": req.body.userName,
              "userPwd": req.body.userPwd,
              "userTel": req.body.userTel
            }
            let newUser = new UsersModel(newUserMsg)
            newUser.save((addUserErr, addUserDoc) => {
              if (addUserErr) {
                res.json({
                  status: 'error',
                  msg: addUserErr.message
                })
              } else {
                res.json({
                  status: 'success',
                  msg: '注册成功',
                  result: ''
                })
              }
            })
          }
        })



        // let newUser = new UsersModel({
        //   "userId": '1000086',
        //   "userName": req.body.userName,
        //   "userPwd": req.body.userPwd,
        //   "userTel": req.body.userTel
        // })
        // newUser.save((addUserErr, addUserDoc) => {
        //   if (addUserErr) {
        //     res.json({
        //       status: 'error',
        //       msg: addUserErr.message
        //     })
        //   } else {
        //     res.json({
        //       status: 'success',
        //       msg: '注册成功',
        //       result: ''
        //     })
        //   }
        // })
      }
    }
  })
});


module.exports = router;
