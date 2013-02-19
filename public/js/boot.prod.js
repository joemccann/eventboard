/* Conditional load of zepto or jquery */
var $lib = ('__proto__' in {} ? 'zepto.min' : 'jquery.min')
require(["log", "handlebars.min.js", $lib ], function(l, zepto){
  log($lib + ' and Log loaded...')
  require(["eventboard-0.0.1.min"], function(openwebsxsw){
    log('All JS files loaded...')
  })
})