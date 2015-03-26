define([
	'jquery', 
	'underscore', 
	'backbone', 
	'models/crypto',
	'models/multisig',
	'models/qrcode',
	'models/bitcoin',
	'jqueryui'
], function($, _, Backbone, crypto, Multisig, qrcode, Bitcoin, jqueryui){
	var checking = false;
	var MultisigView = Backbone.View.extend({
		el: $('#contents'), 
		model: Multisig,
		template: _.template($('#multisigViewTemplate').text()),
		//templatePubkey: _.template($('#pubkeyTemplate').text()),  
		events: {
			'change input[name=entry-field]' : 'lookup',
			'click button[name=btn-add]' : 'addPubkey',
			'click button[name=btn-delete-pubkey]' : 'deletePubkey',
			//'click span[name=pubkey-field-title]' : 'showData',
			'change select[name=number-of-signatures]' : 'updateNumberOfSignatures',
			'keyup select[name=number-of-signatures]' : 'updateNumberOfSignatures',
			'click button[name=btn-scan]' : 'scanAddress',
			'click button[name=btn-scan-recipient]' : 'scanRecipient',
			'click [name=btn-import-redeemscript]' : 'importMultisig',
			'click [name=btn-export-multisig]' : 'drawMutlisigData',
			'click button[name=address-button]' : 'drawMultisigAddress',
			'click button[name=btn-transaction]' : 'txButton',
			'click button[name=btn-add-recipient]' : 'addRecipient',
			'click button[name=btn-delete-recipient]' : 'deleteRecipient',
			'change input[name=recipient-field]' : 'lookupRecipient',
			'change input[name=amount-field]' : 'changedAmount',
			'click button[name=btn-all]' : 'putAll',
			'click [name=btn-export-tx]' : 'drawTxQr',
			'click [name=btn-import-data]' : 'importQrTx',
			//'click button[name=signature-button]' : 'renderSignature',
			'click button[name=btn-signature]' : 'renderSignature',
			'click button[name=btn-edit-signature]' : 'openSubmitSignature',
			'click button[name=btn-make-signature]' : 'makeSignature',
			'click button[name=btn-create-signature]' : 'createSignature',
			'click video' : 'cameraClick',
			'click button[name=btn-delete-signature]' : 'deleteSignature',
			'click button[name=btn-show-qr-signature]' : 'showSignature',
			'click button[name=btn-scan-signature]' : 'importQrSig',
			//'blur input[name=signature-hex]' : 'saveSignature',
			'click button[name=btn-scan-pkey]' : 'importPkey',
			'click button[name=btn-apply-signature]' : 'performMultisig',
			'click canvas' : 'clickCanvas',
			'click button[name=data-link]' : 'getDataLink',
			'click button[name=save-data]' : 'saveData',
			'click button[name=load-data]' : 'loadData',
			'keyup input[name=tinyurl]' : 'loadTiny',
		},

		loadTiny: function() {
			console.log($('input[name=tinyurl]').val())
			if ($('input[name=tinyurl]').val() == "" ) {
				$('button[name=load-data]').addClass('disabled');
			} else {
				$('button[name=load-data]').removeClass('disabled')
			}
		},

		loadData: function() {
			window.location.href = 'http://tinyurl.com/' + $('input[name=tinyurl]').val()
		},

		saveData: function() {
			var success = function(data) {
				console.log(data);
				var dataArray = data.split('/');
				$('input[name=tinyurl]').val(dataArray[dataArray.length - 1])
			}
			mink = this.model.exportLinkDataForTinyUrl() + '#multisig'
			var link = 'http://easy-btc.org/index.html?data=' + mink ;
			try { 
				cryptoscrypt.getTinyURL(link, success);
			} catch(err) { 
				window.alert('There was an error, probably too much data for tinyURL');
			}

			this.loadTiny();
			/*
			function lzw_encode(s) {
				var dict = {};
				var data = (s + "").split("");
				var out = [];
				var currChar;
				var phrase = data[0];
				var code = 256;
				for (var i=1; i<data.length; i++) {
					currChar=data[i];
					if (dict[phrase + currChar] != null) {
						phrase += currChar;
					}
					else {
						out.push(phrase.length > 1 ? dict[phrase] : phrase.charCodeAt(0));
						dict[phrase + currChar] = code;
						code++;
						phrase=currChar;
					}
				}
				out.push(phrase.length > 1 ? dict[phrase] : phrase.charCodeAt(0));
				for (var i=0; i<out.length; i++) {
					out[i] = String.fromCharCode(out[i]);
				}
				return out.join("");
			}

			function lzw_decode(s) {
				var dict = {};
				var data = (s + "").split("");
				var currChar = data[0];
				var oldPhrase = currChar;
				var out = [currChar];
				var code = 256;
				var phrase;
				for (var i=1; i<data.length; i++) {
					var currCode = data[i].charCodeAt(0);
					if (currCode < 256) {
						phrase = data[i];
					}
					else {
					   phrase = dict[currCode] ? dict[currCode] : (oldPhrase + currChar);
					}
					out.push(phrase);
					currChar = phrase.charAt(0);
					dict[code] = oldPhrase + currChar;
					code++;
					oldPhrase = phrase;
				}
				return out.join("");
			}

			console.log(window.btoa(unescape(encodeURIComponent( lzw_encode(window.btoa(unescape(encodeURIComponent(mink))))))))
			console.log( window.btoa(unescape(encodeURIComponent( lzw_encode(mink) ))))
			console.log( decodeURIComponent(escape(window.atob( window.btoa(unescape(encodeURIComponent( lzw_encode(mink) ))) ))))
			console.log( lzw_decode(decodeURIComponent(escape(window.atob( window.btoa(unescape(encodeURIComponent( lzw_encode(mink) ))) )))))
			
			cryptoscrypt.getTinyURL('http://easy-btc.org/index.html?data={%22recipients%22:[{%22address%22:%221Xorq87adKn12bheqPFuwLZgZi5TyUTBq%22,%22amount%22:89133535}],%22unspents%22:[{%22transaction_hash%22:%22fa2021dff72c0b08ad8f4056c9ea3515c2e034c32359f6e09b169033c7a6a6cb%22,%22value%22:990000,%22transaction_index%22:0},{%22transaction_hash%22:%22e2f038a256d71b6c32cb3bb5b4f63d2b91aeae7dc9ca50ac3e45d66606847cb1%22,%22value%22:1990000,%22transaction_index%22:1},{%22transaction_hash%22:%22acb4637d140ca8e94dee6f2d67cc3f810f68a49de282c2bb5712d3f90f4395d2%22,%22value%22:10719535,%22transaction_index%22:1},{%22transaction_hash%22:%22267c037f8c1c9113e91768a74c6f44e37043a962a2c8e6250214d2b96caa4520%22,%22value%22:74144000,%22transaction_index%22:23},{%22transaction_hash%22:%220a11b09a638b79e2753c8844dd00b79a315f4d3d3ded47c5fe697fef682e39c4%22,%22value%22:1300000,%22transaction_index%22:0}],%22redeemscript%22:%22524104dedf0b95880044bec816c25404ce7dbac265bb79f73a0880e1d1237200f28c57c5d13975f3a045be6f6c6db984ecfbe20c62d12203de7f483fd482e2435e2f224104567be2411c1ef05b252c0cf3b37f74e5a88b4088192007d4599dbbf35974ebb1026b54152c430ceebc12d6c3f3ac2b04055b3639a6f7b7d63f3011dc3879fc0e41040e7f8b80cc21fb9b30aacfe96fad7d2c2211a17a554d1050262d759e09b8012f7d60bdbc3cb5d99825a9eaaa7fed65f48de7dec157c5d97cd75315c11992546b53ae%22,%22signatures%22:{%220%22:[%22304402203edbb257eb70a65363cbcc4e3342c5032cf5eeb00bdc1f0e3b256830fe5727850220679000b82524a306ea47e7ba5d797bd16dc8ecb5e974871317086c0344ff9101%22,%223045022100d93c7b92a99444fb06231afb3edee82f5db6756ad4ae3c0bdaa8a83c0402eb62022018b45e451b698b9661b7ba7071e541cd0f9642c64114ec6e60da6c3001cb6998%22,%223045022100a844d3104558085ee762a8e84def9f30e10dc443b138343df7b3b852a29d9bf7022033d7551d6755963a1a04635f5e376700d4d31b2fe6e01f56be287c0006134806%22,%22304502210092dce55a1a4b6bcf65def1eff61d4fa0646ef63dc9f091114690b701f790f39e022068d3dfcc1d1d170ba17a38f9b9d2bfba7efa5740e761aa88285cd6005f099e20%22,%22304402203a9696547d9a38c674f40032a189960a0c22db28dd6b35dc9b4596263ba2bb80022069657baae8e1d3f599c20ca8ac57aed330e1c62e5cbdac0d74c03da3cd5ecae6%22]}}#multisig', function(tinyurl){
			 //Do something with tinyurl:
				alert(tinyurl)
			});*/
			
		},

		scanAddress: function(ev) {

			var field = ev.currentTarget.id;
			var master = this;

			callback = function(data) {
				master.lookup(false, field, data);
				$('input[name=entry-field][id=' + field + ']').val(data);
				return true

			};
			var callback2 = function() {
				master.render()
			};

			this.dataGetter('Recipient Address', 'Scan your recipient\'s address', callback, callback2)


		},

		scanRecipient: function(ev) {

			var field = ev.currentTarget.id;
			var master = this;

			callback = function(data) {
				field
					return true
			};
			
			var callback2 = function() {
				master.renderTransaction()
			};

			this.dataGetter('Recipient Address', 'Scan your recipient\'s address', callback, callback2)


		},

		clickCanvas: function(ev) {
			$(ev.currentTarget).parent().children().remove();
		},

		performMultisig: function() {
			//if (_.filter(this.model.pubkeys, function(key) { return key.signature }).length >= this.model.numberOfSignatures) {
				title = 'Signed Multisig';
				text = 'You can verify and push this transaction on <a href=http://blockr.io/tx/push>blockr.io</a></br>\
				or you can push it directly with this button :</br></br>\
				<button class="btn btn-danger" name="pushTx">Push</button></br></br>';
				data = this.model.buildMultisig();
				this.dialogQrCode(data, text, title, 50, 850);
				$('button[name=pushTx]').click(function(){
					var confirm = window.confirm('Are you absolutely sure ? Bitcoin Transactions cannot be reversed ! Continue at your own risks!')
					if (confirm == true) {
						cryptoscrypt.pushTx(data);
					} else {
						window.alert('Push cancelled');
					}
				})
				/*var qrcodeData = new QRCode('qrcode-signed-tx', { 
					width: 600, 
					height: 600, 
					correctLevel : QRCode.CorrectLevel.L
				});
				qrcodeData.makeCode(data);
				$('h4[name=signed-tx-data]').html(data);*/
			//}
				
		},

		saveSignature: function(ev, signature) {
			var field = ev.currentTarget.id;
			if (cryptoscrypt.validScript($('input[name=signature-hex][id=' + field + ']').val())){
				this.model.signatures[field] = signature;//$('input[name=signature-hex][id=' + field + ']').val();
				this.renderSignature('reload');
				this.openSubmitSignature(ev);
				//$('span[name=signature-status][id=' + field + ']').addClass('glyphicon-ok-circle');
				//$('span[name=signature-status][id=' + field + ']').removeClass('glyphicon-remove-circle');
			} else {
				window.alert('This is not a signature')
			}
		},

		showSignature: function(ev) {
			var master = this;
			var field = ev.currentTarget.id;
			var data = master.model.signatures[field] ? JSON.stringify(
				{
					address : master.model.pubkeys[field].address,
					signature : master.model.signatures[field].toString(),
					checksum : sjcl.hash.sha256.hash(master.model.pubkeys[field].address + master.model.pubkeys[field].signature)[0],
					txchecksum : sjcl.hash.sha256.hash(master.model.getTx())[0]
				}) : null;
			var text = 'This is the signature from:</br> ' + this.model.pubkeys[field].address + '</br></br>';
			var title = 'Signature of ' + this.model.pubkeys[field].address;
			this.dialogQrCode(data , text, title);
		},

		deleteSignature: function(ev) {
			var field = ev.currentTarget.id;
			delete this.model.signatures[field];
			$('[name=signature-hex][id=' + field + ']').val(this.model.pubkeys[field].signature)
			this.renderSignature(null);

		},

		createSignature: function(ev) {
			field = ev.currentTarget.id;
			$('div[name=create-signature-area][id=' + field + ']').toggle('easeOutSine');
			$('span[name=chevron-create-signature][id=' + field + ']').toggleClass('glyphicon-triangle-left').toggleClass('glyphicon-triangle-bottom')
		},

		makeSignature: function(ev){

			var field = ev.currentTarget.id;
			var passphrase = $('input[name=passphrase-field][id=' + field + ']').val();
			var salt = $('input[name=salt-field][id=' + field + ']').val();
			if (!cryptoscrypt.validPkey(passphrase)) {
				passphrase = (cryptoscrypt.warp(passphrase,salt)[0]);
				this.model.sign(passphrase, field);
				var strongSigningAddress = this.model.signingAddress;
				if (strongSigningAddress != this.model.pubkeys[field].address){
					var weakPassphrase = (cryptoscrypt.weakWarp(weakPassphrase,salt)[0]);
					this.model.sign(passphrase, field);
					if (this.model.signingAddress != this.model.pubkeys[field].address){
						window.alert('You entered the password/private key for the address "' + strongSigningAddress + '", therefore this signature is invalid, however the application will continue for your testing purposes')
					}
				}
			}

			$('[name=signature-hex][id=' + field + ']').val(this.model.signatures[field])
			this.renderSignature(null);
			
			// If there is enough signatures, automatically perform multisig
			if (_.filter(this.model.signatures,function(signature){return signature}).length == this.model.numberOfSignatures) {
				this.performMultisig();
			}
		},

		cameraClick : function(ev) {
			localMediaStream.stop();
			localMediaStream.src = null;
			localMediaStream.mozSrcObject = null;
			localMediaStream = null;
			$('video').parent().parent().css('display','none')
		},

		openSubmitSignature: function(ev) {
			var index = ev.currentTarget.id;
			$('button[name=btn-edit-signature][id=' + index + ']').toggleClass('glyphicon-triangle-left').toggleClass('glyphicon-triangle-bottom');
			if ($('div[name=pubkey-signature-form][id=' + index + ']').children().length == 0) {
				this.renderSubmitSignature(ev);
			} else {
				$('[name=pubkey-signature-form][id=' + index + ']').hide('easeOutSine');
				$('[name=pubkey-signature-form][id=' + index + ']').children().remove();
			}
		},

		renderSubmitSignature: function(ev) {
			var index = ev.currentTarget.id
			
			var template = _.template("\
				<h4 class=''>Signature:</h4>\
				<div class='col-xs-12'>\
					<button class='btn btn-default' type='button' name='btn-scan-signature' id='<%=index%>'>\
						<span class='glyphicon glyphicon-camera'>\
						</span>\
						Scan \
					</button>\
					<button class='btn btn-default' type='button' name='btn-create-signature' id='<%=index%>'>\
						<span name='chevron-create-signature' id=<%=index%> class='glyphicon glyphicon-triangle-left'>\
						</span>\
						Create \
					</button>\
					<button class='btn btn-default glyphicon glyphicon-trash' type='button' name='btn-delete-signature' id='<%=index%>'>\
					</button>\
				</div>\
				</div>\
				<div name='create-signature-area' id='<%=index%>' class='' style='display:none'>\
					<h5 class='col-xs-12'>Create Signature:</h5>\
					<div class='col-xs-4' style='padding-right:5px'>\
						<input style='font-size:12px' type='text' value='' class='form-control input-group' id='<%=index%>' name='passphrase-field'  placeholder='Passphrase or Private Key'>\
						</input>\
					</div>\
					<div class='col-xs-3' style='padding-right:5px'>\
						<input style='font-size:12px' type='text' class='form-control input-group' id='<%=index%>' name='salt-field'  placeholder='Salt (Email)' value=''>\
						</input>\
					</div>\
					<div class='col-xs-5'>\
						<span class='style='font-size:12px' input-group-btn'>\
							<button style='font-size:12px' class='btn btn-default' type='button' name='btn-scan-pkey' id='<%=index%>'>\
								<span style='font-size:12px' class='glyphicon glyphicon-camera'></span> Scan Private key </button>\
							<button style='font-size:12px' class='btn btn-default' type='button' name='btn-make-signature' id='<%=index%>'>\
							<span style='font-size:12px' class='glyphicon glyphicon-edit'></span>\
							Sign !</button>\
						</span>\
					</div>\
				</div>\
				<div class='col-xs-12' name='import-qr-sig' style='display:none'>\
					<p>Hold a QR Code in front of your webcam.</p>\
					<div class='qr-status-sig'></div>\
					<div class='qr-reader-sig' style='width: 400px; height: 300px'></div>\
				</div>\
			");
			$('[name=pubkey-signature-form][id=' + index + ']').hide();
			$('[name=pubkey-signature-form][id=' + index + ']').html(
				template(
					{
						index: index,
					}
				)	
			)
			$('[name=pubkey-signature-form][id=' + index + ']').show('easeOutSine');
		},

		renderSignature: function(action) {

			action = action ? 'easeOutSine' : null;
			$('span[name=chevron-signature]').toggleClass('glyphicon-triangle-left').toggleClass('glyphicon-triangle-bottom')
			if($('div[name=multi-signature]',this.el).children().length == 0) {
				$('.form1').addClass('disabled');
				$('.form1').prop('disabled', 'disabled');
				$('.form2').removeClass('disabled');
				$('.form2').prop('disabled', 'disabled');
				var template = _.template("\
					</br>\
					<h4 class='' style='color: <%= signaturesProvided < numberOfSignatures ? 'red' : 'green' %>'></br>You have <%=signaturesProvided%> out of <%=numberOfSignatures%> signatures. <%=(signaturesProvided == numberOfSignatures) ? '' : ('You need ' + (numberOfSignatures - signaturesProvided) + ' more signature' + ((numberOfSignatures - signaturesProvided) > 1 ? 's' : ''))%> </h4>\
					<%pubkeys.forEach(function(pubkey, index) {%>\
						<div class='col-xs-12 input-group'>\
							<h4 class='' style='word-break:break-all; font-size:18px; padding-top:7px'><%=pubkey.address%></h4>\
							<button style='float:left' class='btn btn-default glyphicon glyphicon-triangle-right' name='btn-edit-signature' id=<%=index%> style='font-size:20px'></button>\
							<button style='float:left' class='btn btn-default glyphicon glyphicon-qrcode' name='btn-show-qr-signature' id=<%=index%> style='font-size:20px;margin-left:10px;margin-right:10px'></button>\
							<span class='glyphicon glyphicon-<%=signatures[index] ? 'ok' : 'remove'%>-circle disabled' name='signature-status' id=<%=index%> style='<%=signatures[index] ? 'color:green' : 'color:red'%>;top:5px;font-size:24px;float:left;left:10px'></span>\
						</div>\
						<div name='pubkey-signature-form' id='<%=index%>' style='margin-left:60px'>\
						</div>\
						<div class='col-xs-12' id='qrcode-signature-<%=index%>'>\
						</div>\
					<%})%>\
					<div class='col-xs-12' style=''>\
						<button class='btn btn-default <%=_.size(signatures) >= numberOfSignatures ? '' : 'disabled'%>' style='font-size:20px; float: right;' name='btn-apply-signature'>\
							<span name='chevron-signature' class='glyphicon glyphicon-certificate'></span>\
							Apply Signature\
						</button>\
					</div>\
					<div class='col-xs-12' style='' id='qrcode-signed-tx'>\
					</div>\
					<h4 name='signed-tx-data'>\
					</h4>\
				");
				

				$('div[name=multi-signature]',this.el).html(
					template(
						{
							pubkeys : this.model.pubkeys,
							signatures : this.model.signatures,
							numberOfSignatures : this.model.numberOfSignatures,
							signaturesProvided : _.filter(this.model.signatures, function(signature) { return signature }).length
						}
					)
				);
				$('div[name=multi-signature]',this.el).hide();
				$('div[name=multi-signature]',this.el).show(action);

			} else {
				$('div[name=multi-signature]',this.el).hide(action);
				$('div[name=multi-signature]',this.el).children().remove()
				$('button[name=btn-signature]').removeClass('hidden');
				//$('.form1').removeClass('disabled');
				//$('.form1').prop('disabled', '');
				$('.form2').removeClass('disabled');
				$('.form2').prop('disabled', '');
				if (!action) {
					this.renderSignature(null);
				}
			}

		},

		importPkey: function(ev) {
			var master = this;
			field = ev.currentTarget.id

			if ($('div[name=import-qr-sig]').css('display') == 'none') {
				$('div[name=import-qr-sig]').css('display', '')

				$('.qr-reader-sig').html5_qrcode(
					function(code) {
						foundPkey = cryptoscrypt.findBtcPkey(code);
						if (cryptoscrypt.validPkey(foundPkey)) {
							localMediaStream.stop();
							localMediaStream.src = null;
							localMediaStream.mozSrcObject = null;
							localMediaStream = null;
							$('div[name=import-qr-sig]').css('display', 'none')
							$('input[name=passphrase-field]').val(foundPkey);
							//master.openSubmitSignature(ev);
						}
					}
					, function(error) {
						console.log('error');
					}, function(error) {
						console.log('error');
					}
				)

			} else {
				$('div[name=import-qr-sig]').css('display', 'none')
				localMediaStream.stop();
				localMediaStream.src = null;
				localMediaStream.mozSrcObject = null;
				localMediaStream = null;
			}
		},

		importQrSig: function(ev) {
			var master = this;
			var field = ev.currentTarget.id;
			var title = 'Scan Signature';
			var text = 'Here you can scan a signature only';

			var callback = function(data) {
				jaison = JSON.parse(data);
				if (jaison.checksum == (sjcl.hash.sha256.hash(jaison.address + jaison.signature)[0]) && 
				jaison.txchecksum == (sjcl.hash.sha256.hash(master.model.getTx())[0])) {
					master.model.pubkeys[field].signature = jaison.signature;
					return true
				}
			};
			var callback2 = function() {
				master.openSubmitSignature(ev)
			};

			this.dataGetter(title, text , callback, callback2)
		},

		importQrTx: function(ev) {
			this.model.newImport();
			var master = this;
			var field = ev.currentTarget.id;
			var title = 'Scan Data';
			var text = 'Here you show your QRCodes one by one';

			var callback = function(data) {
				if (master.model.importTx(data)) {
					return true;
				} else {
					$('div[id=qr-status-tx]').html("Got " + master.model.qrParts + ' out of ' + master.model.qrTotal + ' codes.');
				}
			};
			var callback2 = function() {
				master.render();
			};

			this.dataGetter(title, text , callback, callback2)
		},

		dialogQrCode: function(data, text, title, extraSize, QRDataSize) {
			var extraSize = extraSize ? extraSize : 0 ;
			if(!data) {
				return
			}

			$('#dialog-qrcode').dialog('destroy');
			//var link = window.location.pathname + '?data=' + this.model.exportData() + '#Multisig';

			$( '#dialogs' ).html('\
				<div id="dialog-qrcode" title="' + title + '">'

					+ text +

					'<div style=margin-left:20px id=qrcode-display-window>\
					</div>\
				</div>'
			);

			var qrcodeData = new QRCode('qrcode-display-window', { 
					width: 300 + extraSize, 
					height: 300 + extraSize, 
					correctLevel : QRCode.CorrectLevel.L
				});
			if (data.length > QRDataSize) {
				this.dialogQrCodes(data, text, title, QRDataSize);
			} else {
				try {
					qrcodeData.makeCode(data);
				} catch(err) {
					this.dialogQrCodes(data, text, title);
					//qrcodeData.makeCode(err);
				}
			}

			var opt = {
				autoOpen: false,
				modal: false,
				width: 400 + extraSize,
				height:450 + extraSize,
				hide: { effect: "fade", duration: 400 },
				show: { effect: "fade", duration: 400 }
			};
			$('#qrcode-display-window').append('<h2>Data</h2><h5 style="word-break:break-all; margin-right: 30px">' + data + '</h5>');
			$('#dialog-qrcode').dialog(opt);
			$('#dialog-qrcode').css({
				'border': '1px solid #ccec8c',
				'background':'#ccec8c', 
				'border': '2px solid #ccec8c', 
				'color': '#000000', 
				'title': 'Details',
				//'font-weight' : ''
			});
			$('#dialog-qrcode').dialog('open')
			$('[role=dialog]').addClass('hidden-print')

		},

		dialogQrCodes: function(dataArray, text, title, QRDataSize) {
			QRDataSize = QRDataSize ? QRDataSize : 850
			if (typeof(dataArray) == 'string') {
				dataArray = cryptoscrypt.stringToChunks(dataArray, 850);
			}
			$('#dialog-qrcodes').dialog('destroy');
			//var link = window.location.pathname + '?data=' + this.model.exportData() + '#Multisig';

			$( '#dialogs' ).html('\
				<div id="dialog-qrcodes" title=' + title + '>'

					+ text +

					'<div id=qrcode-display-window>\
					</div>\
				</div>');
			dataArray.forEach(function(chunk, index) {
				$('div[id=qrcode-display-window]').append('<div id=qrcode-number-' + index + '><button name=btn-qrcode-number-' + index + ' class=btn-primary>QRCode # ' + index + '</button></div>')
				var qrcodeData = new QRCode('qrcode-number-' + index, { 
						width: 300, 
						height: 300, 
						correctLevel : QRCode.CorrectLevel.L
					});

				qrcodeData.makeCode(chunk);
				$('button[name=btn-qrcode-number-' + index + ']').click(function() {
					$('canvas', 'div[id=qrcode-number-' + index + ']').toggle('blind');
				})
				$('canvas', 'div[id=qrcode-number-' + index + ']').css('display','none');
			});

			var opt = {
				autoOpen: false,
				modal: false,
				width: 400,
				height:500 + 10 * dataArray.length,
				hide: { effect: "fade", duration: 400 },
				show: { effect: "fade", duration: 400 }
			};

			//$('#qrcode-display-window').append('<h2>Data</h2><h5 style=word-break:break-all>' + dataArray.join('</br></br>') + '</h5>');
			$('#dialog-qrcodes').dialog(opt);
			$('#dialog-qrcodes').css({
				'border': '1px solid #ccec8c',
				'background':'#ccec8c', 
				'border': '2px solid #ccec8c',
				'color': '#000000', 
				'title': 'Details',
				//'font-weight' : 'bold',
				'hide': { effect: "fade", duration: 2000 }
			});
			$('#dialog-qrcodes').dialog('open')//.parent().effect('slide');
		},

		getDataLink: function() {
			var link = window.location.pathname + '?data=' + this.model.exportLinkData() + '#multisig';
			var hash = sjcl.codec.base64.fromBits(sjcl.hash.sha256.hash(JSON.stringify(this.model.exportLinkData()))).toString().slice(0,20);
			var tex = 'This <a style="text-align:center" href=' + link + '>link</a> opens this page with all your data, including signatures.</a>\
			</br></br>This is the hash for all the data : </br> ' + '<a style="color:red">' + hash + '</a></br>You can use it to double check that all the data are the same on different devices</br></br> Also, you can use tools/import data to transfer the data using the following QRCodes:</br></br>'
			var title = 'Data Link';
			var data = this.model.exportData();
			this.dialogQrCodes(data, tex, title);
			return {link: link, hash: hash, data: data}
		},

		updateUnspent: function() {
			var master = this;
			this.model.getAddressUnspent().done(function() {
				master.renderAddress();
				if (master.model.unspents.length > 0) {
					$('button[name=btn-transaction]').removeClass('disabled')
				} else {
					$('button[name=btn-transaction]').addClass('disabled')
				}
			}).fail(function() {
				console.log(master.unspents);
				master.model.unspents = [];
				master.model.balance = 0;
				master.renderAddress();
				if (master.model.unspents && master.model.unspents.length > 0) {
					$('button[name=btn-transaction]').removeClass('disabled')
				} else {
					$('button[name=btn-transaction]').addClass('disabled')
				}
			});
		},

		putAll: function(ev) {
			var changed = this.model.putAll(ev.currentTarget.id);
			$('input[name=amount-field]')[0].value = this.model.recipients[ev.currentTarget.id].amount / 100000000;
			//this.renderTransaction('reload');
			//$('div[name=multiTransaction]').removeClass('hidden');
		},

		changedAmount: function(ev) {
			var field = parseInt(ev.currentTarget.id);
			var inputValue = ev.currentTarget.value;
			this.model.recipients[field].amount = 100000000 * inputValue;
			this.model.deleteSignatures();
			//this.render();
			//$('div[name=multiTransaction]').removeClass('hidden');
		},

		lookupRecipient: function(ev, field, inputValue) {
			this.model.deleteSignatures();
			var master = this;
			var field = ev ? parseInt(ev.currentTarget.id) : field; 
			var inputValue = ev ? ev.currentTarget.value : inputValue;
			//The input is an address
			if (cryptoscrypt.validAddress(inputValue)) {
				master.model.recipients[field].address = inputValue;
				return
			}
			//The input is anything else
			if (inputValue) {
				this.model.resolveOnename(inputValue, field, master.model.dataToRecipient, master.model).done(function() {
					if (master.model.recipients[field].address) {
						master.lookupRecipient(false, field, master.model.recipients[field].address);
						ev.currentTarget.value = master.model.recipients[field].address
					}
				})
				return
			}
			//$('div[name=multiTransaction]').removeClass('hidden');
		},

		deleteRecipient: function(ev) {
			this.model.deleteRecipient(parseInt(ev.currentTarget.id));
			this.renderTransaction(null);
			//$('div[name=multiTransaction]').removeClass('hidden');
		},

		addRecipient: function() {
			this.model.deleteSignatures();
			this.model.addRecipient();
			this.renderTransaction(null);
			//$('div[name=multiTransaction]').removeClass('hidden');
		},

		txButton: function() {
			$('div[name=multisig-builder').hide('easeOutSine');
			$('span[name=chevron-tx-button]').toggleClass('glyphicon-triangle-left').toggleClass('glyphicon-triangle-bottom')
			if ($('div[name=multiTransaction]',this.el).children().length == 0) {
				$('.form1').prop('disabled', 'disabled');
				this.renderTransaction('easeOutSine');

			} else {
				$('div[name=multisig-builder').show('easeOutSine');
				$('div[name=multiTransaction]',this.el).hide('easeOutSine');
				setTimeout(function() {
					$('div[name=multiTransaction]',this.el).children().remove();
				},200);
				$('.form1').removeClass('disabled');
				$('.form1').prop('disabled', false);
			}
		},

		renderTransaction: function(init) {
			var action = init ? 'easeOutSine' : null;
			var template = _.template("\
					<div id='' name='pubkey-field'>\
					<label class='row col-xs-12'>From:</label>\
						<div class='col-xs-12 row' style='padding-right: 40px; margin-right: 0px'>\
							<div class='col-xs-7' style='padding-left:0px;padding-right:5px'>\
								<input disabled style='color: blue;' type='text' value=<%=from%> class='form-horizontal form-control input-group' placeholder='Bitcoin address or Onename'>\
								</input>\
							</div>\
							<div class='col-xs-5 col-md-2' style='margin-bottom:10px;padding-left:0px;padding-right:5px'>\
								<input disabled style='color: blue;' type='text' class='form-horizontal form-control input-group'  placeholder='Amount in BTC' value='<%=balance/100000000%> BTC'>\
								</input>\
							</div>\
						</div>\
					</div>\
				<br><label class='row col-xs-12'>To:</label>\
				<% _.each(recipients, function(recipient, index) {%>\
					<div id='<%=index%>' name='pubkey-field'>\
						<div class='col-xs-12 row' style='padding-right: 40px; margin-right: 0px;'>\
							<div class='col-xs-7' style='padding-left:0px;padding-right:5px'>\
								<input type='text' value='<%=recipient.address%>' class='form2 form-horizontal form-control input-group' id='<%=index%>' name='recipient-field'  placeholder='Bitcoin address or Onename'>\
								</input>\
							</div>\
							<div class='col-xs-5 col-md-2' style='padding-left:0px;padding-right:5px'>\
								<input type='text' class='form2 form-horizontal form-control input-group' id='<%=index%>' name='amount-field'  placeholder='Amount in BTC' value='<%=recipient.amount ? recipient.amount / 100000000 : ''%>'>\
								</input>\
							</div>\
							<div class='col-xs-4 col-md-3 style='padding-left:0px'>\
								<span class='input-group-btn'>\
									<button class='form2 btn btn-default glyphicon glyphicon-download' type='button' name='btn-all' id='<%=index%>'></button>\
									<button class='form2 btn btn-default glyphicon glyphicon-camera' type='button' name='btn-scan-recipient' id='<%=index%>'></button>\
									<button class='form2 btn btn-default glyphicon glyphicon-trash' type='button' name='btn-delete-recipient' id='<%=index%>'></button>\
								</span>\
							</div>\
						</div>\
					</div>\
					<hr class='col-xs-10 visible-xs'></hr>\
				<%})%>\
				</br>\
				</div>\
				<div class=col-xs-12>\
				</br>\
				<button type='button' class='form2 btn btn-default' name='btn-add-recipient' style='margin-bottom:20px'>\
				Add Recipient\
				<span class='glyphicon glyphicon-plus-sign glyphicon-align-center' style='color:green;horizontal-align:middle;vertical-align:middle;horizontal-align:middle;bottom:1px'></span>\
				</button>\
				</div>\
				<div class=col-xs-12>\
				</br>\
				</div>\
				<div class='col-xs-12' style=''>\
				<button class='btn btn-default <%=(unspents.length > 0) && (_.filter(recipients, function(recipient) { return !(recipient.address && recipient.amount) }).length == 0) ? '' : 'disabled'%>' style='font-size:20px;float:right;margin-bottom:30px' name='btn-signature'>\
					<span name='chevron-signature' class='glyphicon glyphicon-triangle-left'></span>\
					 Signatures\
				</button>\
				</div>\
				<div class='form-group' name='multi-signature'>\
				</div>\
			");
			$('div[name=multiTransaction]',this.el).html(
				template(
					{
						recipients : this.model.recipients,
						unspents : this.model.unspents,
						from : this.model.multisig.address,
						balance : this.model.balance
					}
				)
			)
			var master = this;
			$('div[name=multiTransaction]',this.el).hide()
			setTimeout(function() {
				$('div[name=multiTransaction]',master.el).show(action)
			},1);
		},

		clearPubkey: function(ev) {
			var field = ev.currentTarget.id;
			if (this.model.pubkeys[field].address) {
				this.model.clearField(field);
				$('span[name=pubkey-field-title][id=' + field + ']')[0].style = 'background-color:default'	
			}
				$('div[name=multi-address]').html('');
				$('button[name=spendMultisig]').addClass('disabled');
		},

		addPubkey: function() {
			this.model.addEntry();
			this.render();
		},

		deletePubkey: function(ev) {
			var field = parseInt(ev.currentTarget.id)
			this.model.deletePubkey(field);
			this.render();
			this.updateUnspent();
		},

		getParameterByName: function(name) {
			name = name.replace(/[\[]/, "\\[").replace(/[\]]/, "\\]");
			var regex = new RegExp("[\\?&]" + name + "=([^&#]*)"),
				results = regex.exec(location.search);
			return results === null ? "" : decodeURIComponent(results[1].replace(/\+/g, " "));
		},

		init: function() {
			var data = this.getParameterByName('data');
			if (data) {
				this.model.importData(data);
			}
			this.render();
		},

		dataGetter: function(text, title, callback, callback2) {
			$('#dialog-data-getter').dialog('destroy');
			$( '#dialogs' ).html('\
				<div id="dialog-data-getter" title="' + title + '">'

					+ text +

					'<div  style="width: 340px; height: 300px" id=video-display-window>\
					</div>\
					<div id="qr-status-tx"></div>\
				</div>'
			);
			var opt = {
				autoOpen: false,
				modal: false,
				width: 380,
				height:420,
				hide:'fade',
				show:'fade'
			};
			$('#dialog-data-getter').dialog(opt);
			$('#dialog-data-getter').css({
				'border': '1px solid #b9cd6d',
				'background':'#b9cd6d', 
				'border': '1px solid #b9cd6d', 
				'color': '#FFFFFF', 
				'title': 'Details',
				'font-weight' : 'bold'
			});
			$('#dialog-data-getter').dialog('open')
			//video
			$('div[id=video-display-window]').html5_qrcode(function(code){
				if (callback(code) == true) {
					localMediaStream.stop();
					localMediaStream.src = null;
					localMediaStream.mozSrcObject = null;
					localMediaStream = null;
					setTimeout(function(){
						$('#dialog-data-getter').dialog('destroy');
						$('#dialog-data-getter').empty();
					}, 4000);
					$('#dialog-data-getter').append('<h4 style="position:absolute;top:100px;color:red;word-break:break-all">' + code + '</h4>');
					callback2();			
				}
			},
			function(error) {
				console.log('error');
			}, 
			function(error) {
				console.log('error');
			});

			$('[title=Close]').click(function(){
				if (typeof(localMediaStream) != 'undefined' && localMediaStream) {
					localMediaStream.stop();
					localMediaStream.src = null;
					localMediaStream.mozSrcObject = null;
					localMediaStream = null;
				}
			})
		},

		render: function() {
			if (typeof(localMediaStream) != 'undefined' && localMediaStream) {
				localMediaStream.stop();
				localMediaStream.src = null;
				localMediaStream.mozSrcObject = null;
				localMediaStream = null;
			}
			var master = this;
			this.model.findAddress();
			$('Title').html('Multisig');
			$('#contents').html(this.template({
				pubkeys:master.model.pubkeys,
				multisig:master.model.multisig,
				recipients:master.model.recipients,
				balance:master.model.balance,
				unspents:master.model.unspents,
				numberOfSignatures:master.model.numberOfSignatures
			}));
			$('div[id=contents]').css('border','2px solid black');
			this.renderAddress();
			var hash = sjcl.codec.base64.fromBits(sjcl.hash.sha256.hash(JSON.stringify(this.model.exportLinkData()))).toString().slice(0,20);
			if ((hash != '5m7n0AV4A1joXBDgkg56') && ( hash !='t4Wnyse6w/XlcRH4WLvw')) {
				this.updateUnspent();
			}
		},

		renderAddress: function() {
			$('select[name=number-of-signatures]').val(this.model.numberOfSignatures);
			console.log(this.model.multisig )
			if (this.model.multisig == {}) {

				return
			};
			if (this.model.multisig.address) {
				console.log($('[name=multisig-address]'))
				$('[name=multisig-address]').val(this.model.multisig.address);
				//'Balance: ' + (this.model.balance ? this.model.balance/100000000 + ' BTC' : 'No Data')
				$('[name=multisig-balance]').val(this.model.balance ? this.model.balance/100000000 + ' BTC' : '0 BTC');
			} else {
				//$('[name=multisig-adderess]').html('');
			}
		},

		renderPubkey: function(field) {
			master = this;
			if (this.model.pubkeys[field].pubkey && this.model.pubkeys[field].pubkey!='unknown') {
				$('span[id=' + field + '][name=pubkey-field-title]', this.el).css('background-color','green').css('color','white')
			} else {
				$('span[id=' + field + '][name=pubkey-field-title]', this.el).css('background-color','#EEE').css('color','black')
			}
			$('input[id=' + field + '][name=entry-field]', this.el).val(this.model.pubkeys[field].address)
			this.model.findAddress();
			master.renderSelect();
			master.updateUnspent();
			master.renderAddress();
		},

		renderSelect: function() {
			var template = _.template("\
				<% _.each(_.without(_.pluck(pubkeys,'pubkey'),'','unknown'), function(pubkey, index) {%>\
						<option value='<%=index+1%>'><%=index+1%></option>\
					<%})%>\
			");
			$('select[name=number-of-signatures]',this.el).html(
				template(
					{
						pubkeys : this.model.pubkeys
					}
				)
			);
		},

		updateNumberOfSignatures: function() {
			this.model.numberOfSignatures = $('select[name=number-of-signatures]').val()
			$('div[name=multi-address]', this.$el).children().remove();
			this.renderAddress();
			this.updateUnspent();
		},

		drawMutlisigData: function() {

			this.model.findAddress();
			data = JSON.stringify(this.model.multisig)
			text = '<h4>This QRCode contains your Multisig</h4>'
			title = 'Multisig'
			this.dialogQrCode(data, text, title)

		},

		drawMultisigAddress: function() {

			this.model.findAddress();
			var tex ='<h4 style="word-break:break-all">' + this.model.multisig.address + '</h4>'
			var data = this.model.multisig.address;
			this.dialogQrCode(data, tex, 'Multisig Address');

		},

		lookup: function(ev, field, inputValue) {
			this.model.multisig = {}
			this.model.pubkeys[field] = {}
			$('[name=multisig-address]').val('');
			$('[name=multisig-balance]').val('');
			var master = this;
			var field = ev ? parseInt(ev.currentTarget.id) : field; 
			var inputValue = ev ? ev.currentTarget.value : inputValue;
			var savedPubkey = this.model.pubkeys[field]

			//The input is an address

			if (cryptoscrypt.validAddress(inputValue)) {
				if (cryptoscrypt.pubkeyToAddress(this.model.pubkeys[field].pubkey) == this.model.pubkeys[field].address) {
					return
				}
				if ((savedPubkey.address == inputValue) && (savedPubkey.pubkey)) {
					master.renderPubkey(field);
				}
				master.model.resolvePubKey(inputValue,field).done(function(){
					if(!savedPubkey.pubkey) {
						//window.alert('Impossible to find the public key for this address. You should enter the public key, or use an address that has already spent.')
						$('div[name=alert-pubkey][id=' + field + ']').html('<h5 style="margin-top:0px;margin-bottom:5px;color:red">Impossible to find the public key for this address. You should enter the public key, or use an address that has already spent.</h5>')
						master.model.multisig = {}
						savedPubkey.pubkey = 'unknown';
						savedPubkey.onename = inputValue;
												
						return

						master.showData(false, field);
						$('[name=multisig-address]').val('');
						$('[name=multisig-balance]').val('');
						master.renderPubkey(field);
					}
					master.renderPubkey(field);
				})
				master.updateUnspent();
				return
			}
			//The input is a public key
			if (inputValue && cryptoscrypt.pubkeyToAddress(inputValue)) {
				master.model.pubkeys[field].pubkey = inputValue;
				master.model.pubkeys[field].address = cryptoscrypt.pubkeyToAddress(inputValue);
				this.updateUnspent();
				master.renderPubkey(field);
				return
			}
			//The input is anything else
			if (inputValue) {
				this.model.resolveOnename(inputValue, field, master.model.dataToPubkeys, this.model).done(function() {
					if (master.model.pubkeys[field].address) {
						master.renderPubkey(field);
						master.lookup(false, field, master.model.pubkeys[field].address);
					}
				})
				return
			} else {
				master.model.clearField(field);
				master.render();
			}
		},

		showData: function(ev, field) {
			var field = ev ? parseInt(ev.currentTarget.id) : field;
			var data = $('h5[name=pubkey-display][id=' + field + ']').text() ;//? '' : this.model.pubkeys[field].pubkey;
			data = data == 'unknown' ? 'Unknown public key, please provide the public key, or use an address that already had a transaction sent from.' : data;
			$('[name=pubkey-display][id=' + field + ']').text(data)
		},

		importMultisig: function(ev) {
			var master = this;

			var callback = function(data) {
				jaison = JSON.parse(data);
				var redeemscript = jaison.redeemscript;
				var calculatedAddress = cryptoscrypt.getMultisigAddressFromRedeemscript(redeemscript);
				var readAddress = jaison.address;
				if (calculatedAddress == readAddress) {
					master.model.loadRedeemscript(redeemscript);
					return true
				}
			};
			var callback2 = function() {
				master.render()
			};

			this.dataGetter('Multisig', 'Enter your multisig Data QrCode here', callback, callback2)
		}
	});

	return MultisigView;
});
