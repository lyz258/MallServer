var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');

var ejs = require('ejs')

var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');
var goodsRouter = require('./routes/goods');

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views')); // 设置模板引擎存放文件夹
app.engine('.html', ejs.__express); // 设置模板引擎后缀
app.set('view engine', 'html'); // 设置视图引擎使用html(默认使用jade)

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));


// 未登陆拦截
app.use(function(req, res, next) {
  if (req.cookies.userId) {
    next()
  } else {
    if (req.originalUrl === '/users/login' 
      || req.originalUrl === '/users/logout' 
      || req.originalUrl === '/users/signIn' 
      || req.path === '/goods/getCartList' 
      || req.path === '/goods/getGoodsList') {
      next()
    } else {
      res.json({
        status: "noLogin",
        msg: "当前未登陆,请登陆后重试",
        result: {}
      })
    }
  }
});

app.use('/', indexRouter);
app.use('/users', usersRouter);
app.use('/goods', goodsRouter);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});


module.exports = app;
