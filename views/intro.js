define([
  'backbone',
  'underscore',
  'jquery',
  'qrcode',
], function(Backbone, _, $, html5_qrcode) {
  var QRSIZE = 300;
  var qrShown = 0;
  var checking = false;
  var IndexView = Backbone.View.extend({
    el: $('#contents'),
    
    render: function() {
      $('Title').html('EasyBTC Send Bitcoin');
      $('div[id=contents]').css('border','2px solid black');
      $('div[id=contents]').html('<div class="col-xs-12">\
        <h3 class="text-center">Welcome to Easy-BTC.org, a bitcoin self-banking toolkit</h3>\
        </div>\
        <h4>Warp Vault : Creates a <a href="https://keybase.io/warp">Warp Wallet</a></h4>\
        <h4>Warp Spend : Spends from a Warp Wallet</h4>\
        <h4>Receive : Simply prepares a QRCODE for receiving to a bitcoin address.</a></h4>\
        <h4>Multisig : Creates a mulitisig and spend from it</h4>\
        <h4>Chain : Creates a chain of transaction from a given Vault to a given address, so that you can spend from your vault without getting offline everytime</h4>\
        ')
    }, 

  });
  return IndexView;
});
