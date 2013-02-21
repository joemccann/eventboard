var fs = require('fs')
  , path = require('path')
  , request = require('request')
  , qs = require('querystring')
  , colors = require('colors')
  , url = require('url')
  , cheerio = require('cheerio')

var _pinterestQueryUrl = 'http://pinterest.com/search/pins/?q={query}'

// Scrapes Pinterest and returns the pins and their data...
function scrapeHtml(html){
  
  var $ = cheerio.load(html)
    , pins = []

  $('#ColumnContainer').find('.pin').each(function(){
    var pin = {
      pinLink: 'http://pinterest.com' + $(this).find('.ImgLink').attr('href'),
      pinImage: $(this).find('.ImgLink').find('img').attr('src'),
      description: $(this).find('.description').text(),
      likes: parseInt( $(this).find('.stats').find('.LikesCount').text() ),
      comments: parseInt( $(this).find('.stats').find('.CommentsCount').text() ),
      repins: parseInt( $(this).find('.stats').find('.RepinsCount').text() )
    
    }
    pins.push(pin)
    // console.dir(pin)
  })
  
  // console.dir(pins)
  return pins
  
}
exports.Pinterest = {
  fetchPinsFromQuery: function(query,res,cb){
    
    var uri = _pinterestQueryUrl.replace('{query}', encodeURIComponent(query) )
    // console.log(uri)
    request.get({uri:uri}, function (e, r, body) {
      if(e) return cb(e)
      return cb(null, scrapeHtml(body) )
    }) // end request.get()
    
  }
} // end exports.Pinterest