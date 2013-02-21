
/**
 * Module dependencies.
 */

var express = require('express')
  , routes = require('./routes')
  , http = require('http')
  , path = require('path')
  , fs = require('fs')
  , walkdir = require('walkdir')
  , twitter = require('./lib/twitter/twitter.js').Twitter
  , pinterest = require('./lib/pinterest/pinterest.js').Pinterest
  , instagram = require('./lib/instagram/instagram.js').Instagram
  

var app = express()

app.configure(function(){
  
  var package = require(path.resolve(__dirname, './package.json'))
  
  // Setup local variables to be available in the views.
  app.locals.title = "Eventboard - Metrics for Your Events"
  app.locals.description = "Eventboard is a dashboard for metrics that are captured from live events."
  app.locals.node_version = process.version.replace('v', '')
  app.locals.app_version = package.version
  app.locals.env = process.env.NODE_ENV
  
  app.set('port', process.env.PORT || 80) // 80 for oauth stuff...
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

  app.locals.instagram_token = require('./lib/instagram/instagram-token-ignore.json')

  // Concat/minify
  cleaner()
  process.nextTick(smoosher)
  
})

app.configure('development', function(){
  app.use(express.errorHandler())
})

app.get('/', function(res,res,next){
  res.render('index')
})

app.get('/instagram/token', function(req,res,next){
    
    var auth_url = instagram.oauth.authorization_url({
      scope: 'basic', 
      display: 'touch'
    })

    return res.render('auth-instagram', { 
        title: 'PhotoPipe - Instagram Connect'
      , auth_url: auth_url}
      )
})

app.get('/instagram/oauth', function(req,res,next){
  
  instagram.oauth.ask_for_access_token({
      request: req,
      response: res,
      complete: function(params, response){
        console.log('complete')
        // console.dir(params)
        // Set the JSON object response to the _user object
        // for access later...
        var filepath = path.join( __dirname, "/lib/instagram/instagram-token-ignore.json")
        console.log(filepath)
        fs.writeFile( 
            filepath, 
            JSON.stringify(params), 
            function(err,data){
              if(err) {
                console.log('error trying to write')
                return console.error(err)
              }
              console.log('file written')
              
              // Head back to instagram page, but this time, we'll enter
              // the else block
              return res.redirect('/')
              
            })
        

      },
      error: function(errorMessage, errorObject, caller, response){
        console.log('Error!')
        // errorMessage is the raised error message
        // errorObject is either the object that caused the issue, or the nearest neighbor
        console.error(errorMessage)
        // res.redirect('/?error=true&type=instagram') 
      }
    })
    return null
  
})

app.post('/twitter/fetch', function(req,res,next){

  // Example of getting tweets
  var query = req.body['tweet-query']
    , lat = req.body['tweet-lat']
    , lon = req.body['tweet-lon']
    
  twitter.getGeoTweets(query,lat,lon,0.1,res,function getGeoTweetsCb(err,data){
    
    if(err){
      return res.send(500)
    }
    // console.dir(data)
    return res.json(data)
    
  })
  
})

app.post('/instagram/fetch/geo', function(req,res,next){

  // Example of getting geo instagrams
  var lat = req.body['instagram-lat']
    , lon = req.body['instagram-lon']
    
    // function(query, lat, lon, distanceInMeters, token, req, res, cb)
  instagram.eventboard.executeGeoSearch(
      lat,
      lon,
      50,
      app.locals.instagram_token.access_token,
      req,
      res,
      function getGeoInstagramCb(err,data){
    
        if(err){
          console.error("error in getGeoInstagramCb...")
          console.error(err)
          return res.send(500)
        }
        // console.dir(data)
        return res.json(data)
      }
    )
  
})

app.post('/instagram/fetch/tags', function(req,res,next){

  // Example of getting tweets
  var query = req.body['instagram-query-tags']
    
    // function(query, lat, lon, distanceInMeters, token, req, res, cb)
  instagram.eventboard.executeTagsSearch(
      query,
      app.locals.instagram_token.access_token,
      req,
      res,
      function getTagsInstagramCb(err,data){
    
        if(err){
          console.error("error in getGeoInstagramCb...")
          console.error(err)
          return res.send(500)
        }
        // console.dir(data)
        return res.json(data)
      }
    )
  
})

app.post('/pinterest/fetch/pins', function(req,res,next){

  // Example of getting tweets
  var query = req.body['pinterest-query']
    
  pinterest.fetchPinsFromQuery(query,res,function getPins(err,data){
    
    if(err){
      return res.send(500)
    }
    console.log('pinterest....')
    // console.dir(data)
    return res.json(data)
    
  })
  
})

http.createServer(app).listen(app.get('port'), function(){
  console.log("Express server listening on port " + app.get('port'))
  console.log("\nhttp://localhost:" + app.get('port'))
})

// Pass in a path of a directory to walk and a 
// regex to match against.  The file(s) matching
// the patter will be deleted.
function walkAndUnlink(dirPath, regex){
  
  var emitter = walkdir(dirPath)

  emitter.on('file',function(filename,stat){
    if( regex.test(filename) ){
      console.log("Removing old file: " + filename)
      fs.unlinkSync( path.resolve( dirPath, filename) )
    }
  })
  
}

// Removes old css/js files.
function cleaner(){
  // Compress/concat files for deploy env...
  // Need to run this locally BEFORE deploying
  // to nodejitsu
  if(app.locals.env === 'predeploy'){
    walkAndUnlink( path.join(__dirname, 'public', 'css'), new RegExp(/style-/) )
    walkAndUnlink( path.join(__dirname, 'public', 'js'), new RegExp(/eventboard-/) )
  }
}


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
