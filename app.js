
/**
 * Module dependencies.
 */

var express = require('express')
  , routes = require('./routes')
  , user = require('./routes/user')
  , http = require('http')
  , path = require('path')
  , fs = require('fs')

var app = express()

app.configure(function(){
  app.set('port', process.env.PORT || 3200)
  app.set('views', __dirname + '/views')
  app.set('view engine', 'ejs')
  app.use(express.favicon())
  app.use(express.compress())
  app.use(express.logger('dev'))
  app.use(express.bodyParser())
  app.use(express.methodOverride())
  app.use(app.router)
  app.use(require('stylus').middleware(__dirname + '/public'))
  app.use(express.static(path.join(__dirname, 'public')))

  var package = require(path.resolve(__dirname, './package.json'))
  
  // Setup local variables to be available in the views.
  app.locals.title = "Eventboard - Metrics for Your Events"
  app.locals.description = "Eventboard is a dashboard for metrics that are captured from live events."
  app.locals.node_version = process.version.replace('v', '')
  app.locals.app_version = package.version
  app.locals.env = process.env.NODE_ENV

  // Concat/minify
  smoosher()
  
})

app.configure('development', function(){
  app.use(express.errorHandler())
})

app.get('/', routes.index)
app.get('/users', user.list)

http.createServer(app).listen(app.get('port'), function(){
  console.log("Express server listening on port " + app.get('port'))
  console.log("\nhttp://localhost:" + app.get('port'))
})


// Concats, minifies js and css for production
function smoosher(){

  // Compress/concat files for deploy env...
  // Need to run this locally BEFORE deploying
  // to nodejitsu
  if(app.locals.env === 'predeploy'){
    // Smoosh the things
    var smoosh = require('smoosh')
    
    smoosh.make({
      "VERSION": app.locals.app_version,
      "JSHINT_OPTS": {
        "browser": true,
        "evil":true, 
        "boss":true, 
        "asi": true, 
        "laxcomma": true, 
        "expr": true, 
        "lastsemic": true, 
        "laxbreak":true,
        "regexdash": true,
      },
      "JAVASCRIPT": {
        "DIST_DIR": "./public/js",
        "eventboard": [ "./public/js/eventboard.js" ]
      },
      "CSS": {
        "DIST_DIR": "./public/css",
        "style": [ "./public/css/style.css" ]
      }
    })
    .done(function(){
      // Write boot.prod.js
      var js = fs.readFileSync( path.resolve(__dirname, 'public', 'js', 'boot.js'), 'utf-8')
      
      var newProdFile = 'eventboard-'+app.locals.app_version+'.min'
      
      var write = js.replace('eventboard', newProdFile)
      
      fs.writeFile( path.resolve(__dirname, 'public', 'js', 'boot.prod.js'), write, 'utf-8', function(err,data){
       if(err) return console.error(err)
       
       console.log("Wrote the latest version: " + newProdFile)
        
      })
      console.log('\nSmoosh done.\n')
    })
    
  } // end if production env
  
}

