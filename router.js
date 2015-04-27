define([
  'jquery',
  'underscore',
  'backbone',
  'views/index',
  'views/vault',
  'views/coinvoice',
  'views/multisig',
  'models/multisig',
  'models/transaction',
  'views/intro'
], function($, _, Backbone, IndexView, VaultView, Coinvoice, MultisigView, Multisig, Transaction, Intro){

  var AppRouter = Backbone.Router.extend({
    routes: {
      'transaction' : 'transaction',
      'vault' : 'vault',
      'tfavault' : 'tfaVault',
      'tfaspend' : 'tfaSpend',
      'receive' : 'receive',
      'multisig' : 'multisig',
      'chain' : 'chain',
      '*path' : 'intro'
    },
    currentView: false,

    intro: function() {
      if (this.currentView) {
        this.currentView.undelegateEvents();
      }
      this.currentView = new Intro({});
      this.currentView.render();
      $('.nav > li').removeClass('active').filter('[name=intro]').addClass('active');
    },
    transaction: function() {
      if (this.currentView) {
        this.currentView.undelegateEvents();
      }
      this.currentView = new IndexView({ model: new Transaction});
      this.currentView.init('normal');
      $('.nav > li').removeClass('active').filter('[name=transaction]').addClass('active');
    },
    vault: function() {
      if (this.currentView) {
        this.currentView.undelegateEvents();
      }
      this.currentView = new VaultView({ });
      this.currentView.render({ tfa:false });
      $('.nav > li').removeClass('active').filter('[name=vault]').addClass('active');
    },
    tfaVault: function() {
      if (this.currentView) {
        this.currentView.undelegateEvents();
      }
      this.currentView = new VaultView({ });
      this.currentView.render({ tfa:true });
      $('.nav > li').removeClass('active').filter('[name=tfavault]').addClass('active');
    },
    tfaSpend: function() {
      if (this.currentView) {
        this.currentView.undelegateEvents();
      }
      this.currentView = new IndexView({ model: new Transaction});
      this.currentView.init('tfa');
      $('.nav > li').removeClass('active').filter('[name=tfaspend]').addClass('active');
    },
    receive: function() {
      if (this.currentView) {
        this.currentView.undelegateEvents();
      }
      this.currentView = new Coinvoice();
      this.currentView.render();
      $('.nav > li').removeClass('active').filter('[name=receive]').addClass('active');
    }, 
    multisig: function() {
      if (this.currentView) {
        this.currentView.undelegateEvents();
      }
      this.currentView = new MultisigView({ model: new Multisig });
      this.currentView.init();
      $('.nav > li').removeClass('active').filter('[name=multisig]').addClass('active');
    },
    chain: function() {
      if (this.currentView) {
        this.currentView.undelegateEvents();
      }
      this.currentView = new IndexView({ model: new Transaction});
      this.currentView.init('chain');
      $('.nav > li').removeClass('active').filter('[name=chain]').addClass('active');
    }  
  });

  var initialize = function(){
    var app_router = new AppRouter;
    Backbone.history.start();
  };

  return {
    initialize: initialize
  };
});
