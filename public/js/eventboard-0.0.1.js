
$(document).ready(function(){
  
  log('Ready...')
  
  // Global
  window.OW = {position:null, hasTouch:true}
  
  // Check for touch events (note: this is not exhaustive)
  if( !('ontouchstart' in window) || window.DocumentTouch && document instanceof DocumentTouch){
    document.documentElement.className = "no-touch"
    OW.hasTouch = false
  } 

  // Get user's location and stash...
  if (navigator.geolocation){
    navigator.geolocation.getCurrentPosition(geoSuccess, geoError)
  } 
  else geoError("Not supported.")
  
  function geoSuccess(position) {
    OW.position = position.coords
    initLocationHandlers()
  }

  function geoError(msg) {
    log(arguments)
    OW.position = null
  }
  
})
