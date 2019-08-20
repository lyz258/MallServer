var express = require('express');
var router = express.Router();

var mongoose = require('mongoose');
var GoodsModule = require('../models/goods')

//连接MongoDB数据库
mongoose.connect('mongodb://127.0.0.1:27017/dumall')

// 检查数据库是否连接成功
mongoose.connection.on("connected", _ => {
  console.log('success>>>>>>>>>>>>>>', 'MongoDB connected success!')
})

// 数据库连接出错
mongoose.connection.on("error", _ => {
  console.log('error>>>>>>>>>>>>>>', 'MongoDB connected error!')
  console.log('error>>>>>>>>>>>>>>', 'MongoDB connected error22!')
})

// 断开连接
mongoose.connection.on("disconnected", _ => {
  console.log('disconnected>>>>>>>>>>>>>>', 'MongoDB connected disconnected!')
})

// 查询商品数据
router.get("/getGoodsList", (req, res, next) => {
  let page = parseInt(req.param("page"));
  let pageSize = parseInt(req.param("pageSize"));
  let skip = (page - 1) * pageSize;

  let sort = req.param("sort");

  let priceLevel = req.param("priceLevel");
  let priceGt = '';
  let priceLte = '';
  let params = {}
  if (priceLevel !== '1') {
    switch (priceLevel) {
      case '2':
        priceGt = 0;
        priceLte = 100;
        break
      case '3':
        priceGt = 100;
        priceLte = 500;
        break
      case '4':
        priceGt = 500;
        priceLte = 1000;
        break
      case '5':
        priceGt = 1000;
        priceLte = 5000;
        break
    }
    params = {
      salePrice: {
        $gt: priceGt,
        $lte: priceLte
      }
    }
  }
  let totalCount = 0
  // 查询总条数
  let allGoodsModelResult = GoodsModule.find(params);
  allGoodsModelResult.exec((err, doc) => {
    if (err) {
      res.json({
        status: "error",
        msg: err.message
      })
    } else {
      totalCount =  doc.length
    }
  })

  // 查询当前数据
  let goodsModelResult = GoodsModule.find(params).skip(skip).limit(pageSize);
  goodsModelResult.sort({"salePrice": sort});
  setTimeout(() => {
    goodsModelResult.exec((err, doc) => {
      if (err) {
        res.json({
          status: "error",
          msg: err.message
        })
      } else {
        res.json({
          status: "success",
          msg: "",
          result: {
            total: totalCount,
            // total: doc.length,
            list: doc
          }
        })
      }
    })
  }, 1500)
})

// 加入到购物车
router.post("/addCart", (req, res, next) => {
  setTimeout(() => {
    const userId = req.cookies.userId;
    const productId = req.body.productId;
    // 获取用户模型,通过模型执行API保存数据
    const userModel = require('../models/users');
  
    userModel.findOne({userId: userId}, (userErr, userDoc) => {
      if (userErr) {
        res.json({
          status: "error",
          msg: userErr.message
        })
      } else {
        if (userDoc) {
          let goodsItem = "";
          userDoc.cartList.forEach((item, index) => {
            if (item.productId === productId) {
              goodsItem = item ;
              item.productNum ++ ;
            }
          })
          if (goodsItem) {
            userDoc.save((saveErr, saveDoc) => {
              if (saveErr) {
                res.json({
                  status: "error",
                  msg: saveErr.message
                })
              } else {
                res.json({
                  status: "success",
                  msg: "",
                  result: "add success"
                })
              }
            });
          } else {
            GoodsModule.findOne({productId: productId}, (goodsErr, goodsDoc) => {
              if (goodsErr) {
                res.json({
                  status: "error",
                  msg: goodsErr.message
                })
              } else {
                if (goodsDoc) {
                  let goodsObj = JSON.parse(JSON.stringify(goodsDoc)) 
                  goodsObj.productNum = '1';
                  goodsObj.checked = '1';
                  userDoc.cartList.push(goodsObj);
                  userDoc.save((saveErr, saveDoc) => {
                    if (saveErr) {
                      res.json({
                        status: "error",
                        msg: saveErr.message
                      })
                    } else {
                      res.json({
                        status: "success",
                        msg: "",
                        result: "add success"
                      })
                    }
                  });
                }
              }
            })
          }
        }
      }
    })
  }, 1500)
})


// 根据用户id获取购物车数据
router.get('/getCartList', (req, res, next) => {
  setTimeout(_ => {
    const userId = req.cookies.userId;
    if (!userId) {
      res.json({
        status: "noLogin",
        msg: "当前未登陆,请登陆后重试",
        result: {}
      })
    } else {
      const userModel = require('../models/users');
      userModel.findOne({userId: userId}, (userErr, userDoc) => {
        if (userErr) {
          res.json({
            status: "error",
            msg: userErr.message,
            result: ''
          })
        } else {
          res.json({
            status: "success",
            msg: '',
            result: userDoc.cartList
          })
        }
      })
    }
  }, 1500)
});

// 购物车修改商品数量
router.post('/changeCartNum', (req, res, next) => {
  const userId = req.cookies.userId;
  const productId = req.body.productId;
  // 获取用户模型,通过模型执行API保存数据
  const userModel = require('../models/users');
  userModel.findOne({userId: userId}, (userErr, userDoc) => {
    if (userErr) {
      res.json({
        status: "error",
        msg: userErr.message
      })
    } else {
      if (userDoc) {
        userDoc.cartList.forEach((item, index) => {
          if (item.productId === productId) {
            item.productNum = req.body.productNum ;
          }
        })
        userDoc.save((saveErr, saveDoc) => {
          if (saveErr) {
            res.json({
              status: "error",
              msg: saveErr.message
            })
          } else {
            res.json({
              status: "success",
              msg: "",
              result: "add success"
            })
          }
        });
      }
    }
  })
});

// 删除购物车物品
router.post('/removeGoods', (req, res, next) => {
  setTimeout(_ => {
    const userId = req.cookies.userId;
    const userModel = require('../models/users');
    userModel.findOne({userId: userId}, (userErr, userDoc) => {
      if (userErr) {
        res.json({
          status: "error",
          msg: userErr.message,
          result:''
        })
      } else {
        if (!userDoc) {
          res.json({
            status: "notFind",
            msg: '',
            result:''
          })
        } else {
          const productId = req.body.productId;
          for (let index = 0; index < userDoc.cartList.length; index++) {
            if (productId === userDoc.cartList[index].productId) {
              userDoc.cartList.splice(index, 1);
              break;
            }
          }
          userDoc.save((removeErr, removeDoc) => {
            if (removeErr) {
              res.json({
                status: "error",
                msg: removeErr.message,
                result: ''
              })
            } else {
              res.json({
                status: "success",
                msg: '删除成功',
                result: '删除成功'
              })
            }
          })
        }
      }
    })
  },1500)
});

// 改变物品选中状态
router.post('/changeChecked', (req, res, next) => {
  const userId = req.cookies.userId;
  const userModel = require('../models/users');
  userModel.findOne({userId: userId}, (userErr, userDoc) => {
    if (userErr) {
      res.json({
        status: "error",
        msg: userErr.message,
        result:''
      })
    } else {
      if (!userDoc) {
        res.json({
          status: "notFind",
          msg: '',
          result:''
        })
      } else {
        for (let index = 0; index < userDoc.cartList.length; index++) {
          if (req.body.checkedAll === '0' || req.body.checkedAll === '1') {
            userDoc.cartList[index].checked = req.body.checkedAll
          } else {
            if (req.body.productId === userDoc.cartList[index].productId) {
              userDoc.cartList[index].checked = req.body.checked;
              break
            }
          }
        }
        userDoc.save((saveErr,  saveDoc) => {
          if (saveErr) {
            res.json({
              status: "error",
              msg: saveErr.message,
              result: ''
            })
          } else {
            res.json({
              status: "success",
              msg: '操作成功',
              result: '操作成功'
            })
          }
        }) 
      }
    }
  })
});
module.exports = router