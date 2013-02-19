
$(document).ready(function(){
  
  log('Ready...')
  
  // Global
  window.EB = {position:null, hasTouch:true}

  var render = null

  // Check for touch events (note: this is not exhaustive)
  if( !('ontouchstart' in window) || window.DocumentTouch && document instanceof DocumentTouch){
    document.documentElement.className = "no-touch"
    window.EB.hasTouch = false
  } 

  // Get user's location and stash...
  if (navigator.geolocation){
    navigator.geolocation.getCurrentPosition(geoSuccess, geoError)
  } 
  else geoError("Not supported.")
  
  function geoSuccess(position) {
    window.EB.position = position.coords
    initLocationHandlers()
  }

  function geoError(msg) {
    log(arguments)
    window.EB.position = null
  }
  
  function initLocationHandlers(){
    log("No location handlers implemented yet.")
  }
  

  /* Handle Tweets Form ****************************************/
  
  var $getTweetsForm = $('#get-tweets-form')
    , $getTweetsButton = $('#get-tweets-button')
    
  if($getTweetsForm.length){
    
    var getTweetsHandler = function(e){

      $getTweetsButton.attr('disabled', true)
      
      $getTweetsForm.find('.error').removeClass('error')
      
      var $tweetQuery = $('#tweet-query')

      // Validate inputs
      if( !$tweetQuery.val().length ){
        log('Bad query.')
        $tweetQuery
          .val('')
          .addClass('error')
          .focus()
        
        $getTweetsButton.removeAttr('disabled')
          
        return false
      }
            
      // Populate lat/lon if it's there...
      $('#tweet-lat').val( window.EB.position ? window.EB.position.latitude : '')
      $('#tweet-lon').val( window.EB.position ? window.EB.position.longitude : '')
      
      $.post('/twitter/fetch', $getTweetsForm.serialize(), function(resp){
        
        // This is a weird delta between zepto and jquery...
        var r = (typeof resp === 'string') ? JSON.parse(resp) : resp
        
        log(r)
        
        $getTweetsForm.find('input').val('')
        
        $getTweetsButton.removeAttr('disabled')
        
        render.tweets(r)
        
      }) // end post
      
      return false
      
    }
    
    $getTweetsButton.on('click', function(e){
      getTweetsHandler(e)
      e.preventDefault()
      return false

    }) // end click()
    
    $getTweetsForm.on('submit', function(e){
      getTweetsHandler(e)
      e.preventDefault()
      return false

    }) // end submit()
    
  }

  /* End Tweets Form *******************************************/


  /* Handle Instagram Geo Form *********************************/
  
  var $getInstagramGeoForm = $('#get-instagrams-geo-form')
    , $getInstagramGeoButton = $('#get-instagrams-geo-button')
    
  if($getInstagramGeoForm.length){
    
    var getInstagramGeoHandler = function(e){

      $getInstagramGeoButton.attr('disabled', true)
      
      $getInstagramGeoForm.find('.error').removeClass('error')
            
      // Populate lat/lon if it's there...
      $('#instagram-lat').val( window.EB.position ? window.EB.position.latitude : '')
      $('#instagram-lon').val( window.EB.position ? window.EB.position.longitude : '')
      
      $.post('/instagram/fetch/geo', $getInstagramGeoForm.serialize(), function(resp){
        
        // This is a weird delta between zepto and jquery...
        var r = (typeof resp === 'string') ? JSON.parse(resp) : resp
        
        log(r)
        
        $getInstagramGeoForm.find('input').val('')
        
        $getInstagramGeoButton.removeAttr('disabled')
        
        render.instagramsGeo(r)
        
      }) // end post
      
      return false
      
    }
    
    $getInstagramGeoButton.on('click', function(e){
      getInstagramGeoHandler(e)
      e.preventDefault()
      return false

    }) // end click()
    
    $getInstagramGeoForm.on('submit', function(e){
      getInstagramGeoHandler(e)
      e.preventDefault()
      return false

    }) // end submit()
    
  }

  /* End Instagram Geo Form ************************************/


  /* Handle Instagram Tags Form ********************************/
  
  var $getInstagramTagsForm = $('#get-instagrams-tags-form')
    , $getInstagramTagsButton = $('#get-instagrams-tags-button')
    
  if($getInstagramTagsForm.length){
    
    var getInstagramTagsHandler = function(e){

      $getInstagramTagsButton.attr('disabled', true)
      
      $getInstagramTagsForm.find('.error').removeClass('error')
            
      $.post('/instagram/fetch/tags', $getInstagramTagsForm.serialize(), function(resp){
        
        // This is a weird delta between zepto and jquery...
        var r = (typeof resp === 'string') ? JSON.parse(resp) : resp
        
        log(r)
        
        $getInstagramTagsButton.removeAttr('disabled')
        
        render.instagramsTags(r, $getInstagramTagsForm.find('input').val() )
        
        $getInstagramTagsForm.find('input').val('')
        
        
      }) // end post
      
      return false
      
    }
    
    $getInstagramTagsButton.on('click', function(e){
      getInstagramTagsHandler(e)
      e.preventDefault()
      return false

    }) // end click()
    
    $getInstagramTagsForm.on('submit', function(e){
      getInstagramTagsHandler(e)
      e.preventDefault()
      return false

    }) // end submit()
    
  }

  /* End Instagram Tags Form ***********************************/


  /* Renderer Module *******************************************/
  
  var Render = function(){
    
    var _tweetsTemplate
      , _instagramGeoTemplate
      , _instagramTagsTemplate
    
    (function(){
      // prefetch handlebars templates
      $.get('/js/templates/tweets.handlebars', function(data){
        _tweetsTemplate = Handlebars.compile(data)
      })

      $.get('/js/templates/instagrams-geo.handlebars', function(data){
        _instagramGeoTemplate = Handlebars.compile(data)
      })

      $.get('/js/templates/instagrams-tags.handlebars', function(data){
        _instagramTagsTemplate = Handlebars.compile(data)
      })
      
    })()
    
    return {
      tweets: function(data){
        $('#tweet-results').html( _tweetsTemplate( data ) )
      },
      instagramsGeo: function(data){
        $('#instagram-geo-results').html( _instagramGeoTemplate( data ) )
      },
      instagramsTags: function(data, query){
        $('#instagram-tags-results').html( _instagramTagsTemplate( data ) )
        $('#instagram-tags-results h2 span').html( query )
      }
    }
  }
  
  render = new Render()
  
  /* End Renderer Module *******************************************/

  
  
})
