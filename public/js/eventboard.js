
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
      
      $('.error').removeClass('error')
      
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



  /* Renderer Module ****************************************/
  
  var Render = function(){
    
    return {
      tweets: function(data){
        alert(data.results.length)
      }
    }
  }
  
  render = new Render()
  
  /* End Renderer Module *******************************************/

  
  
})
