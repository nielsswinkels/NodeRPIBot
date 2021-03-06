  /*
  TODO:

  */

  var express = require('express');
  var colors = require('colors');
  var app = express();
  var http = require('http')
  var httpport = 80;
  var gpio = require('rpi-gpio');
  var si = require('systeminformation');
  const exec = require('child_process').exec;

  //GPIO setup
  gpio.setup(7, gpio.DIR_OUT)
  gpio.setup(11, gpio.DIR_OUT)
  gpio.setup(13, gpio.DIR_OUT)
  gpio.setup(15, gpio.DIR_OUT)


  //GPIO functions
  var EnableGPIO = function(gpiopin){
	gpio.output(gpiopin, true)
  }
  var DisableGPIO = function(gpiopin){
	gpio.output(gpiopin, false)
  }
  var TakePicture = function(ifupload){
	  //picture taking code here
	  if (ifupload == true){
		  //upload code goes here
	  } else {
		  //non upload code here
	  }
  };
  var TakeVideo = function(ifupload, duration){
	  //video taking code here
	  if (ifupload == true){
		  //upload code goes here
	  } else {
		  //non upload code here
	  }
  };

  //Sys info functions


  //Logging functions
  var log = {
      error: function(data) {
          var date = new Date();
          console.log('ERROR'.red, data);
      },
      info: function(data) {
          var date = new Date();
          console.log('INFO'.green, data);
      },
      warn: function(data) {
          var date = new Date();
          console.log('WARN'.yellow, data);
      },
      debug: function(data) {
          console.log('DEBUG'.blue, data);
      }
  };

  var serverhttp = http.createServer(app).listen(httpport, function() {
      log.info("Express server listening on port " + httpport);
  });
  serverhttp.listen(80);

  //SOCKET.IO INIT
  var io = require('socket.io')(serverhttp)

  app.use(express.static(__dirname + '/web'));

  app.get('/', function(req, res) {
      log.debug(req.connection.remoteAddress + " GET /")
      res.sendFile('web/index.html');
  });

  //Custom 404
  app.use(function(req, res) {
      res.send('404: Page not Found').status(404);
      log.warn(req.connection.remoteAddress + " [404] GET " + req.url)
  });

  io.on('connection', function(socket, next) {
      log.info(socket.handshake.address + " has connected.")

      socket.on('move forward', function(){
        //console.log("Moving forward")
	EnableGPIO(7)
	EnableGPIO(15)
      })
      socket.on('stop forward', function(){
        //console.log('Stopping forward')
	DisableGPIO(7)
	DisableGPIO(15)
      })
      socket.on('turn left', function(){
        //console.log("Turning left")
	EnableGPIO(7)
      })
      socket.on('stop left', function(){
        //console.log('Stopping left')
	DisableGPIO(7)
      })
      socket.on('turn right', function(){
        //console.log("Turning right")
	EnableGPIO(15)
      })
      socket.on('stop right', function(){
        //console.log('Stopping right')
	DisableGPIO(15)
      })
      socket.on('move back', function(){
        //console.log("Moving back")
	EnableGPIO(11)
	EnableGPIO(13)
      })
      socket.on('stop back', function(){
        //console.log("Stopping back")
	DisableGPIO(11)
	DisableGPIO(13)
      })
      socket.on('take pic', function(data){
	      TakePicture(data)
      })
      socket.on('take vid', function(data, duration){
	      TakeVideo(data, duration)
      })
      socket.on('output led words', function(data){
        var p1 = '"'
        var p2 = '"'
        var first = p1.concat(data)
        var final = first.concat(p2)
        console.log(final)
        exec("sudo python /home/pi/luma.led_matrix/test.py " + final, (error, stdout, stderr) => {
          if (error) {
            log.error(error)
            return;
          }
          console.log(stdout)
        })
      })
  })
