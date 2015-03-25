require.config({
  waitSeconds: 0,
  shim: {

  },
  paths: {
  	jquery: "bower_components/jquery/dist/jquery.min",
    jqueryui: "bower_components/jquery-ui/jquery-ui",
    backbone: "bower_components/backbone/backbone",
  	underscore: "bower_components/underscore/underscore",
    requirejs: "bower_components/requirejs/require",
    bootstrap: "bower_components/bootstrap/dist/js/bootstrap",
    qrcode: "bower_components/jsqrcode/html5-qrcode.min",
  },
  packages: [

  ]
});

require([
	'easybtc'
], function(EasyBTC) {
	EasyBTC.initialize();
});
