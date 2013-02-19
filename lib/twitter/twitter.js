var fs = require('fs')
  , path = require('path')
  , request = require('request')
  , qs = require('querystring')
  , colors = require('colors')
  , url = require('url')

var twitter_config = JSON.parse( fs.readFileSync( path.resolve(__dirname, 'twitter-config.json'), 'utf-8' ) )

exports.Twitter = {
  config: twitter_config,
  generateAuthUrl: function(req,res,cb){
    // Possibly don't need this...
    var url = twitter_config.request_token_URL
      , oauth = { 
                  callback: twitter_config.callback_URL
                  , consumer_key: twitter_config.consumer_key
                  , consumer_secret: twitter_config.consumer_secret
                }
    
    // Create your auth_url for the view   
    request.post({url:url, oauth:oauth}, function (e, r, body) {
      
      if(e) return cb(e,null)

      var auth_url = twitter_config.authorize_URL_https + "?" + body

      // console.log(auth_url + " is the auth_url")      

      cb(null,auth_url)

    }) // end request.post()
    
  },
  getGeoTweets: function(query,lat,lon,distanceInKm,res,cb){
    var uri = 'http://search.twitter.com/search.json?'
      , params = 
        { q: query
        , count: 20000
        , include_entities: true
        , offset: 0
        , result_type: 'recent'
        }
    
  // console.dir(perm_token)
  
  uri += qs.stringify(params)
    
    request.get({uri:uri, json:true}, function (e, r, data) {
      if(e) return cb(e)
      return cb(null,data)
    })
    
  }
} // end exports.Twitter