	define([
	'jquery',
	'underscore',
	'backbone',
	'models/bitcoinjs.min',
	'models/biginteger'
], function($, _, Backbone, Bitcoin, BigInteger) {
	function Multisig() {
		this.test = '';
		this.pubkeys = [{ address : '', pubkey : '', thumb : '', onename : '', avatar : '' } , { address : '', pubkey : '', thumb : '', onename : '', avatar : '' }];
		this.expectedField = undefined;
		this.multisig = {};
		this.balance = 0;
		this.unspents = [];
		this.signatures = {};
		this.numberOfSignatures = 1;
		this.fee = 10000;
		this.recipients = [ { address : '', amount : '', checkedAddress : '', thumb : '' } ];
		this.tx = {};
		this.rawTx = '';

		this.testOut = function() {
			this.resetAll();
			this.importData('{"recipients":[{"address":"1Xorq87adKn12bheqPFuwLZgZi5TyUTBq","amount":89133535}],"unspents":[{"transaction_hash":"fa2021dff72c0b08ad8f4056c9ea3515c2e034c32359f6e09b169033c7a6a6cb","value":990000,"transaction_index":0},{"transaction_hash":"e2f038a256d71b6c32cb3bb5b4f63d2b91aeae7dc9ca50ac3e45d66606847cb1","value":1990000,"transaction_index":1},{"transaction_hash":"acb4637d140ca8e94dee6f2d67cc3f810f68a49de282c2bb5712d3f90f4395d2","value":10719535,"transaction_index":1},{"transaction_hash":"267c037f8c1c9113e91768a74c6f44e37043a962a2c8e6250214d2b96caa4520","value":74144000,"transaction_index":23},{"transaction_hash":"0a11b09a638b79e2753c8844dd00b79a315f4d3d3ded47c5fe697fef682e39c4","value":1300000,"transaction_index":0}],"redeemscript":"524104dedf0b95880044bec816c25404ce7dbac265bb79f73a0880e1d1237200f28c57c5d13975f3a045be6f6c6db984ecfbe20c62d12203de7f483fd482e2435e2f224104567be2411c1ef05b252c0cf3b37f74e5a88b4088192007d4599dbbf35974ebb1026b54152c430ceebc12d6c3f3ac2b04055b3639a6f7b7d63f3011dc3879fc0e41040e7f8b80cc21fb9b30aacfe96fad7d2c2211a17a554d1050262d759e09b8012f7d60bdbc3cb5d99825a9eaaa7fed65f48de7dec157c5d97cd75315c11992546b53ae","signatures":{"0":["304402203edbb257eb70a65363cbcc4e3342c5032cf5eeb00bdc1f0e3b256830fe5727850220679000b82524a306ea47e7ba5d797bd16dc8ecb5e974871317086c0344ff9101","3045022100d93c7b92a99444fb06231afb3edee82f5db6756ad4ae3c0bdaa8a83c0402eb62022018b45e451b698b9661b7ba7071e541cd0f9642c64114ec6e60da6c3001cb6998","3045022100a844d3104558085ee762a8e84def9f30e10dc443b138343df7b3b852a29d9bf7022033d7551d6755963a1a04635f5e376700d4d31b2fe6e01f56be287c0006134806","304502210092dce55a1a4b6bcf65def1eff61d4fa0646ef63dc9f091114690b701f790f39e022068d3dfcc1d1d170ba17a38f9b9d2bfba7efa5740e761aa88285cd6005f099e20","304402203a9696547d9a38c674f40032a189960a0c22db28dd6b35dc9b4596263ba2bb80022069657baae8e1d3f599c20ca8ac57aed330e1c62e5cbdac0d74c03da3cd5ecae6"]}}')
			//[{"transaction_hash":"7f5683a5ffbfa133867a9e72a3fc92ad35f1c1079d285154af8c619790b4f161","value":32916835,"transaction_index":1}]
			//this.importData('{"recipients":[{"address":"1Xorq87adKn12bheqPFuwLZgZi5TyUTBq","amount":89133535}],"unspents":[{"transaction_hash":"7f5683a5ffbfa133867a9e72a3fc92ad35f1c1079d285154af8c619790b4f161","value":32916835,"transaction_index":1}],"redeemscript":"524104d9e0cb39d0672b99206f792db7a6ca6ffe3273a5d3bc3b96405a5cf40701f902d5291dba51567e48fae4c970fff325b5861bb7baedaac7b8008e6104ed26906e4104ffc46ca5879ade53a600edd155a44623a0ecc2801f37255c518e3f8b0410a794f3d1a211f8c578b6d6c089c0beb422cfc1b6f18299f7e9be35c82fe1d7f4cfb152ae","signatures":{"0":["304402203edbb257eb70a65363cbcc4e3342c5032cf5eeb00bdc1f0e3b256830fe5727850220679000b82524a306ea47e7ba5d797bd16dc8ecb5e974871317086c0344ff9101","3045022100d93c7b92a99444fb06231afb3edee82f5db6756ad4ae3c0bdaa8a83c0402eb62022018b45e451b698b9661b7ba7071e541cd0f9642c64114ec6e60da6c3001cb6998","3045022100a844d3104558085ee762a8e84def9f30e10dc443b138343df7b3b852a29d9bf7022033d7551d6755963a1a04635f5e376700d4d31b2fe6e01f56be287c0006134806","304502210092dce55a1a4b6bcf65def1eff61d4fa0646ef63dc9f091114690b701f790f39e022068d3dfcc1d1d170ba17a38f9b9d2bfba7efa5740e761aa88285cd6005f099e20","304402203a9696547d9a38c674f40032a189960a0c22db28dd6b35dc9b4596263ba2bb80022069657baae8e1d3f599c20ca8ac57aed330e1c62e5cbdac0d74c03da3cd5ecae6"]}}')

		},

		this.resetAll = function() {
			this.test = '';
			this.pubkeys = [{ address : '', pubkey : '', thumb : '', onename : '', avatar : '' } , { address : '', pubkey : '', thumb : '', onename : '', avatar : '' }];
			this.expectedField = undefined;
			this.multisig = {};
			this.balance = 0;
			this.unspents = [];
			this.signatures = {};
			this.numberOfSignatures = 1;
			this.fee = 10000;
			this.recipients = [ { address : '', amount : '', checkedAddress : '', thumb : '' } ];
			this.tx = {};
			this.rawTx = '';
		},

		this.deleteSignatures = function() {
			this.signatures = {}
		},

		this.buildMultisig = function() {
			//try {
				master = this;
				var dummyPkey = Bitcoin.ECKey.fromWIF('5KYZdUEo39z3FPrtuX2QbbwGnNP5zTd7yyr2SC1j299sBCnWjss');
				
				// Unsigned tx
				var tx = cryptoscrypt.buildTx(
				  _.pluck(this.unspents, 'transaction_hash'),
				  _.pluck(this.unspents, 'transaction_index'),
				  _.pluck(this.unspents, 'value'),
				  _.pluck(this.recipients, 'address'),
				  this.multisig.address,
				  _.pluck(this.recipients, 'amount'),
				  this.fee
				);
				console.log(tx[0].toHex());
				this.rawTx = tx[0].toHex();

				var tx = Bitcoin.Transaction.fromHex(this.rawTx);
				var txb = Bitcoin.TransactionBuilder.fromTransaction(tx);

				// Perform the signatures

				//Mapping every signatures that are present into the transaction object
				console.log(master.signatures)
				_.each(txb.tx.ins, function(input, inputIndex) {
					txb.sign(inputIndex, dummyPkey, Bitcoin.Script.fromHex(master.multisig.redeemscript));
					console.log(master.signatures)
					var sigArray = _.map(master.signatures, function(data) {
						console.log(data);
						console.log(data[inputIndex])
						console.log(new Bitcoin.ECSignature.fromDER(new BigInteger.fromHex(data[inputIndex]).toBuffer()))
						return new Bitcoin.ECSignature.fromDER(new BigInteger.fromHex(data[inputIndex]).toBuffer());
					});
					console.log(sigArray);
					//if (sigArray[inputIndex]) {
					console.log('ok')
					_.each(sigArray, function(sig, sigNumber) {
						txb.signatures[inputIndex].signatures[sigNumber] = (sigArray[sigNumber]);
					})
				})
				console.log(txb);
				var result = txb.build().toHex();
				console.log(result);
				return result;
			/*} catch(err) {
				console.log('error : ' + err)
				return false
			}*/
		},

		this.getTx = function() {
			var tx = cryptoscrypt.buildTx(
			  _.pluck(this.unspents, 'transaction_hash'),
			  _.pluck(this.unspents, 'transaction_index'),
			  _.pluck(this.unspents, 'value'),
			  _.pluck(this.recipients, 'address'),
			  this.multisig.address,
			  _.pluck(this.recipients, 'amount'),
			  this.fee
			)[0].toHex();
			this.rawTx = tx;
			return tx
		},

		this.getTotal = function() {
			try {
				return cryptoscrypt.sumArray(
					_.pluck(this.recipients, 'amount')
					)+this.fee
			} catch(err) {
				return 0
			}
		},

		this.sign = function(pkey, field) {
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
			//this.multisig;
			pkey = Bitcoin.ECKey.fromWIF(pkey);
			master.signatures[field] = [];
			_.each(txb.tx.ins, function(data, index) {
				txb.sign(index, pkey, Bitcoin.Script.fromHex(master.multisig.redeemscript));
				// Save the signatures in the signatures object
				master.signatures[field][index] = txb.signatures[index].signatures[0].toDER().toString('hex');
			});
		},

		this.importTx = function(data) {
			var master = this;
			console.log(data);
			try {
				console.log(data)
				var qrData = JSON.parse(data);
				checkSumInit = sjcl.hash.sha256.hash(JSON.stringify(_.omit(qrData, 'p')))[0];
				console.log(checkSumInit);
				console.log(qrData.p);
				if (parseInt(checkSumInit) != parseInt(qrData.p)) {
					console.log('Something wrong with the QR, try again!');
					return
				}
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
			this.unspents = jsonCode.unspents;
			this.balance = cryptoscrypt.sumArray(_.pluck(jsonCode.unspents, 'value'));
			this.multisig.redeemscript = jsonCode.redeemscript;
			this.loadRedeemscript(jsonCode.redeemscript);
			this.signatures = jsonCode.signatures
			return true;
		}

		this.newImport = function() {
			this.qrPartials = {};
			this.qrTotal = 0;
			this.qrParts = 0;
			this.lastQrCode = false;
		},

		this.importData = function(code) {
			var jsonCode = JSON.parse(code);
			if (jsonCode.recipients) { this.recipients = jsonCode.recipients};
			if (jsonCode.unspents) { this.unspents = jsonCode.unspents};
			if (jsonCode.redeemscript) {
				this.multisig.redeemscript = jsonCode.redeemscript;
				this.loadRedeemscript(this.multisig.redeemscript);
			}
			if (jsonCode.signatures) {
				this.signatures = jsonCode.signatures
			}
			this.balance = cryptoscrypt.sumArray(_.pluck(jsonCode.unspents, 'value'));
		},

		this.exportData = function() {
			this.findAddress();
			var master = this;
			var recipientsExport = [];
			this.recipients.forEach(function(v){ 
				recipientsExport.push(_.pick(v,'address','amount'));
			});
			var unspentExport = [];
			this.unspents.forEach(function(v){ 
				unspentExport.push(_.pick(v,'transaction_hash','value','transaction_index'));
			});
			var data = {
				recipients : recipientsExport,
				unspents : unspentExport,
				redeemscript : master.multisig.redeemscript,
				signatures: this.signatures //_.pluck(master.pubkeys, 'signature')
			};
			data = JSON.stringify(data);
			var CHUNKLENGTH = 250;
			var fullCheck = sjcl.hash.sha256.hash(data)[0];
			var numChunks = Math.ceil(data.length / CHUNKLENGTH);
			CHUNKLENGTH = Math.ceil(data.length / numChunks);
			var chunks = [];
			_.times(Math.ceil(data.length/CHUNKLENGTH), function(i) {
				var toCheckSum = JSON.stringify(
					{
						i: i,
						t: numChunks,
						d: data.substr(i * CHUNKLENGTH, CHUNKLENGTH),
						c: fullCheck
					}
				)
				var partialCheckSum = sjcl.hash.sha256.hash(toCheckSum)[0]
				
				var toPush = JSON.stringify(
					{
						i: i,
						t: numChunks,
						d: data.substr(i * CHUNKLENGTH, CHUNKLENGTH),
						c: fullCheck,
						p: partialCheckSum
					}
				)
				chunks.push( toPush )
			})
			;
			return chunks
		},

		this.exportLinkData = function() {
			var master = this;
			var recipientsExport = [];
			this.recipients.forEach(function(v){ 
				recipientsExport.push(_.pick(v,'address','amount'));
			});
			var unspentExport = [];
			this.unspents.forEach(function(v){ 
				unspentExport.push(_.pick(v,'transaction_hash','value','transaction_index'));
			});
			var data = {
				recipients : recipientsExport,
				unspents : unspentExport,
				redeemscript : master.multisig.redeemscript,
				signatures: this.signatures
			};
			data = JSON.stringify(data);
			return data
		},

		this.exportLinkDataForTinyUrl = function() {
			var master = this;
			var recipientsExport = [];
			this.recipients.forEach(function(v){ 
				recipientsExport.push(_.pick(v,'address','amount'));
			});
			var data = {
				recipients : recipientsExport,
				redeemscript : master.multisig.redeemscript,
				signatures: this.signatures
			};
			data = JSON.stringify(data);
			return data
		},

		this.putAll = function(field) {
			var firstAmount = this.recipients[field][ 'amount' ]
			var sumAmounts = cryptoscrypt.sumArray( 
				_.pluck(this.recipients, 'amount')
			);
			this.recipients[field][ 'amount' ] = Math.max(0, parseInt(this.balance - sumAmounts - this.fee + this.recipients[field][ 'amount' ]));
			if (this.recipients[field][ 'amount' ] != firstAmount) {
				this.deleteSignatures();
			}
		},

		this.getAddressUnspent = function() {
			var master = this;
			success = function(data) {
				if (!data){console.log('cancelling');return}
				console.log(data);
				console.log(typeof(data.data.outputs));;
				//master.unspents = data.data.outputs;
				//master.balance = cryptoscrypt.sumArray(_.pluck(data.data.outputs, 'value'))
				master.unspents = [{}];

				_.each(data.data.outputs, function(output, index) {

					s = output.transaction_hash;

					result = ''
					for (var i = 0; i <=s.length-2; i=i+2) {
						result = ((s.substring(i,i+2)) + result);
					}

					master.unspents[index].transaction_hash = output.transaction_hash;
					master.unspents[index].transaction_index = output.transaction_index;
					master.unspents[index].value = output.value;

				});
				master.balance = cryptoscrypt.sumArray(_.pluck(master.unspents, 'value'))
			};
			fail = function() {
				console.log('couldnt find the unspent data')
				this.unspents = [];
			};
			console.log(this.multisig.address)
			if (this.multisig.address){
				return cryptoscrypt.getJSONrequest('https://api.biteasy.com/blockchain/v1/addresses/' + this.multisig.address + '/unspent-outputs?per_page=100&callback=?refreshSection', success, fail);
				/*
				BLOCKCHAIN
				{
				 
					unspent_outputs":[
		
						{
							"tx_hash":"19e1b2dc541af3e28e0f06d14543107ea45618c54924640caf0269fa79cbac09",
							"tx_hash_big_endian":"09accb79fa6902af0c642449c51856a47e104345d1060f8ee2f31a54dcb2e119",
							"tx_index":79293305,
							"tx_output_n": 0,
							"script":"a9142ad9d1730eb00a34f3a7a5d626c29f373550775e87",
							"value": 1000000,
							"value_hex": "0f4240",
							"confirmations":3
						}
		  
					]
				}

				bitEASY
				{
   				"status":200,
   				"data":{
      			"outputs":[
					{
						"transaction_hash":"fa2021dff72c0b08ad8f4056c9ea3515c2e034c32359f6e09b169033c7a6a6cb",
						"script_pub_key_string":"DUP HASH160 [05d3984a91e60d677b32145a1b5ad586da50a7ae] EQUALVERIFY CHECKSIG",
						"script_pub_key":"76a91405d3984a91e60d677b32145a1b5ad586da50a7ae88ac",
						"to_address":"1Xorq87adKn12bheqPFuwLZgZi5TyUTBq",
						"value":990000,
						"transaction_index":0,
						"is_spent":0,
						"script_sent_type":"ADDRESS"
					},
				*/
				//return cryptoscrypt.getJSONrequest('https://api.biteasy.com/blockchain/v1/addresses/' + this.multisig.address + '/unspent-outputs?per_page=100&callback=?refreshSection', success, fail);
				return cryptoscrypt.getJSONrequest('https://blockchain.info/unspent?active=' + this.multisig.address + '&cors=true', success, fail);
			} else {
				return $().promise();
			}
		},

		this.deleteRecipient = function(index) {
			if (this.recipients.length>1) {
				this.recipients.splice(index, 1);
			} else {
				this.recipients=[ { address:'', pubkey:0, thumb:'', onename:'', avatar:'' } ];
			}
		},

		this.addRecipient = function() {
			this.recipients.push({ address:'', amount:'', checkedAddress:'', thumb:'' });
		}

		this.addEntry = function() {
			if (this.pubkeys.length < 15) {
			this.pubkeys.push({ address:'', pubkey:'', signature:'', thumb:'', onename:'', avatar:'' })
			} else {
				window.alert('You cannot have more than 15 addresses for one multisig address')
			}
		},

		this.clearField = function(field) {

			this.pubkeys[field] =  { address:'', pubkey:'', thumb:'', onename:'', avatar:'' };
		},

		this.deletePubkey = function(index) {
			if (this.pubkeys.length>2) {
				this.pubkeys.splice(index, 1);
			} else {
				this.clearField(index);
			}
		},

		this.getPubKey = function(address) {
			var getRequest = function(url, success, error) {
				$.ajax({
					url : url,
					dataType : 'text',
					success : success,
					error : error
				});
			};
			var result = $.Deferred();
			var success = function(data) {
				result.resolve(data)
			};
			var error = function() {
				console.log("failure")
			};
			getRequest('https://blockchain.info/q/pubkeyaddr/' + address + '?cors=true', success, error);
			return result
		},

		this.resolvePubKey = function(address, field) {
			var master = this;
			return this.getPubKey(address).done(function(data) {
				master.pubkeys[field].pubkey = data;
				master.pubkeys[field].address = address;
			})
		},

		this.resolveOnename = function(input, field, callback, env) {
			var master = this;
			return $.getJSON('https://onename.com/' + input + '.json', function(data) {
				callback(data, field, env);
			})
		},

		this.dataToPubkeys = function(data, field, env) {
			var master = env ? env : this;
			var address = data.bitcoin.address ? data.bitcoin.address : '';
			if (data.avatar) {
				master.pubkeys[field].avatar = data.avatar;
			};
			if (cryptoscrypt.validAddress(address)) {
				master.pubkeys[field].address = address;
			};
		},

		this.dataToRecipient = function(data, field, env) {
			var master = env ? env : this;
			var address = data.bitcoin.address ? data.bitcoin.address : '';
			if (cryptoscrypt.validAddress(address)) {
				master.recipients[field].address = address;
			}
		},

		this.findAddress = function() {
			pubkeys = _.without(_.pluck(this.pubkeys,'pubkey'),'','unknown');
			if (_.contains(_.pluck(this.pubkeys,'pubkey'),'unknown')) {
				this.multisig['address'] = '';
				console.log('some addresses are unknown');
				return false;
			}
			if (pubkeys.length>1) {
				this.multisig = cryptoscrypt.getMultisigAddress(pubkeys, parseInt(this.numberOfSignatures))
			} else {
				this.multisig = '';
				//this.redeemscript = '';
				this.address = '';
				this.unspents = [];
				this.balance = undefined;
			}
		},

		this.findAddresses = function(pubkeys) {
			this.multisigs = cryptoscrypt.getMultisigAddresses(pubkeys, this.numberOfSignatures);
		},

		this.importRedeem = function(code) {
			//console.log(bitcoin.Script.fromHex(redeemscriptHex))
		},

		this.loadRedeemscript = function(redeemscript) {
			var addresses = cryptoscrypt.getAddressesFromRedeemscript(redeemscript);
			this.numberOfSignatures = cryptoscrypt.getNumberOfSignaturesFromRedeemscript(redeemscript);
			this.pubkeys = _.map(addresses,function(data) { 
				return {
				address:data.address, pubkey:data.pubkey, thumb:'', onename:'', avatar:'' }
			})
		}
	}
	return Multisig;
});

