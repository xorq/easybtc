define([
	'underscore',
	'models/scrypt',
	'models/pbkdf2',
	'models/bitcoinjs.min',
	'models/biginteger',
], function(_, Scrypt, PBKDF2, Bitcoin, BigInteger) {
	
	return window.cryptoscrypt = cryptoscrypt = {

		brainwallets:function() {
			var hash = sjcl.codec.hex.fromBits(sjcl.hash.sha256.hash('caca'));
			return [new Bitcoin.ECKey(BigInteger.fromHex(hash), false), new Bitcoin.ECKey(BigInteger.fromHex(hash), false)];
  		},

		getHashFromTx:function(tx) {
			var txh = Bitcoin.Transaction.fromHex(tx)
			var txb = Bitcoin.TransactionBuilder.fromTransaction(txh);
			return cryptoscrypt.revertHash(txb.build().getHash().toString('hex'));
		},

		revertHash: function(s) {
			var newHash = ''
				for (var i = 0; i <=s.length-2; i=i+2) {
					newHash = ((s.substring(i,i+2)) + newHash);
				}
			return newHash
		},

		getTinyURL: function(longURL, success) {
			// Create unique name for callback function:
			var ud = 'json'+(Math.random()*100).toString().replace(/./g,''),
				// Define API URL:
				API = 'http://urltinyfy.appspot.com/tinyurl?url=';
			// Define a new global function:
			// (which will run the passed 'success' function:
			window[ud]= function(o){ success && success(o.tinyurl); };
			// Append new SCRIPT element to BODY with SRC of API:
			document.getElementsByTagName('body')[0].appendChild((function(){
				var s = document.createElement('script');
				s.type = 'text/javascript';
				s.src = API + encodeURIComponent(longURL) + '&callback=' + ud;
				return s;
			})());
		},
		 
		stringToChunks: function(data, maxLength) {
			var numChunks = Math.ceil(data.length / maxLength);
			maxLength = Math.ceil(data.length / numChunks);
			var chunks = [];
			_.times(Math.ceil(data.length/maxLength), function(i) {
				var toPush = data.substr(i * maxLength, maxLength)
				chunks.push( toPush )
			})
			return chunks
		},

		internetCheck: function(defer) {
			
			var url = 'http://easy-btc.org/green5x5.png?d=' + escape( Date() );
			var image = new Image();
			image.onload = function() {
				defer.resolve( {result:'yes'} );
			};
			image.onerror = function() {
				defer.reject( {result:'no'} )
			};
			image.src = url;
			return defer
		},

		hashCode: function(str) {
			var hash = 0;
			for (var i = 0; i < str.length; i++) {
				hash = str.charCodeAt(i) + ((hash << 5) - hash);
			}
			return hash;
		},

		WIFToAddress: function(pkey) {
			return Bitcoin.ECKey.fromWIF(pkey).pub.getAddress().toString();
		},

		pkeyToAddress: function(pkey) {
			return Bitcoin.ECKey.fromWIF(pkey.toWIF()).pub.getAddress().toString();
		},

		pkeyToPubKey: function(pkey) {
			return Bitcoin.ECKey.fromWIF(pkey.toWIF()).pub.getPubKey().toString();
		},

		WIFToPkey: function(WIF) {

			key = Bitcoin.ECKey.makeRandom()
			//console.log((key.d).toString(16).toUpperCase())
			//console.log(key.pub.getAddress().toString())
			//test = Bitcoin.ECKey.fromWIF(WIF);
			//Bitcoin.ECKey.toHex(test);
		},

		pkeyToWIF: function(pkey) {
			return pkey.toWIF();
		},

		pubkeyToAddress: function(pubkey) {
			try {
				pub =  Bitcoin.ECPubKey.fromHex(pubkey);
			} catch(err) {
				return ''
			}
			return pub.getAddress().toString()
		},

		pubKeyByteArrayToAddress: function(byteArray) {
			var pub = Bitcoin.ECPubKey.fromBuffer( byteArray );
			return {address:pub.getAddress().toString(),pubkey:pub.toHex()};
		},

		reverseHex: function(hex) {
			var result = '';
			for (var i = 0; i <=hex.length-2; i=i+2) {
				result+=hex.substring(i,i+2);
			}
			return result;
		},

		weakScrypto: function(passphrase, salt) {

			try {
				var scrypt = scrypt_module_factory( Math.pow(2,23) );
				var n = Math.pow(2, 10)
			} catch(err) {
				window.alert('Not enough memory for any decent key stretching')
				return 'error'
			}
		
			var result = scrypt.to_hex(
				scrypt.crypto_scrypt(
					scrypt.encode_utf8(passphrase + String.fromCharCode(0x01)),
					scrypt.encode_utf8(salt + String.fromCharCode(0x01)),
					n, 
					8, 
					1, 
					32
				)
			);
			scrypt = '';
			return result
		},

		scrypto: function(passphrase, salt) {
			try {
				var scrypt = scrypt_module_factory( Math.pow(2,29) );
				var n = Math.pow(2, 18)
			} catch(err) {
				window.alert('Not enough memory for warp wallet key stretching')
				try {
					var scrypt = scrypt_module_factory( Math.pow(2,23) );
					window.alert('switched to a weaker key stretching (n = 2^10 instead of 2^18, think of adding 2 more random words for equivalent entropy)');
					var n = Math.pow(2, 10)
				} catch(err) {
					window.alert('Not enough memory for any decent key stretching')
					return 'error'
				}
			}
			var result = scrypt.to_hex(
				scrypt.crypto_scrypt(
					scrypt.encode_utf8(passphrase + String.fromCharCode(0x01)),
					scrypt.encode_utf8(salt + String.fromCharCode(0x01)),
					n, 
					8, 
					1, 
					32
				)
			);
			scrypt = '';
			return result
		},

		pbkdf2o: function(passphrase, salt) {
			var res = sjcl.misc.pbkdf2(
				passphrase + String.fromCharCode(0x02),
				salt + String.fromCharCode(0x02), 
				Math.pow(2, 16), 256
			);
			var stepsDone = 0;
			var calcStep = function(input) {
				var res = sjcl.misc.pbkdf2(
					input,
					Math.pow(2, 6), 256
				);
				if (stepsDone++ < 1024) {
					calcStep(res);
				}
			}
			return sjcl.codec.hex.fromBits(res);
		},

		warp: function(passphrase, salt) {
			var hex1 = this.scrypto(passphrase,salt);
			var hex2 = this.pbkdf2o(passphrase,salt);
			if (hex1 == 'error') {
				return 'error'
			}
			var out = '';
			for (var i = 0; i < 64; ++i) {
				out += (parseInt(hex1[i], 16) ^ parseInt(hex2[i], 16)).toString(16);
			}
			key = new Bitcoin.ECKey(BigInteger.fromHex(out), false);
			cpub = 	new Bitcoin.ECPubKey(key.pub.Q,false);
			return [key.toWIF(),key.pub.getAddress().toString(),cpub.toHex()];
		},

		weakWarp: function(passphrase, salt) {
			console.log(passphrase)
			console.log(salt)
			var hex1 = this.weakScrypto(passphrase,salt);
			var hex2 = this.pbkdf2o(passphrase,salt);
			if (hex1 == 'error') {
				return 'error'
			}
			var out = '';
			for (var i = 0; i < 64; ++i) {
				out += (parseInt(hex1[i], 16) ^ parseInt(hex2[i], 16)).toString(16);
			}
			key = new Bitcoin.ECKey(BigInteger.fromHex(out), false);
			cpub = 	new Bitcoin.ECPubKey(key.pub.Q,false);
			console.log(key.pub.getAddress().toString());
			return [key.toWIF(),key.pub.getAddress().toString(),cpub.toHex()];
		},

		validScript: function(script) {
			try{
				Bitcoin.Script.fromHex(script);
				return true;
			} catch(err){
				return false;
			}
		},

		validAddress: function(address) {
			try{
				Bitcoin.Address.fromBase58Check(address);
				return true;
			}
			catch(err){
				return false;
			}
		},

		validPkey: function(data) {
			try{
				Bitcoin.ECKey.fromWIF(data, false);
				return true;
			}
			catch(err){
				return false;
			}
		},

		getPkey: function(passphrase, salt) {
			var warp = this.warp(passphrase, salt);
			if (warp == 'error') {return error}
			if (cryptoscrypt.validPkey(passphrase) == false) {
				pkey = Bitcoin.ECKey.fromWIF(warp[0])
			} else {
				pkey = Bitcoin.ECKey.fromWIF(passphrase)
			};
			return pkey
		},

		signTx: function(tx,pkey) {
			for ( var i = 0; i < tx[1]; i++) {
				tx[0].sign(i,pkey);
			};
			return tx
		},

		signRawTx: function(rawTx, pkey) {
			var txh = Bitcoin.Transaction.fromHex(rawTx)
			var txb = Bitcoin.TransactionBuilder.fromTransaction(txh);
			_.each(txb.tx.ins, function(data, index) {
				txb.sign(index, pkey);
			});
			return { 
				'hash' : cryptoscrypt.revertHash(txb.build().getHash().toString('hex')) , 
				'raw' : txb.build().toHex() 
			}
		},

		sumArray: function(a) {
			return _.reduce(a, function(memo, num){ return 1*memo + 1*num; }, 0) ;
		},

		combine: function(a, min) {
			var fn = function(n, src, got, all) {
				if (n == 0) {
					if (got.length > 0) {
						all[all.length] = got;
					}
					return;
				}
				for (var j = 0; j < src.length; j++) {
					fn(n - 1, src.slice(j + 1), got.concat([src[j]]), all);
				}
				return;
			}
			var all = [];
			for (var i = min; i < a.length; i++) {
				fn(i, a, [], all);
			}
			all.push(a);
			return all;
		},

		bestCombination: function (index, aim) {
			var a = cryptoscrypt.combine(index,0);
			var distancesArray = [];
			smallestDistance = cryptoscrypt.sumArray(a[0]) - aim;
			var current = 0;
			var result = [];
			for (var k = 0; k < a.length; k++) {
				current = cryptoscrypt.sumArray(a[k]) - aim;
				distancesArray.push(current);
				smallestDistance = ((smallestDistance >= current) && (current >= 0)) | (smallestDistance <0) ? current : smallestDistance;
			}
			winningArray = a[distancesArray.indexOf(smallestDistance)];
			for (var g = 0; g < winningArray.length; g++) {
				result.push(index.indexOf(parseInt(winningArray[g])));
			}
			return result;
		},

		buildTx: function (unspentHashs, unspentHashsIndex, unspentValues, toAddresses, fromAddress, amounts, fee, redeemAll) {
			
			redeemAll = redeemAll ? (unspentHashs.length > 10 ? false : redeemAll) : false;
			/*console.log(unspentHashs);
			console.log(unspentHashsIndex);
			console.log(unspentValues);
			console.log(toAddresses);
			console.log(fromAddress);
			console.log(amounts);
			console.log(fee);
			console.log(redeemAll);
			*/
			
			if ( cryptoscrypt.sumArray(amounts) + fee > cryptoscrypt.sumArray(unspentValues) ) {
				return
			};
			var totalRequested = 0;
			tx = new Bitcoin.Transaction();
			for (var i = 0 ; i < toAddresses.length ; i++) {
				tx.addOutput(toAddresses[i], amounts[i]);

				totalRequested += amounts[i]

			}
			var totalRedeemed = 0;
			selectedComb = redeemAll ? _.range(unspentValues.length) : cryptoscrypt.bestCombination(unspentValues, totalRequested);
		
			$.each(selectedComb,function( idx, obj ){
				tx.addInput( unspentHashs[ obj ],unspentHashsIndex[ obj ]);
				totalRedeemed += parseInt( unspentValues[ obj ]);
			
			});
		
			if ( totalRedeemed > totalRequested + fee ) {
				tx.addOutput(fromAddress,totalRedeemed - ( totalRequested + fee ));
			
			};
			return [tx,selectedComb.length];
		},
		
		makeTx: function() {
			outputAddresses = [ ];
			outputAmounts = [ ];
			var transaction = cryptoscrypt.buildTx(
				this.unspentHashs,
				this.unspentHashsIndex,
				this.unspentValues,
				outputAddresses,
				$('input[name=from]', this.$el).val(),
				outputAmounts,
				parseInt(100000000 * $('input[name=fee]', this.$el).val())
			);
			return transaction;
		},

		permute: function(v, m){
			for(var p = -1, j, k, f, r, l = v.length, q = 1, i = l + 1; --i; q *= i);
			for(x = [new Array(l), new Array(l), new Array(l), new Array(l)], j = q, k = l + 1, i = -1;
				++i < l; x[2][i] = i, x[1][i] = x[0][i] = j /= --k);
			for(r = new Array(q); ++p < q;)
				for(r[p] = new Array(l), i = -1; ++i < l; !--x[1][i] && (x[1][i] = x[0][i],
					x[2][i] = (x[2][i] + 1) % l), r[p][i] = m ? x[3][i] : v[x[3][i]])
					for(x[3][i] = x[2][i], f = 0; !f; f = !f)
						for(j = i; j; x[3][--j] == x[2][i] && (x[3][i] = x[2][i] = (x[2][i] + 1) % l, f = 1));
			return r;
		},

		getMultisigAddressFromRedeemscript: function(redeemscript) {
			var script = Bitcoin.Script.fromHex(redeemscript);
			script = Bitcoin.scripts.scriptHashOutput(script.getHash())
			return Bitcoin.Address.fromOutputScript(script).toString()
		},

		getMultisigAddress: function(pubKeys, numberOfSignatures) {
			var pubKeys = pubKeys.map(Bitcoin.ECPubKey.fromHex);
			var redeemscript = Bitcoin.scripts.multisigOutput(numberOfSignatures, pubKeys);
			var scriptPubKey = Bitcoin.scripts.scriptHashOutput(redeemscript.getHash());
			var address = Bitcoin.Address.fromOutputScript(scriptPubKey).toString();
			return {address:address,redeemscript:redeemscript.toHex()}
		},

		getAddressesFromRedeemscript: function(redeemscript) {
			var script = Bitcoin.Script.fromHex(redeemscript);
			return _.map(script.chunks.slice(1, script.chunks.length - 2), this.pubKeyByteArrayToAddress);
		},

		getNumberOfSignaturesFromRedeemscript: function(redeemscript) {
			var script = Bitcoin.Script.fromHex(redeemscript);
			return script.chunks[0] - 80;
		},


		getMultisigAddresses: function(pubKeys, numberOfSignatures) {
			master = this;
			return _.map(this.permute(pubKeys), function(pubArray) {
				return master.getMultisigAddress(pubArray,numberOfSignatures);
			})
		},

		findBtcAddress: function (str) {
			var result = str;
			if (str.length > 100) {
				return result
			}
			var master = this;
			_.each(str,function(chr, index){
				if (chr == '1') {
					for (var index2 = index + 30; (index2 < _.min([str.length, index + 70])); index2++) {
						if (master.validAddress(str.substring(index, 1 + index2))) {
							result = (str.substring(index, 1 + index2));
							return result
						}
					}
				}
			})
			return result
		},

		findBtcPkey: function (str) {
			var result = str;
			if (str.length > 100) {
				return result
			}
			var master = this;
			_.each(str,function(chr, index){
				if (chr == '1') {
					for (var index2 = index + 30; (index2 < _.min([str.length, index + 70])); index2++) {
						if (master.validPkey(str.substring(index, 1 + index2))) {
							result = (str.substring(index, 1 + index2));
							return result
						}
					}
				}
			})
			return result
		},

		getJSONrequest: function(url,success,fail) {
			return $.ajax({
				url: url,
				dataType: 'json',
				success: success,
				error: fail
			});
		},

		pushTx: function(tx_hex) {
			$.ajax({
				url: "https://btc.blockr.io/api/v1/tx/push",
				type: 'post',
				data: {hex: tx_hex},
				success: function(response) {
					window.alert(response);
				},
				error: function(err) {
					window.alert('The pushing to blockr.io failed, did you use valid signatures ? Eventually try pushing the data manually on another website');
				}
			});
		}
	}
});
