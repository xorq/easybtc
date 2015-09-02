define([
  'backbone',
  'underscore',
  'jquery',
  'qrcode',
  'models/dialogs'
], function(Backbone, _, $, html5_qrcode, Dialogs) {
  var QRSIZE = 300;
  var qrShown = 0;
  var checking = false;
  var IndexView = Backbone.View.extend({
    el: $('#contents'),
    templateFrom: _.template($('#indexViewFromTemplate').text()),
    templateToAddressField: _.template($('#indexViewToAddressTemplate').text()),
    templateToThumb: _.template($('#indexViewToThumbTemplate').text()),
    template: _.template($('#indexViewTemplate').text()),
    events: {
      'click video' : 'import',
      'click button[name=btn-guidance]' : 'guidanceToggle',
      'click button[name^=btn-scan]' : 'importAddress',
      'click [name=btn-export]' : 'export',
      'click li[name=btn-import]' : 'import',
      'click button[name=nextQr]' : 'nextQr',
      'click button[name=previousQr]' : 'previousQr',
      'click div[name=qrcodeExport]' : 'clearExport',
      'click .btn-feemode' : 'changeFeeMode',
      'click .btn-add-recipient' : 'addOutput',
      'click button[name=btn-sign]' : 'sign',
      'click button[name=btn-sign-chain]' : 'signChain',
      'change input[name=to]' : 'lookup',
      'click button[name^=btn-remove]' : 'removeOutput',
      'change input[name=sender]' : 'lookup',
      'keyup input[name^=amount]' : 'updateAmount',
      'keyup input[name=to]' : 'updateAddress',
      'keyup input[name=passphrase]' : 'updatePassphrase',
      'keyup input[name=salt]' : 'updateSalt',
      'click button[name^=btn-all]' : 'putAll',
      'blur input[name=fee]' : 'updateFee',
      'click select[name=qrSize]' : 'renderQrCode',
      'click li[name=guidance-tails]' : 'guidanceTails',
      'click li[name=guidance-dedicated]' : 'guidanceDediated',
      'click li[name=guidance-off]' : 'guidanceOff',
      'focus input[name=passphrase]' : 'internetChecker',
      'click button[name=btn-switch-to-input]' : 'loadNext',
      'click li[name=btn-show-advanced]' : 'showAdvanced',
      'keyup input[name=tinyurl]' : 'loadTinyButton',
      'click button[name=load-data]' : 'loadTiny',
      'click button[name=save-data]' : 'saveData',
      'click [name=btn-show-tiny-url]' : 'tinyUrlShow',
      'click [name=btn-validate-transaction]' : 'validateTransaction',
      'click button[name=btn-sign-mobile]': 'signMobile',
      'click button[name=btn-sign-computer]': 'signComputer'
    },

    signComputer: function() {

      this.model.multiSign('computer', $('input[name=passphrase]').val(), $('input[name=salt]').val());
      var master = this;
      //function(text, title, callback, callback2)
      var callback2 = function() {
        console.log(master.model.signatures);
        title = 'Signed Multisig';
        text = '<h2>Success !</h2></br>You can verify and push this transaction on <a href=http://blockr.io/tx/push>blockr.io</a></br>\
        or you can push it directly with this button :</br></br>\
        <button class="btn btn-danger" name="pushTx">Push</button></br></br>';
        data = master.model.buildMultisig();
        //function(data, text, title, extraSize, QRDataSize)
        dialogs.dialogQrCode(data, text, title, 50, 850);
        $('button[name=pushTx]').click(function(){
          var confirm = window.confirm('Are you absolutely sure ? Bitcoin Transactions cannot be reversed ! Continue at your own risks!')
          if (confirm == true) {
            cryptoscrypt.pushTx(data);
          } else {
            window.alert('Push cancelled');
          }
        })
      }
      
      var callback = function(code) {
        try {
          code = code.split(',');
        } catch(err) {
          console.log(err);
          return false
        }
        console.log(code);

        _.each(code,function(signature,index){
          if (!cryptoscrypt.validScript(signature)) {
            return false
          }
        })
        master.model.signatures.mobile = code;
        return true
        //this.model.multiSign($('input[name=passphrase]').val(),$('input[name=salt]').val);
      }

      Dialogs.dataGetter('Scan the QR code displayed on your mobile phone here.', 'Mobile phone\'s signature', callback, callback2);
    },

    signMobile: function() {
      var master = this;
      this.model.multiSign('mobile', $('input[name=passphrase]').val(), $('input[name=salt]').val()).done(function(){
        console.log(master.model.signatures.mobile.toString())
        Dialogs.dialogQrCode(master.model.signatures.mobile.toString(),'This is the mobile\'s signature. Scan it on your computer when asked','Mobile phone\'s signature')
      });
    },

    validateTransaction: function() {

      try {
        this.model.buildMultisigTx()
      } catch(err) { 
        window.alert('the transaction you entered seems to be invalid') ; return
      };

      var master = this;
      $('.groupeA').prop('disabled', true)
      var def = $.Deferred();
      var mink = this.model.exportLinkDataForTinyUrl() + '#'+ (this.model.tfa ? 'tfaspend' : 'transaction');
      var link = 'http://easy-btc.org/index.html?data=' + mink ;

      //def.done(function(result){

      //master.model.tinyLink = result[0];
      $('div[name=signature]').css('display','block')
      $('div[name=transaction]').css('display','none')

      $('h4[name=link-phone]').css('display','block')
      //$('h4[name=link-phone]').html('<h4 style="color:red">Go to the following address on your phone : tinyurl.com/' + result + '</h4>');
      $('h4[name=link-phone]').css('display','block');
      $('[name=passphrase]').prop('disabled', false);
      $('[name=salt]').prop('disabled', false);
      $('button[name=btn-sign-computer]').prop('disabled', false);
      $('button[name=btn-sign-computer]').css('display','block');
      Dialogs.dialogQrCode(link, 'Go to this URL with your phone and proceed with the signature on both devices. </br>On your mobile phone, it is recommended to go airplane mode before entering your passphrase.</br>You can also cut internet on your computer while signing (in which case you should restart before going back online, ideally using <a href="http://tails.boum.org/">Tails</a>.', 'Scan with phone')
      /*tinyurl.com/' + (result[0].split('/')[result[0].split('/').length-1]).toUpperCase()*/
      //})


    },

    tinyUrlShow: function() {
      $('div[name=tiny-url-tool]').toggle()
    },

    loadTiny: function() {
      var master = this;
      var Endpoint = new function() {
        var RESOLVER_URL = 'http://almaer.com/endpoint/resolver.php';
        var RESOLVER_CALLBACK = '__Endpoint_resolve';
        
        var count = 0;
        
        // touch my privates
        var append = function(url) {
          var appender = document.createElement('script');
          appender.src = url;
          appender.type = 'text/javascript';
          document.getElementsByTagName('body')[0].appendChild(appender);
        }
        
        // feeling public
        return {
          resolve: function(url, userCallback) {
            var serverCallback = RESOLVER_CALLBACK + (count++);
            var serverUrl = RESOLVER_URL 
                          + '?url=' + url
                          + '&callback=' + serverCallback;

            // Global link to run the callback
            window[serverCallback] = userCallback;

            append(serverUrl); // Hit the server proxy via script append
          },

          isRedirecting: function(newurl, originalurl) {
            return (newurl != '') && (newurl != originalurl);
          }
        };
        
      };
      var def = $.Deferred();
      Endpoint.resolve('http://www.tinyurl.com/' + $('input[name=tinyurl]').val(), function(url) {
        def.resolve(url)
      });
      def.done(function(data){
        var data = (data.split('data=')[1]).split('#')[0];
        if (data) {
          console.log(data)
          master.model.importData(data);
        }
        master.init();
      })
    },

    saveData: function(def) {
      var success = function(data) {
        console.log(data);
        var dataArray = data.split('/');
        $('input[name=tinyurl]').val(dataArray[dataArray.length - 1])
        try {
          def.resolve([dataArray[dataArray.length - 1], link])
        } catch(err) {
        }
        return def
      }
      
      var mink = this.model.exportLinkDataForTinyUrl() + '#'+ (this.model.tfa ? 'tfaspend' : 'transaction');
      var link = 'http://easy-btc.org/index.html?data=' + mink ;
      try { 
        return cryptoscrypt.getTinyURL(link, success);
      } catch(err) { 
        window.alert('There was an error, probably too much data for tinyURL');
      }

      //this.loadTiny();
    },

    loadTinyButton: function() {
      console.log($('input[name=tinyurl]').val())
      if ($('input[name=tinyurl]').val() == "" ) {
        $('button[name=load-data]').addClass('disabled');
      } else {
        $('button[name=load-data]').removeClass('disabled')
      }
    },

    showAdvanced: function() {
      this.model.advanced = !this.model.advanced;
      this.init(this.model.purpose);
    },

    loadNext: function() {
      if (this.model.hash) {
        var from = this.model.from;
        this.model.thumbFrom = this.model.recipients[0].thumb;
        this.model.importData(this.model.nextData());
        this.model.recipients[0].address = from;
        this.init();
      } else {
        window.alert('the transaction needs to be signed first');
      }
    },

    internetSingleCheck: function() {
      var iCheckDefer = $.Deferred();
      cryptoscrypt.internetCheck(iCheckDefer)
      .done
    },

    internetChecker: function() {
      var master = this;
      goodpage = function() {
       return ($('Title').html() == ('EasyBTC Send Bitcoin')) 
     }
      iCheck = function() {
        if (!this.goodpage()) {
          return
        }
        if (checking == true) {
          setTimeout(this.iCheck, 4000);
        };

        var iCheckDefer = $.Deferred();
        cryptoscrypt.internetCheck(iCheckDefer)
        .done(function(data) {
          if((data.result=='yes') & goodpage()) {
          $('div[id=contents]').css('border','3px solid red');
          $('div[id=warning]').html('<h5 style=color:red>You are online! You should never expose your secret passphrase while online, if you are unsure of what you are doing, please check the guidance</h5>')
        }
        })
        .fail(function() {
          if(goodpage()) {
            $('div[id=contents]').css('border','3px solid green');
            $('div[id=warning]').html('<h5 style=color:darkgreen>You seem to be offline, good !</h5>')
          }
        });
      }
      if (checking == false) {
        checking = true 
        iCheck();
      }    
    },

    guidanceToggle: function() {
      this.model.guidance = this.model.guidance == false && true;
      this.init();

    },

    guidanceTails: function() {
      this.model.guidance = 'tails'
      this.init();
    },

    guidanceDediated: function() {
      this.model.guidance = 'dedicated'
      this.init();
    },

    guidanceOff: function() {
      this.model.guidance = ''
      this.init();
    },

    export: function() {
      var link = window.location.protocol + window.location.pathname + 'index.html?data=' + this.model.exportData() + '#transaction';
      var hash = sjcl.codec.base64.fromBits(sjcl.hash.sha256.hash(JSON.stringify(this.model.exportData()))).toString().slice(0,20);
      var tex = 'This <a style="text-align:center" href=' + link + '>link</a> opens this page with all your data.</a>\
      </br></br>This is the hash for all the data : </br> ' + '<a style="color:red">' + hash + '</a></br>You can use it to double check that all the data are the same on different devices</br></br></br></br>'
      var title = 'Data Link';
      var data = this.model.export();
      Dialogs.dialogQrCode('http:/' + link, tex, title);
    },

    drawExportQrcode: function(a) {
      var data = this.model.export();
      $('div[name=qrcodeExport]',this.$el).children().remove();
      $('h5[name=titleQrcode]', this.$el).html('QRcode '+ ( 1 + a ).toString()+' / '+data.length.toString());

      var qrcode = new QRCode('qrcodeExport', { 
        width: 300, 
        height: 300, 
        correctLevel : QRCode.CorrectLevel.L
      });
      this.qrShown = a;
      qrcode.makeCode( data[a] );
    },


    clearExport: function() {
      $('div[name=exportQrcode]', this.$el).attr('style','dislpay:none');
      this.init();
    },


    previousQr: function() {
      if (this.qrShown) {
        this.drawExportQrcode(this.qrShown - 1);
      }
    },


    nextQr: function() {
      if (this.qrShown < this.model.export().length-1) {
        this.drawExportQrcode(this.qrShown + 1);
      }
    },

    importAddress: function(ev) {
      var master = this;
      this.model.expectedField = ev.currentTarget.name == 'btn-scan-from' ? 'from' : $(ev.currentTarget).parents('.addressTo').attr('dataId')
      ifTrue = function(data) {
        code = master.tfa ? (cryptoscrypt.validAddress(cryptoscrypt.getMultisigAddressFromRedeemscript(data)) ? data : '') : cryptoscrypt.findBtcAddress(data);
        return master.model.import(code)
      };

      doThat = function() {
        master.init();
      };

      Dialogs.dataGetter('Import an address', 'Import BTC Address', ifTrue, doThat)
    },

    import: function(ev) {
      console.log(ev);
      var master = this;
      this.model.newImport();
      
      ifTrue = function(data) {
        code = cryptoscrypt.findBtcAddress(data);
        if (master.model.import(code)) {
            setTimeout($('div[id=qr-status-tx]').animate({ backgroundColor: 'red' }, 'slow'), 0)
            setTimeout($('div[id=qr-status-tx]').animate({ backgroundColor: 'transparent' }, 'slow'), 5000)
            $('div[id=qr-status-tx]').html("Got " + master.model.qrParts + ' out of ' + master.model.qrTotal + ' codes.')
            return true;
          } else {
            setTimeout($('div[id=qr-status-tx]').animate({ backgroundColor: 'red' }, 'slow'), 0)
            setTimeout($('div[id=qr-status-tx]').animate({ backgroundColor: 'transparent' }, 'slow'), 5000)
            $('div[id=qr-status-tx]').html("Got " + master.model.qrParts + ' out of ' + master.model.qrTotal + ' codes.')
            return false;
          }
      }

      doThat = function() {
        master.init();
      }

      Dialogs.dataGetter('Import a Full Transaction', 'Import Transaction', ifTrue, doThat)

    },

    successClass: function(address) {
      if (cryptoscrypt.validAddress(address)) {
        return 'has-success';
      } else if (address) {
        return 'has-error';
      }
    },

    changeFeeMode: function() {
      this.model.changeFeeMode();
      this.updateFee();
      this.init();
    },

    signChain: function() {

      var master = this;

      dosign = function() {
        
        //master.model.sign($('input[name=passphrase]', master.$el).val(), $('input[name=salt]', master.$el).val());

        master.model.passphrase = $('input[name=passphrase]', master.$el).val();
        master.model.salt = $('input[name=salt]', master.$el).val()

        var result = master.model.doChain();

        var title = 'Transfers'
        var text = '<h6>From Vault: </h6><h5>' + master.model.from + '</h5><h6>to Hot Wallet: </h6><h5>' + master.model.recipients[0].address +
        '</h5><h6>Each QR code will redeem ' + (master.model.recipients[0].amount/100000000) + ' BTC from the Vault to the Hot Wallet</h6><h5 style="color:red">It is highly recommended to dataouble check every single change addresses</h5>';
        var comments = Array.apply(null, Array(Math.ceil(master.model.balance / master.model.recipients[0].amount))).map(function(x, i) { return 'Remaining in Vault: ' + 
          ((master.model.balance - (i * (master.model.fee + master.model.recipients[0].amount))) / 100000000) + 
          (result.changeAddresses[i] ? ' BTC </br>Change Address : ' + 
          result.changeAddresses[i]+ 
          '</br><h6>Passphrase: your passphrase + ' + (i + 1) : '') + '</br>'}  );
        /*var commentsRecovery = Array.apply(null, Array(Math.ceil(master.model.balance / master.model.recipients[0].amount))).map(function(x, i) { return 'Recovery for Tx#' + (1 + i) +
        '</br>This will transfer back from ' + result.changeAddresses[i] + ' to ' + master.model.from})*/
        Dialogs.dialogQrCodes(result.results, text, title, 300, comments);
      };

      var text = '..........Please wait, this should take few seconds on a normal computer..........';
      $('div[id=please-wait]', this.$el).html('<h3 id="please-wait" style="text-center">' + text + '</h3>');

      setTimeout(
        dosign
      ,100);

      setTimeout(
        function() {
          $('div[id=please-wait]', this.$el).html('')
        }
      ,200);

    },

    sign: function(ev) {

      var master = this;
      var passphrase = $('input[name=passphrase]', master.$el).val();
      var salt = $('input[name=salt]', master.$el).val();
      var from = $('input[name=from]', master.$el).val();

      _.each(cryptoscrypt.brainwallets(passphrase),function(pass, index) {
        if (pass.pub.getAddress().toString() == from) {
          passphrase = pass.toWIF();
        };
      });

      dosign = function(ev) {

        master.model.sign(passphrase, salt).done(function(a){
          console.log(a)
          if (master.model.from != master.model.signAddress) {
            alert("the signature is invalid");
          }
          master.init();
          title = 'Signed Transaction';
          text = 'You can verify and push this transaction on <a href=http://blockr.io/tx/push>blockr.io</a></br>\
          or you can push it directly with this button :</br></br>\
          <button class="btn btn-danger" name="pushTx">Push</button></br></br>';
          data = master.model.qrcode;
          dialogs.dialogQrCode(a[0].toHex(), text, title, 50, 850);
          $('button[name=pushTx]').click(function(){
            var confirm = window.confirm('Are you absolutely sure ? Bitcoin Transactions cannot be reversed ! Continue at your own risks!')
            if (confirm == true) {
              cryptoscrypt.pushTx(data);
            } else {
              window.alert('Push cancelled');
            }
          })
        });
      };

    dosign()
/*   
      var text = '..........Please wait, this should take few seconds on a normal computer..........';
      $('div[id=please-wait]', this.$el).html('<h3 id="please-wait" style="text-center">' + text + '</h3>');

      setTimeout(
        dosign
      ,100);

      setTimeout(
        function() {
          $('div[id=please-wait]', this.$el).html('')
        }
      ,200);
*/
    },

    getParameterByName: function(name) {
      name = name.replace(/[\[]/, "\\[").replace(/[\]]/, "\\]");
      var regex = new RegExp("[\\?&]" + name + "=([^&#]*)"),
        results = regex.exec(location.search);
      return results === null ? "" : decodeURIComponent(results[1].replace(/\+/g, " "));
    },

    init: function(purpose) {
      this.model.purpose = purpose ? purpose : this.model.purpose;
      if (purpose == 'chain') {
        //this.model.advanced = false;
      }
      if (purpose == 'tfa') {
        this.model.tfa = true;
      }
      var data = this.getParameterByName('data');
      this.render();
      if (data) {
        this.model.importData(data);
        this.render();
        if (this.model.tfa) {
          $('div[name=signature]').parent().prepend('<h4 style=color:red>Use your 2FA mobile passphrase </br>It is recommended to be in airplane mode during the process, then close your browser and restart your phone before going online again.</br>Also, avoid reusing the same address.</h4>')
          $('div[name=transaction]').css('display','none')
          $('button[name=btn-sign]').css('display','none')
          $('input[name=passphrase]').prop('disabled',false)
          $('input[name=salt]').prop('disabled',false)
          $('button[name=btn-sign-mobile]').css('display','block')
        } else {
        }
      } else {
        if (this.model.tfa) {
          $('button[name=btn-sign-computer]').css('display','block')
        }
      }

    },

    render: function() {
      //var master = this;
      $('Title').html('EasyBTC Send Bitcoin');
      $('div[id=contents]').css('border','2px solid black');
      this.model.checking = false;
      this.$el.html(this.template(this.model.data()));
    }, 

    renderFrom: function() {
      $('.addressFrom', this.el).html(this.templateFrom( this.model.data() ));
    },

    renderAddressTo: function(dataId) {
      recipient = this.model.recipients[dataId];
      index = dataId;
      $('[class=fieldAddressTo][dataId='+index+']').html(
        this.templateToAddressField()
      );
    },

    renderThumbTo: function(dataId) {
      recipient = this.model.recipients[dataId];
      index = dataId;
      $('[dataId=' + dataId + '] > div[name=thumb]',this.el).html(
        this.templateToThumb()
      );
    },

    updateTotal: function() {
      $('input[name=total]', this.$el).val(this.model.getTotal()/100000000);
    },

    updateAmount: function(ev) {
      var recipientId = parseInt($(ev.currentTarget).parents('.addressTo').attr('dataId'));
      this.model.recipients[recipientId][ 'amount' ] = parseInt(100000000 * ev.currentTarget.value);
      this.updateTotal();
    },   

    updateAddress: function(ev) {
      var recipientId = parseInt($(ev.currentTarget).parents('.row.addressTo').attr('dataId'));
      this.model.recipients[recipientId][ 'address' ] = ev.currentTarget.value;
    },   

    putAll: function(ev) {
      this.model.putAll($(ev.currentTarget).parents('.row.addressTo').attr('dataId'));
      this.init();
    }, 

    removeOutput: function(ev) { 
      this.model.removeRecipient(
        $(ev.currentTarget).parents('.row.addressTo').attr('dataId')
      );
      this.init();
    },

    addOutput: function() {
      this.model.addRecipient();
      this.init();
    },

    updateFee: function () {
      if (this.model.feeMode == 'auto') {
        $('input[name=fee]', this.$el).val(this.model.getFee() / 100000000 );
      }
      if (this.model.feeMode == 'custom') {
        this.model.fee = parseInt(100000000 * parseFloat(($('input[name=fee]', this.$el).val())));
      }
      this.updateTotal();
    },

    getTotal: function() {
      return (cryptoscrypt.sumArray(
        (_.map($('input[name^=amount]', this.$el),function(str){return (100000000 * str['value'])/2}
        )))+parseInt(this.model.fee))/100000000    
    },

    lookup: function(ev) {
      var master = this;
      var address = ev.currentTarget.value.trim();
      var fieldName = ev.currentTarget.name;
      var fieldValue = ev.currentTarget.value;
      var recipientId = $(ev.currentTarget).parents('.row.addressTo').attr('dataId');
      var fieldEntry = ev.currentTarget.value.trim();
      
      var resetFrom = function() {
        master.model.from = '';
        master.model.thumbFrom = '';
        master.model.balance = '';
        master.renderFrom();
      }
      
      var resetTo = function() {
        master.model.recipients[ recipientId ].address = '';
        master.model.recipients[ recipientId ].thumb = '';
        master.renderAddressTo(recipientId);
        master.renderThumbTo(recipientId);
      }

      if ((fieldValue == '') & (fieldName == 'sender')) {
        resetFrom();
        return
      };

      if ((fieldValue == '') & (fieldName == 'to')) {
        resetTo();
        return
      };

      //Initialize if something is entered
      if (fieldName == 'sender') {
        this.model.from = fieldValue;
      };

      if (fieldName == 'to') {
        this.model.recipients[recipientId].address = fieldValue;
      };

      this.model.lookup(fieldName,recipientId,fieldEntry).done(function(){

        if (ev.currentTarget.name == 'sender') {
          master.model.updateBalance().done(function() {
          master.renderFrom();
          master.updateFee();
          }).fail(function() {
            console.log('problem')
          });
        };

        if (ev.currentTarget.name == 'to') {
          master.renderAddressTo(recipientId);
          master.renderThumbTo(recipientId);
        };

      }).fail(function(){
        master.init()
        $('div[id=iStatus]').html('<h4 style="color:red">Something went wrong during the lookup! Check your info and your internet</h4>')
      })
    },
  });
  return IndexView;
});
