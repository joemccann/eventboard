/* Conditional load of zepto or jquery */
var $lib = ('__proto__' in {} ? 'zepto.min' : 'jquery.min')
require(["log", "handlebars.min", $lib ], function(l, zepto){
  log($lib + ', handlebars and Log loaded...')
  require(["eventboard"], function(openwebsxsw){
    log('All JS files loaded...')
  })
})