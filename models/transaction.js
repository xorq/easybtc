	define([
	'jquery',
	'underscore',
	'backbone',
	'models/bitcoin',
	'models/bitcoinjs.min',
	'models/biginteger',
], function($, _, Backbone,Bitcoin, Bitcoinjs, BigInteger) {
	function Transaction() {
		this.guidance = false;
		this.from = '';
		this.checkedFrom = '';
		this.thumbFrom = '';
		this.recipients = [ { address:'', amount:0, checkedAddress:'', thumb:'' } ];
		this.fee = 10000;
		this.passphrase = '';
		this.salt = '';
		this.balance = 0;
		this.unspents = [ { } ];
		this.qrcode = '';
		this.feeMode = 'auto';
		this.showImportQR = false;
		this.signAddress = "";
		this.expectedField = undefined;
		this.hash = '';
		this.purpose = '';
		this.advanced = false;
		this.tfa = false;
		this.redeemscript = '';
		this.signatures = {computer:[],mobile:[]};
		this.tinyLink = ''

		this.buildMultisigTx = function() {
			return cryptoscrypt.buildTx(
				_.pluck(master.unspents, 'transaction_hash'),
				_.pluck(master.unspents, 'transaction_index'),
				_.pluck(master.unspents, 'value'),
				_.pluck(master.recipients, 'address'),
				cryptoscrypt.getMultisigAddressFromRedeemscript(master.redeemscript),
				_.pluck(master.recipients, 'amount'),
				master.fee
			);
		}

		this.buildMultisig = function() {
			var master = this;
			console.log(master.signatures);
			var dummyPkey = Bitcoinjs.ECKey.fromWIF('5KYZdUEo39z3FPrtuX2QbbwGnNP5zTd7yyr2SC1j299sBCnWjss');
			
			// Unsigned tx
			var tx = this.buildMultisigTx();
			console.log(tx[0].toHex());
			var rawTx = tx[0].toHex();

			var tx = Bitcoinjs.Transaction.fromHex(rawTx);
			var txb = Bitcoinjs.TransactionBuilder.fromTransaction(tx);
			console.log(txb);
			// Perform the signatures
			_.each(txb.tx.ins, function(input, inputIndex) {
				txb.sign(inputIndex, dummyPkey, Bitcoinjs.Script.fromHex(master.redeemscript));
				var sigArray = _.map([master.signatures.computer, master.signatures.mobile], function(data) {
						console.log(data[inputIndex])
						console.log(new Bitcoinjs.ECSignature.fromDER(new BigInteger.fromHex(data[inputIndex]).toBuffer()))
						return new Bitcoinjs.ECSignature.fromDER(new BigInteger.fromHex(data[inputIndex]).toBuffer());
				});
				console.log(sigArray);
				//if (sigArray[inputIndex]) {
					console.log('ok')
					_.each(sigArray, function(sig, sigNumber) {
						txb.signatures[inputIndex].signatures[sigNumber] = (sigArray[sigNumber]);
					})
					//txb.signatures[inputIndex].signatures[0] = (sigArray[0]);
					//txb.signatures[inputIndex].signatures[1] = (sigArray[1]);
				//}
				console.log(txb);
			});
			console.log(txb);
			//Mapping every signatures that are present into the transaction object
			/*console.log	({0:master.signatures.computer, 1:master.signatures.mobile})
			_.each({0:master.signatures.computer, 1:master.signatures.mobile}, function(signatures, signaire) {
				console.log(signaire);
				console.log(txb);
				console.log(txb.signatures[signaire]);
				txb.signatures[signaire].signatures = [];
				console.log(txb.signatures[signaire]);
				if (signaire < 1) {
					console.log('entered the field')
					console.log(signatures);
					var sigArray = _.map(signatures, function(data) {
						console.log(data)
						console.log(new Bitcoinjs.ECSignature.fromDER(new BigInteger.fromHex(data).toBuffer()))
						return new Bitcoinjs.ECSignature.fromDER(new BigInteger.fromHex(data).toBuffer());
					});
					console.log(sigArray);

					_.each(txb.tx.ins, function(input, index) {
						if (sigArray[index]) {
							txb.signatures[index].signatures[signaire] = (sigArray[index]);
						}
					});
					console.log(txb);
				}
			})*/
			var result = txb.build().toHex();
			return result;
			console.log(result);
		}

		this.multiSign = function(device, passphrase, salt) {

			var tx = cryptoscrypt.buildTx(
				_.pluck(this.unspents, 'transaction_hash'),
				_.pluck(this.unspents, 'transaction_index'),
				_.pluck(this.unspents, 'value'),
				_.pluck(this.recipients, 'address'),
				cryptoscrypt.getMultisigAddressFromRedeemscript(this.redeemscript),
				_.pluck(this.recipients, 'amount'),
				this.fee
			);

			var warp = cryptoscrypt.warp(passphrase, salt)
			var pkey = warp[0]
			//Sign
			var signingAddress = warp[1];
			if (this.getTotal()>this.balance) {
				window.alert('There is not enough money available');
				return;
			}
			console.log(this.unspents)
			console.log(this.recipients)
			console.log(cryptoscrypt.getMultisigAddressFromRedeemscript(this.redeemscript))
			// Build the unsigned transaction;

			this.rawTx = tx[0].toHex()
			var tx = Bitcoinjs.Transaction.fromHex(tx[0].toHex());
			var txb = Bitcoinjs.TransactionBuilder.fromTransaction(tx);

			// Perform the signatures
			console.log(pkey)
			pkey = Bitcoinjs.ECKey.fromWIF(pkey);
			console.log(pkey);
			//master.signatures.computer = [];
			_.each(txb.tx.ins, function(data, index) {
				txb.sign(index, pkey, Bitcoinjs.Script.fromHex(master.redeemscript));
				// Save the signatures in the signatures object
				if (device == 'computer') {
					master.signatures.computer[index] = txb.signatures[index].signatures[0].toDER().toString('hex');
				}
				if (device == 'mobile') {
					master.signatures.mobile[index] = txb.signatures[index].signatures[0].toDER().toString('hex');
				}
			});
			console.log(this.signatures);
			//get the signature from the qrcode

			//do the multisig
		}

		this.signMultisig = function(pkey, field) {
			var master = this;

			var signingAddress = cryptoscrypt.WIFToAddress(pkey);
			/*if (signingAddress != this.pubkeys[field].address){
				window.alert('You entered the password/private key for the address "' + signingAddress + '", therefore this signature is invalid')
			}*/
			this.findAddress();
			if (this.getTotal()>this.balance) {
				window.alert('There is not enough money available');
				return;
			}

			// Build the unsigned transaction;
			var tx = cryptoscrypt.buildTx(
			  _.pluck(this.unspents, 'transaction_hash'),
			  _.pluck(this.unspents, 'transaction_index'),
			  _.pluck(this.unspents, 'value'),
			  _.pluck(this.recipients, 'address'),
			  this.multisig.address,
			  _.pluck(this.recipients, 'amount'),
			  this.fee
			);
			this.rawTx = tx[0].toHex()
			var tx = Bitcoin.Transaction.fromHex(tx[0].toHex());
			var txb = Bitcoin.TransactionBuilder.fromTransaction(tx);

			// Perform the signatures
			this.multisig;
			pkey = Bitcoin.ECKey.fromWIF(pkey);
			result = [];
			_.each(txb.tx.ins, function(data, index) {
				txb.sign(index, pkey, Bitcoin.Script.fromHex(master.multisig.redeemscript));
				// Save the signatures in the signatures object
				result.push(txb.signatures[index].signatures[0].toDER().toString('hex'));
			});
			return 
		},

		this.exportLinkDataForTinyUrl = function() {
			var master = this;
			var recipientsExport = [];
			this.recipients.forEach(function(v){ 
				recipientsExport.push(_.pick(v,'address','amount'));
			});

			unspentExport = [];
			this.unspents.forEach(function(v){ 
				unspentExport.push(_.pick(v,'transaction_hash','value','transaction_index'));
			});

			var data = {
				recipients : recipientsExport,
				from: master.from,
				unspents: unspentExport,
			};
			if (this.tfa) {
				data.redeemscript = this.redeemscript;
			}
			data = JSON.stringify(data);
			return data
		},

		this.nextData = function() {
			return JSON.stringify({
				recipients : [ { address:'', amount:0, checkedAddress:'', thumb:'' } ],
				from : this.recipients[0].address,
				unspents : [{
					'transaction_hash' : this.hash,
					'value': this.recipients[0].amount,
					'transaction_index' : 0
				}]
			})
		},

		this.importData = function(code) {
			var jsonCode = JSON.parse(code);
			console.log(jsonCode.unspent)//_.pluck(jsonCode.unspents, 'value'));
			if (jsonCode.recipients) { this.recipients = jsonCode.recipients };
			if (jsonCode.unspents) { this.unspents = jsonCode.unspents };
			if (jsonCode.redeemscript) { this.redeemscript = jsonCode.redeemscript }
			this.balance = cryptoscrypt.sumArray(_.pluck(jsonCode.unspents, 'value'));
			this.from = jsonCode.from;
		},

		this.exportData = function() {
			recipientsExport = [];
			this.recipients.forEach(function(v){ 
			recipientsExport.push(_.pick(v,'address','amount'));
			});
			unspentExport = [];
			this.unspents.forEach(function(v){ 
				unspentExport.push(_.pick(v,'transaction_hash','value','transaction_index'));
			});
			data = {
				recipients : recipientsExport,
				from : this.from,
				unspents : unspentExport
			};
			return JSON.stringify(data);

		}

		this.getJSONrequest = function(url,success,fail) {
			return $.ajax({
				url: url,
				dataType: 'json',
				success: success,
				error: fail
			});
		}

		this.changeFeeMode = function() {
			var modes = [ 'auto', 'custom' ];
			this.feeMode = modes[ (modes.indexOf(this.feeMode) + 1) % modes.length ];
		}

		this.glyphiconClass = function(address) {

			return (cryptoscrypt.validAddress(address)) ? 
				'glyphicon glyphicon-ok form-control-feedback' : (address) ? 
					'glyphicon glyphicon-remove form-control-feedback' : ''
		}

		this.addRecipient = function() {
			this.recipients.push({ address : '', amount : 0 });
		}

		this.addSender = function(from) {
			this.from = from;
		}

		this.removeRecipient = function(index) {
			if (this.recipients.length>1) {
				this.recipients.splice(index, 1);
			} else {
				this.recipients=[ { address:'', amount:0, checkedAddress:'', thumb:'' } ];
			}
			
		}

		this.pushTransaction = function() {
			// todo
		}

		this.data = function() {
			return {
				from : this.from,
				thumbFrom : this.thumbFrom,
				balance : this.balance,
				recipients : this.recipients,
				fee : this.fee,
				passphrase : this.passphrase,
				salt : this.salt,
				getFee : this.getFee(),
				total : this.getTotal(),
				qrcode : this.qrcode,
				feeMode : this.feeMode,
				guidance : this.guidance,
				showImportQR: this.showImportQR,
				qrPartials: this.qrPartials,
				qrTotal: this.qrTotal,
				qrParts: this.qrParts,
				signAddress: this.signAddress,
				purpose: this.purpose,
				signed: this.hash && true,
				advanced: this.advanced,
				tfa: this.tfa,
				successClass: function(address) {return cryptoscrypt.validAddress(address) ? 'has-success' : (address ? 'has-error' : '')}
			};
		}

		this.export = function() {

			var data = this.exportData();
			var chunkLength = 150;
			var fullCheck = sjcl.hash.sha256.hash(data)[0];
			var numChunks = Math.ceil(data.length / chunkLength);
			chunkLength = Math.ceil(data.length / numChunks);
			var chunks = [];
			_.times(Math.ceil(data.length/chunkLength), function(i) {
				chunks.push(
					JSON.stringify(
						{
							i: i,
							t: numChunks,
							d: data.substr(i * chunkLength, chunkLength),
							c: fullCheck,
							p: sjcl.hash.sha256.hash(data.substr(i * chunkLength, chunkLength))[0]
						}
					)
				)
			});

			return chunks
		}

		this.newImport = function() {
			this.qrPartials = {};
			this.qrTotal = 0;
			this.qrParts = 0;
			this.lastQrCode = false;
		},

		this.import = function(data) {
			var master = this;
			isAddress = cryptoscrypt.validAddress(data);
			if (isAddress) {
				if (master.expectedField == 'from') {
					master.from = data
				} else {
				master.recipients[master.expectedField].address = data;
				}
				return true;
			}
			try {
				var qrData = JSON.parse(data);
				console.log('parse OK');

			} catch (e) {
				console.log("Couldn't parse JSON");
				return;
			}
			if (!qrData) {
				console.log("Invalid QR data, aborting");
				return;
			}
			if (this.lastQrCode && this.lastQrCode.c != qrData.c) {
				console.log("Checksum doesn't match previous QR code, ignoring this code");
				return;
			}
			console.log('caca')
			console.log(sjcl.hash.sha256.hash(qrData.d)[0])
			console.log(qrData.p)
			if (qrData.p != sjcl.hash.sha256.hash(qrData.d)[0]) {
				console.log("invalid checksum for this qrcode");
				return;
			}

			if (!this.qrPartials[qrData.i]) {
				this.qrParts++;
				this.qrPartials[qrData.i] = qrData;
				this.lastQrCode = qrData;
			}
			this.qrTotal = qrData.t;
			console.log(this.qrPartials);

			var code = _.reduce(this.qrPartials, function(code, chunk) { return code + chunk.d; }, '');
			var check = sjcl.hash.sha256.hash(code);
			if (check[0] != qrData.c) {
				console.log('invalid code checksum or missing pieces');
				return;
			}
			var jsonCode = JSON.parse(code);
			console.log(jsonCode);

			this.recipients = jsonCode.recipients;
			this.from = jsonCode.from;
			this.unspents = jsonCode.unspents;
			this.balance = cryptoscrypt.sumArray(_.pluck(this.unspents, 'value'));
			console.log(this.balance);
			console.log(this.unspents);
			console.log(_.pluck(this.unspents, 'value'))
			return true;
		}

		this.putAll = function(recipientId) {
			var outputAmounts = [];
			var master = this;
			var sumAmounts = cryptoscrypt.sumArray( 
				_.pluck(this.recipients, 'amount')
			 );
			this.recipients[recipientId][ 'amount' ] = parseInt(this.balance - sumAmounts - this.fee + this.recipients[recipientId][ 'amount' ]);
		}

		this.fromData = function(data) {
			this.from = data.from;
			this.recipients = data.recipients;
			this.fee = data.fee;
			this.passphrase = data.passphrase;
			this.salt = data.salt;
		}

		this.getFee = function() {

			try {
				master = this;
				if (this.from == '') { return 0 }
				if (this.feeMode == 'custom') {
					return this.fee
				}
				if (this.unspents.length>0) {
					var numOfInputs = cryptoscrypt.bestCombination(
						_.pluck(this.unspent, 'transaction_index'),
						master.getTotal()
					).length;
					this.fee = parseInt(( 140 * numOfInputs + 100 * this.recipients.length + 150 ) / 1000) * 10000 + 10000;
				};
				return this.fee;
				//this.updateTotal();
			} catch(err) {
				return 0
			}
		}

		this.getTotal = function() {
			try {
				return cryptoscrypt.sumArray(
					_.pluck(this.recipients, 'amount')
					)+this.fee
			} catch(err) {
				return 0
			}
		}

		this.doChain = function(numberOfTransactions) {

			//Initialize result variable
			var resa = {
				changeAddresses:[],
				results : [],
				recovery : []
			};

			var nextHash = function(resa, passphrase, salt, hashRedeemed, index, valueRedeemed, recipientAddress, stepValue, fee, numberOfTransactions, previousNextPkey ) {
				
				// Find what amounts are : withdrawn at this step and leftover
				//stepValue = typeof(stepValue) == 'object' ? stepValue[0] : stepValue;
				stepValue = Math.min((cryptoscrypt.sumArray(valueRedeemed) - fee), (stepValue) );
				var newValue = cryptoscrypt.sumArray(valueRedeemed) - (fee + stepValue);
				var isReallyLast = (newValue <= 0)

				//get the private keys:

				var pkey = previousNextPkey ? previousNextPkey : cryptoscrypt.getPkey(passphrase, salt);
				var nextPkey = isReallyLast ? '' : cryptoscrypt.getPkey(passphrase + (1 + resa.results.length) , salt);
				var changeAddress = isReallyLast ? '' : cryptoscrypt.pkeyToAddress(nextPkey);

				//Is this the last transaction?
				var isLast = ((newValue <= 0) || (numberOfTransactions <= resa.results.length));
					//Is there any money left for another transaction
				
				//Generate the transaction and sign, then get the hash
				var tx = cryptoscrypt.buildTx(
					hashRedeemed,
					(isReallyLast ? [0] : index),
					[cryptoscrypt.sumArray(valueRedeemed)],
					recipientAddress,
					changeAddress,
					[stepValue],
					fee,
					true
				);
				var signedTx = cryptoscrypt.signRawTx(tx[0].toHex(), pkey)
				var newHash = signedTx.hash;

				//Push results to the result variable
				resa.changeAddresses.push(changeAddress);
				resa.results.push(signedTx.raw);


				//
				if (!isLast) {
				// This is a recovery transaction generator, it is a double safety in case the password is forgotten, not used for now.
				/*	var txRecovery = cryptoscrypt.buildTx(
						[newHash],
						[1],
						[newValue],
						[master.from],
						changeAddress,
						[newValue - fee],
						fee,
						true
					);
					var signedRecovery = cryptoscrypt.signRawTx(txRecovery[0].toHex(), nextPkey)
					resa.recovery.push(signedRecovery.raw);
				*/
					nextHash(resa, passphrase, salt, [newHash], [1], [newValue], recipientAddress, stepValue, fee, numberOfTransactions, nextPkey)
				}
			}
			// Calculate how much is 
			var stepValue = _.pluck(this.recipients, 'amount')[0];
			if (this.recipients.length > 1) {
				window.alert('Chains are only supported with one recipient');
				return
			};
			var numberOfTransactions = window.prompt('How many transactions would you like ? (Ignore or cancel for spending all the funds)');
			numberOfTransactions = isNaN(parseInt(numberOfTransactions)) ? 100 : parseInt(numberOfTransactions) - 1 
			
			if (numberOfTransactions > 10) {
				var answer = window.confirm( 'This might take over ' + ( (10 * Math.min(Math.ceil(cryptoscrypt.sumArray(_.pluck(this.unspents, 'value')) / stepValue), numberOfTransactions))) + ' secondes on a regular computer, do you want to continue anyways?')
				if (answer == false) {
					return
				}
			}
			nextHash(
				resa,
				this.passphrase,
				this.salt,
				_.pluck(this.unspents, 'transaction_hash'),
				_.pluck(this.unspents, 'transaction_index'),
				_.pluck(this.unspents, 'value'),
				_.pluck(this.recipients, 'address'),
				_.pluck(this.recipients, 'amount')[0],
				this.fee,
				numberOfTransactions
			)
			return resa;
		},

		this.sign = function(passphrase, salt) {

			var master = this;

			_.each(cryptoscrypt.brainwallets(passphrase),function(pass, index) {
				if (pass.pub.getAddress().toString() == master.from) {
					passphrase = pass.toWIF();
				};
			});

			if (this.getTotal()>this.balance) {
				window.alert('There is not enough money available');
				return 'There is not enough money available';
			}

			// Build the unsigned transaction;

			var tx = cryptoscrypt.buildTx(
				_.pluck(this.unspents, 'transaction_hash'),
				_.pluck(this.unspents, 'transaction_index'),
				_.pluck(this.unspents, 'value'),
				_.pluck(this.recipients, 'address'),
				this.from,
				_.pluck(this.recipients, 'amount'),
				this.fee
			);

				/*console.log(_.pluck(this.unspents, 'transaction_hash'))
				console.log(_.pluck(this.unspents, 'transaction_index'))
				console.log(_.pluck(this.unspents, 'value'))
				console.log(_.pluck(this.recipients, 'address'))
				console.log(this.from)
				console.log(_.pluck(this.recipients, 'amount'))
				console.log(this.fee)
				*/

			// Display unsigned transaction
			console.log(tx[0].toHex());
			
			// Calculate the private key;
			var pkey = cryptoscrypt.getPkey(passphrase, salt);
			this.signAddress = cryptoscrypt.pkeyToAddress(pkey);
			cryptoscrypt.pkeyToAddress(pkey);
			txs = cryptoscrypt.signTx(tx, pkey);
			console.log(txs.hash)
			// Perform the signatures
			//newHash = cryptoscrypt.getHashFromTx(tx)
			//Create the QR code
			this.qrcode = txs[0].toHex().toString();

			// Show the signed transaction Hex
			//console.log(txs[0]);
			//console.log(txs[0].toHex());
			master.hash = cryptoscrypt.getHashFromTx(txs[0].toHex());
		}

		this.updateUnspent = function(from, success, fail) {
			return this.getJSONrequest('https://api.biteasy.com/blockchain/v1/addresses/' + from + '/unspent-outputs?per_page=100&callback=?refreshSection', success, fail);
		}

		this.updateUnspentOnion = function(from, success, fail) {
			return this.getJSONrequest('https://blockchainbdgpzk.onion/unspent?active=' + from + '&cors=true', success, fail);
		}

		this.updateBalance = function() {
			var master = this;
			if (!this.from){
				return
			}
			
			var successFunction = function(data) {
				master.unspents = data.data.outputs;
				//master.unspents = [{"transaction_hash":"7f5683a5ffbfa133867a9e72a3fc92ad35f1c1079d285154af8c619790b4f161","value":32916835,"transaction_index":1}];
				if ((master.unspents[0]) && master.unspents[0].value) {
					master.balance = cryptoscrypt.sumArray(_.pluck(master.unspents, 'value'))
				}
				def.resolve();
			};

			var successFunctionOnion = function(data) {
				master.unspents = data.unspent_outputs;
				if ((master.unspents[0]) && master.unspents[0].value) {
					master.balance = cryptoscrypt.sumArray(_.pluck(master.unspents, 'value'))

					//Rename keys to match
					b = [];
					var map = {
						tx_hash : "transaction_hash",
						value : "value",
						tx_output_n : "transaction_index",
					};
					master.unspents.forEach( function(value, index) {
						block = {};
						_.each(master.unspents[index], function(value2, key) {
							key = map[key] || key;
							block[key] = value2;
						})
						b[index] = block;
					});
					master.unspents = b;
				}

				def.resolve();
			};


			var failFunction = function() {
				master.unspents = [{"transaction_hash":"7f5683a5ffbfa133867a9e72a3fc92ad35f1c1079d285154af8c619790b4f161","value":32916835,"transaction_index":1}]
				return master.updateUnspentOnion(
					master.from,
					successFunctionOnion,
					function() {
						console.log('Unable to fetch address data');
						return def.reject;
					})
			};

			var url = 'https://api.biteasy.com/blockchain/v1/addresses/' + this.from + '/unspent-outputs?per_page=100';
			var def = $.Deferred()

			this.getJSONrequest(url, successFunction, failFunction);

			return def
		}
		

		this.lookup = function(field,dataId,inputValue,thumb) {
			var master = this;
			var address = inputValue;
			var currentThumb = thumb ? thumb : '';
			// If nothing
			if (inputValue == '') {
				return $().promise(); 
			}

			// Stop function if nothing has changed
			check = (field == 'sender') ? this.checkedFrom : master.recipients[dataId].checkedAddress;
			if (inputValue == check) {
				return $().promise();
			}

			//reset values if anything changed
			if (field == 'sender') {
				this.balance = '';
				//this.from = inputValue; this is already done on keydown
				this.thumbFrom = currentThumb;
			} 

			if (field == 'to') {
				//this.recipients[dataId].address = inputValue; This is already done on keydown
				this.recipients[dataId].thumb = currentThumb;
			} 

			//If address is already valid
			if (cryptoscrypt.validAddress(inputValue)) {
				if (field == 'sender') {
					this.from = address;
					this.thumbFrom = currentThumb;
					// If we are in 2FA, but the address doesnt match the redeemscript, return an error
					if (master.tfa && (address != cryptoscrypt.getMultisigAddressFromRedeemscript(this.redeemscript))) {
						window.alert('You have to put a 2FA Vault here, not an address')
						this.from = '';
						return $().promise();
					}
					this.updateBalance().done();
				} 
				if (field == 'to') {
					this.recipients[dataId].address = inputValue;
					this.recipients[dataId].thumb = currentThumb;
				}
				return $().promise();
			}
			// If not valid address, check if it is a 2FA

			if (master.tfa && cryptoscrypt.validAddress(cryptoscrypt.getMultisigAddressFromRedeemscript(address))) {
				master.redeemscript = address;
				address = cryptoscrypt.getMultisigAddressFromRedeemscript(address);
				$('[name=sender]').val(address);
				master.from = address;
				master.checkedFrom = address;
				return $().promise();
			}
				
			// Lookup on onename.io, since everything else has failed
			return $.getJSON('https://onename.com/' + inputValue + '.json').done(function(data) {
				address = data.bitcoin.address ? data.bitcoin.address : '';
				if (data.avatar) {
					currentThumb = data.avatar.url
					if (field == 'sender') {
						master.thumbFrom = currentThumb;
					} else {
						master.recipients[dataId].thumb = currentThumb;
					}
				};

				// Double check that whatever onename.io sent is valid

					/*if (cryptoscrypt.validAddress(address)) {
						if (field == 'sender'){
							master.from = address;
							master.checkedFrom = address;
						};
						if (field.substring(0,2) == 'to'){
							master.recipients[dataId].address = address;
							master.recipients[dataId].checkedAddress = address;
						};
					}*/
				return master.lookup(field, dataId, address, currentThumb)
			})
		}
	}
	return Transaction;
});

