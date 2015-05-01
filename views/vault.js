define([
	'jquery', 
	'underscore', 
	'backbone', 
	'models/wordlist', 
	'models/crypto', 
	'models/qrcode',
	'models/bitcoin',
	'models/dialogs'
], function($, _, Backbone, WordList, crypto, qrcode, Bitcoin, Dialogs){
	var vaultParts = {'pubkeyComputer':'', 'pubkeyMobile':''};
	var checking = false;
	var tfa = undefined;
	var VaultView = Backbone.View.extend({
		el: $('#contents'), 
		template: _.template($('#vaultViewTemplate').text()), 
		events: {
			'click .btn-random' : 'random',
			'click .btn-generate' : 'pleaseWait',
			'keyup input[name=passphrase]' : 'deleteIfChanged', 
			'keyup input[name=email]' : 'deleteIfChanged',
			'focus input[id=passphrase]' : 'internetChecker',
			'click .btn-generate-computer' : 'tfaGenerateComputer',
			'click .btn-generate-mobile' : 'tfaGenerateMobile',
		}, 

		tfaGenerateMobile: function() {
			//function(data, text, title, extraSize, QRDataSize)
			var passphrase = $('input[name=passphrase]', this.$el).val()
			var salt = $('input[name=passphrase]', this.$el).val()

			var data = cryptoscrypt.validPkey(passphrase) ? cryptoscrypt.WIFToPubKey(passphrase) : cryptoscrypt.warp(
					passphrase, 
					salt
				)[2];
			Dialogs.dialogQrCode(data, 'You will be asked to scan this QRCode on the computer', 'Public Key');

		},

		tfaGenerateComputer: function() {
			var master = this;
			var callback = function(code) {
				var address = cryptoscrypt.pubkeyToAddress(code)
				if (cryptoscrypt.validAddress(address)) {
					vaultParts.pubkeyMobile = code;
					return true
				}
			}
			var callback2 = function() {
				//function(data, text, title, extraSize, QRDataSize)
				var passphrase = $('input[name=passphrase]', master.$el).val()
				var salt = '' + $('input[name=email]', master.$el).val()
				if (cryptoscrypt.validPkey(master.passphrase)) { 
					return 
				};
				console.log(passphrase);
				console.log(salt);
				
				vaultParts.pubkeyComputer = cryptoscrypt.validPkey(master.passphrase) ? cryptoscrypt.pkeyToPubKey(master.passphrase) : cryptoscrypt.warp(
					$('input[name=passphrase]', master.$el).val(), 
					$('input[name=email]', master.$el).val()
				)[2];

				console.log(vaultParts);

				if (vaultParts.pubkeyComputer == vaultParts.pubkeyMobile) {
					window.alert('Your Computer\'s public key appears to be the same as your mobile\'s, you should have different passphrases on each devices. Process aborted')
					return
				}
				console.log(vaultParts)
				multisig = cryptoscrypt.getMultisigAddress([vaultParts.pubkeyComputer, vaultParts.pubkeyMobile], 2)

				Dialogs.dialogQrCode(multisig.redeemscript, '<h2> Success !</h2>This is your bitcoin address to your 2FA Vault: </h4><h4 style="color:red">' + multisig.address + '</h4> You will need your mobile and your computer\'s passphrases to spend from it. </br>This QR Code contains your 2FA Redeem Code.</br>Do save the data in this QR Code. You will need it on order to spend from your Vault</h4></br>', '2FA bitcoin address')
			}
			//function(text, title, callback, callback2)
			Dialogs.dataGetter('Scan the QRcode provided by your mobile device here </br><h6>(Of course, your passphrase should be different on each devices)</h6>', 'Mobile Data', callback, callback2);
		},

		internetChecker: function() {
			/*if (this.tfa) {
				return
			}*/
			var master = this;
			goodpage = function() { return ($('Title').html() == 'EasyBTC Vault Creator') }
			iCheck = function() {
				if (this.goodpage() == false) {
					return
				}
				if (checking == true)  {
					setTimeout(this.iCheck,4000);
				};

				var iCheckDefer = $.Deferred();
				cryptoscrypt.internetCheck(iCheckDefer)
				.done(function(data){
					if((data.result=='yes') & goodpage()) {
						$('div[id=contents]').css('border','3px solid red');
						$('div[id=vault-warning]').html('<h5 style=color:red>You are using an online computer, therefore this vault will be insecure. Consider turning off internet while creating the vault, and rebooting before going back online, ideally using <a href="http://tails.boum.org">Tails</a></h5>')
					}
				})
				.fail(function(){
					$('div[id=contents]').css('border','3px solid green');
					$('div[id=vault-warning]').html('<h5 style=color:darkgreen>You seem to be offline. For achieving maximum security, check the guidance.</h5>')
					});
			}
			if (checking == false) {
				checking = true 
				iCheck();
			} 
		},

		render: function(parameters) {
			$('Title').html('EasyBTC Vault Creator');
			this.tfa = parameters.tfa;
			this.$el.html(this.template({tfa:parameters.tfa}));
			$('div[id=contents]').css('border','2px solid black');
			checking = false;
			//$('.btn-generate').html(parameters.tfa ? 'Computer' : 'Generate')
			if (parameters.tfa == true) {
				$('div[name=vault-tfa-text]').html('<h4>Open this page on your computer and on your mobile and follow the steps, a 2FA bitcoin address will be generated</h4><h5>(You will need a webcam on your computer)</h5>')
			}
		}, 

		random: function() {
			this.internetChecker();
			$('input[name=passphrase]', this.$el).val(
				WordList.random($('select[name=count_words]', this.$el).val())
			);

		}, 

		deleteResults: function() {

			$('div[id=qrcode-address-image]').text('');
			$('div[id=qrcode-privkey-image]').text('');
			$('div[id=label-address]').text('');
			$('div[id=label-privkey]').text('');
			$('div[id=text-address]').text('');
			$('div[id=text-privatekey]').text('');
			$('div[id=qrcode-pubkey-image]').text('');
			$('div[id=text-pubkey]').text('');
			$('div[id=label-pubkey]').text('');
		}, 

		deleteIfChanged: function() {

			if (
				this.passphraseMemory!=$('input[name=passphrase]', this.$el).val() |
				this.saltMemory!=$('input[name=email]', this.$el).val()
				){
					this.deleteResults()
				}

		}, 

		pleaseWait: function() {
			this.internetChecker()
			var master = this;
			var text = ($('h3[id=pleaseWait]').text() == '') ? '..........Please wait, this should take few seconds on a normal computer..........' : '';

			$('div[id=pleaseWait]', this.$el).html('<h3 id="pleaseWait" style="text-center">' + text + '</h3>');
			$('div[id=pleaseWait]', this.$el).show();

			setTimeout(function () {
				master.generate(master)
			},100);
		},

		generate: function(master) {

			master = master ? master : this;

			master.passphraseMemory = $('input[name=passphrase]', master.$el).val()
			master.saltMemory = $('input[name=passphrase]', master.$el).val()

			if (cryptoscrypt.validPkey(master.passphraseMemory)) { return };
			master.deleteResults()

			var qrcode = new QRCode("qrcode-address-image", {width: 260, height: 260,correctLevel : QRCode.CorrectLevel.L, colorDark : 'black'});
			var qrcode2 = new QRCode("qrcode-privkey-image", {width: 260, height: 260, correctLevel : QRCode.CorrectLevel.L, colorDark : 'red'});
			var qrcode3 = new QRCode("qrcode-pubkey-image", {width: 260, height: 260, correctLevel : QRCode.CorrectLevel.L, colorDark : 'darkBlue'});

			var result = cryptoscrypt.warp(
				$('input[name=passphrase]', master.$el).val(), 
				$('input[name=email]', master.$el).val()
			);    

			qrcode.makeCode('bitcoin:'+result[1]);
			qrcode2.makeCode(result[0]);
			qrcode3.makeCode(result[2]);

			$('div[id=label-pubkey]').text(result[2]);
			$('div[id=label-address]').text(result[1]);
			$('div[id=label-privkey]').text(result[0]);
			$('div[id=text-address]').text("Address");
			$('div[id=text-privatekey]').text("Private Key");
			$('div[id=text-pubkey]').text("Public Key (for multisig)");
			
			$('div[id=pleaseWait]', master.$el).html('')
		}
	});

	return VaultView;
});
