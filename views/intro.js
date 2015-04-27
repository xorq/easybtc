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
        <h5>Warp Vault : Creates a <a href="https://keybase.io/warp">Warp Wallet</a></h5>\
        <h5>Warp Spend : Spends from a Warp Wallet</h5>\
        <h5>2FA Vault : Create a 2FA bitcoin Vault with your computer and mobile phone</h5>\
        <h5>2FA Vault : Spend from a 2FA bitcoin Vault</h5>\
        <h5>Receive : Simply prepares a QRCODE for receiving to a bitcoin address.</a></h5>\
        <h5>Multisig : Creates a mulitisig and spends from it</h5>\
        <h5>Chain : Creates a chain of transactions from a given Vault to a given address, so that you can spend from your vault without getting offline everytime</h5>\
        <h5>Open source ! View on <a href="http://www.github.com/xorq/easybtc">github</a></h5>\
        ')
    }, 

  });
  return IndexView;
});
