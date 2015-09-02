define([
	'jquery', 
	'underscore', 
	'backbone', 
	'models/qrcode',
	'models/currencylist', 
	'models/dialogs'
], function($, _, Backbone, qrcode, CurrencyList, Dialogs){


	$.createCache = function( requestFunction ) {
		var cache = {};
		return function(key, callback) {
			if (!cache[ key ]) {
				cache[key] = $.Deferred(function(defer) {
					requestFunction(defer, key);
				}).promise();
			}
			return cache[key].done(callback);
		};
	};

	$.loadImage = $.createCache(function(defer, url) {
		var image = new Image();
		function cleanUp() {
			image.onload = image.onerror = null;
		}
		defer.then(cleanUp, cleanUp);
		image.onload = function() {
			defer.resolve(url);
		};
		image.onerror = defer.reject;
		image.src = url;
	});
	
	var currencies = [{'code':'BTC','name':'Bitcoin','symbol':'Ƀ'},{'code':'ALL','name':'Albania Lek','symbol':'Lek'},{'code':'AFN','name':'Afghanistan Afghani','symbol':'؋'},{'code':'ARS','name':'Argentina Peso','symbol':'$'},{'code':'AWG','name':'Aruba Guilder','symbol':'ƒ'},{'code':'AUD','name':'Australia Dollar','symbol':'$'},{'code':'AZN','name':'Azerbaijan New Manat','symbol':'ман'},{'code':'BSD','name':'Bahamas Dollar','symbol':'$'},{'code':'BBD','name':'Barbados Dollar','symbol':'$'},{'code':'BYR','name':'Belarus Ruble','symbol':'p.'},{'code':'BZD','name':'Belize Dollar','symbol':'BZ$'},{'code':'BMD','name':'Bermuda Dollar','symbol':'$'},{'code':'BOB','name':'Bolivia Boliviano','symbol':'$b'},{'code':'BAM','name':'Bosnia Marka','symbol':'KM'},{'code':'BWP','name':'Botswana Pula','symbol':'P'},{'code':'BGN','name':'Bulgaria Lev','symbol':'лв'},{'code':'BRL','name':'Brazil Real','symbol':'R$'},{'code':'BND','name':'Brunei Darussalam Dollar','symbol':'$'},{'code':'KHR','name':'Cambodia Riel','symbol':'៛'},{'code':'CAD','name':'Canada Dollar','symbol':'$'},{'code':'KYD','name':'Cayman Islands Dollar','symbol':'$'},{'code':'CLP','name':'Chile Peso','symbol':'$'},{'code':'CNY','name':'China Yuan Renminbi','symbol':'¥'},{'code':'COP','name':'Colombia Peso','symbol':'$'},{'code':'CRC','name':'Costa Rica Colon','symbol':'₡'},{'code':'HRK','name':'Croatia Kuna','symbol':'kn'},{'code':'CUP','name':'Cuba Peso','symbol':'₱'},{'code':'CZK','name':'Czech Republic Koruna','symbol':'Kč'},{'code':'DKK','name':'Denmark Krone','symbol':'kr'},{'code':'DOP','name':'Dominican Republic Peso','symbol':'RD$'},{'code':'XCD','name':'East Caribbean Dollar','symbol':'$'},{'code':'EGP','name':'Egypt Pound','symbol':'£'},{'code':'SVC','name':'El Salvador Colon','symbol':'$'},{'code':'EEK','name':'Estonia Kroon','symbol':'kr'},{'code':'EUR','name':'Euro Member Countries','symbol':'€'},{'code':'FKP','name':'Falkland Islands Pound','symbol':'£'},{'code':'FJD','name':'Fiji Dollar','symbol':'$'},{'code':'GHC','name':'Ghana Cedi','symbol':'¢'},{'code':'GIP','name':'Gibraltar Pound','symbol':'£'},{'code':'GTQ','name':'Guatemala Quetzal','symbol':'Q'},{'code':'GGP','name':'Guernsey Pound','symbol':'£'},{'code':'GYD','name':'Guyana Dollar','symbol':'$'},{'code':'HNL','name':'Honduras Lempira','symbol':'L'},{'code':'HKD','name':'Hong Kong Dollar','symbol':'$'},{'code':'HUF','name':'Hungary Forint','symbol':'Ft'},{'code':'ISK','name':'Iceland Krona','symbol':'kr'},{'code':'INR','name':'India Rupee','symbol':''},{'code':'IDR','name':'Indonesia Rupiah','symbol':'Rp'},{'code':'IRR','name':'Iran Rial','symbol':'﷼'},{'code':'IMP','name':'Isle of Man Pound','symbol':'£'},{'code':'ILS','name':'Israel Shekel','symbol':'₪'},{'code':'JMD','name':'Jamaica Dollar','symbol':'J$'},{'code':'JPY','name':'Japan Yen','symbol':'¥'},{'code':'JEP','name':'Jersey Pound','symbol':'£'},{'code':'KZT','name':'Kazakhstan Tenge','symbol':'лв'},{'code':'KPW','name':'Korea (North) Won','symbol':'₩'},{'code':'KRW','name':'Korea (South) Won','symbol':'₩'},{'code':'KGS','name':'Kyrgyzstan Som','symbol':'лв'},{'code':'LAK','name':'Laos Kip','symbol':'₭'},{'code':'LVL','name':'Latvia Lat','symbol':'Ls'},{'code':'LBP','name':'Lebanon Pound','symbol':'£'},{'code':'LRD','name':'Liberia Dollar','symbol':'$'},{'code':'LTL','name':'Lithuania Litas','symbol':'Lt'},{'code':'MKD','name':'Macedonia Denar','symbol':'ден'},{'code':'MYR','name':'Malaysia Ringgit','symbol':'RM'},{'code':'MUR','name':'Mauritius Rupee','symbol':'₨'},{'code':'MXN','name':'Mexico Peso','symbol':'$'},{'code':'MNT','name':'Mongolia Tughrik','symbol':'₮'},{'code':'MZN','name':'Mozambique Metical','symbol':'MT'},{'code':'NAD','name':'Namibia Dollar','symbol':'$'},{'code':'NPR','name':'Nepal Rupee','symbol':'₨'},{'code':'ANG','name':'Netherlands Antilles Guilder','symbol':'ƒ'},{'code':'NZD','name':'New Zealand Dollar','symbol':'$'},{'code':'NIO','name':'Nicaragua Cordoba','symbol':'C$'},{'code':'NGN','name':'Nigeria Naira','symbol':'₦'},{'code':'KPW','name':'Korea (North) Won','symbol':'₩'},{'code':'NOK','name':'Norway Krone','symbol':'kr'},{'code':'OMR','name':'Oman Rial','symbol':'﷼'},{'code':'PKR','name':'Pakistan Rupee','symbol':'₨'},{'code':'PAB','name':'Panama Balboa','symbol':'B/.'},{'code':'PYG','name':'Paraguay Guarani','symbol':'Gs'},{'code':'PEN','name':'Peru Nuevo Sol','symbol':'S/.'},{'code':'PHP','name':'Philippines Peso','symbol':'₱'},{'code':'PLN','name':'Poland Zloty','symbol':'zł'},{'code':'QAR','name':'Qatar Riyal','symbol':'﷼'},{'code':'RON','name':'Romania New Leu','symbol':'lei'},{'code':'RUB','name':'Russia Ruble','symbol':'руб'},{'code':'SHP','name':'Saint Helena Pound','symbol':'£'},{'code':'SAR','name':'Saudi Arabia Riyal','symbol':'﷼'},{'code':'RSD','name':'Serbia Dinar','symbol':'Дин.'},{'code':'SCR','name':'Seychelles Rupee','symbol':'₨'},{'code':'SGD','name':'Singapore Dollar','symbol':'$'},{'code':'SBD','name':'Solomon Islands Dollar','symbol':'$'},{'code':'SOS','name':'Somalia Shilling','symbol':'S'},{'code':'ZAR','name':'South Africa Rand','symbol':'R'},{'code':'KRW','name':'Korea (South) Won','symbol':'₩'},{'code':'LKR','name':'Sri Lanka Rupee','symbol':'₨'},{'code':'SEK','name':'Sweden Krona','symbol':'kr'},{'code':'CHF','name':'Switzerland Franc','symbol':'CHF'},{'code':'SRD','name':'Suriname Dollar','symbol':'$'},{'code':'SYP','name':'Syria Pound','symbol':'£'},{'code':'TWD','name':'Taiwan New Dollar','symbol':'NT$'},{'code':'THB','name':'Thailand Baht','symbol':'฿'},{'code':'TTD','name':'Trinidad and Tobago Dollar','symbol':'TT$'},{'code':'TRL','name':'Turkey Lira','symbol':'₤'},{'code':'TVD','name':'Tuvalu Dollar','symbol':'$'},{'code':'UAH','name':'Ukraine Hryvnia','symbol':'₴'},{'code':'GBP','name':'United Kingdom Pound','symbol':'£'},{'code':'USD','name':'United States Dollar','symbol':'$'},{'code':'UYU','name':'Uruguay Peso','symbol':'$U'},{'code':'UZS','name':'Uzbekistan Som','symbol':'лв'},{'code':'VEF','name':'Venezuela Bolivar','symbol':'Bs'},{'code':'VND','name':'Viet Nam Dong','symbol':'₫'},{'code':'YER','name':'Yemen Rial','symbol':'﷼'},{'code':'ZWD','name':'Zimbabwe Dollar','symbol':'Z$'}];
	var currency = 'BTC';
	var rate = 0;
	var btcUsd = 0;
	var thumb = '';
	var onename = '';
	var address = '';
	var title = '';
	var fiat = 0;
	var amount = 0;
	var symbol = '';
	var btcFiat = 0;
	var websocket = null;

	var Coinvoice = Backbone.View.extend({
		el: $('#contents'),
		//templateFrom: _.template($('#indexViewFromTemplate').text())
		template: _.template($('#coinvoiceTemplate').text()), 
		events: {
			'change select[id=currency]': 'updateRate', 
			'keyup input[id=fiat]': 'updateFiat',
			'blur input[id=address]': 'updateInput',
			'change input[id=address]': 'updateInput',
		}, 
// VIEWS

		monitorAddress: function(bitcoin_address){
			var master = this;
			console.log(bitcoin_address)
			var timeout = false;
			var wsUri = "wss://ws.blockchain.info/inv";
			var output;
			
			function init() {


				try{timeout = true; this.websocket.close()} catch(err){timeout = false}
				testWebSocket();
				$('#btcSymbol').css('background-color','lightgreen')
			}

			function testWebSocket() {
				this.websocket = new this.WebSocket(wsUri);
				this.websocket.onopen = function(evt) { onOpen(evt) };
				this.websocket.onclose = function(evt) { onClose(evt) };
				this.websocket.onmessage = function(evt) { onMessage(evt) };
				this.websocket.onerror = function(evt) { onError(evt) };
			}
			function closeWebSocket() {
				timeout = true;
				this.websocket.close()
			}
			function onOpen(evt) {
				console.log(bitcoin_address)
				writeToScreen("CONNECTED");
				//addr_sub = 1EPAYji8HW278XeqKnzEESJNKcArMa59A8
				//doSend('{"op":"addr_sub", "addr":"' + "1LuckyP83urTUEJE9YEaVG2ov3EDz3TgQw" + '"}');
				doSend('{"op":"addr_sub", "addr":"' + bitcoin_address + '"}');
				setTimeout(closeWebSocket, 120000)
			}
			function onClose(evt) {
				if (timeout == false) {
					init();
					return
				}
				timeout = false;
				$('#btcSymbol').css('background-color','#FF5C5C')
				writeToScreen("DISCONNECTED");
			}
			function onMessage(evt) {
				master.currency = $('select[id=currency]', master.$el).val()
				var def = $.Deferred();
				master.getBtcRate(def, master.currency);
				def.done(function(rate){
					console.log(rate)
					rate = rate.replace(/,/g , '')
					master.btcFiat = rate;
					master.updateFiat();
					master.updatePage();

					_.each($.parseJSON(evt.data).x.out, function(item, id) {
						if (item.addr == bitcoin_address) {
							writeToScreen(item.value);
							var ratePerBTC = Math.floor(100 * master.btcFiat ) / 100;
							Dialogs.normalOne('You just got ' + Math.floor(10000 * (ratePerBTC * (item.value / 100000000)))/10000 + ' ' + master.currency , 'Payment received');
							timeout = true;
							closeWebSocket();
						}
				})






				})


				;
				//websocket.close();
			}
			function onError(evt) {
				writeToScreen(evt.data);
			}
			function doSend(message) {
				writeToScreen("SENT: " + message);
				this.websocket.send(message);
			}
			function writeToScreen(message) {
				console.log(message) 
			}  
			init();
		},
		// Called at page initialization
		render: function() {
			try{this.websocket.close()} catch(err){}
			//this.getBtcRate('THB').done(function(data){console.log(data)})
			master = this;
			// Get parameters
			this.address = this.getParameterByName('address');
			this.currency = this.getParameterByName('currency') ? this.getParameterByName('currency') : 'BTC' ;
			this.title = this.getParameterByName('title');
			this.onename = this.getParameterByName('onename');

			// Render the page
			this.$el.html(this.template({ 
				address: this.address,
				currency: this.currency,
				title: this.title,
				currencies: currencies
			}));

			if (this.address) {
				master.monitorAddress(this.address);
			}
			// If onename is specified, resolve it and update the page
			if (this.onename) {
				this.lookupOnename(this.onename).done(function(data) {
					if (master.address & (data.address != master.address)) {
						window.alert("The address specified in the link wasn't the same as the one resolved by Onename. Onename's address will be kept, please double check and be very careful!");
					}
					$('input[id=address]').val(data.address);
					master.address = data.address;
					master.thumb = data.avatar;
					master.updatePage();
					master.monitorAddress(master.address);
				});
			};
			this.updateRate();
			this.updatePage();

		},

		// Called by event inputAddress
		updateInput: function() {
			var master = this;
			var input = $('input[id=address]').val();

			// if it is an address, no need for looking it up on onename
			if (cryptoscrypt.validAddress(input) == true) {
				this.address = input;
				master.updatePage();
				master.monitorAddress(input);
	    		return
			};

			// if it is not an address, then it must be a onename ID
			this.onename = input;
			this.lookupOnename(this.onename).done(function(data) {
				master.address = data.address;
				$('input[id=address]').val(master.address);
				master.thumb = data.avatar;
				master.updatePage();
				master.monitorAddress(master.address);
			});
		},

		//Called by render and event click currency
		updateRate: function() {
			master = this;
			//Get currency and amount
			this.currency = $('select[id=currency]', this.$el).val();
			this.fiat = $('input[id=fiat]', this.$el).val();
			//special case for BTC since it is not resolved by https://rate-exchange.appspot.com
			if (this.currency == 'BTC') {
				master.btcFiat = 1;
				master.btcUsd = 1;
				master.rate = 1;
				master.updateFiat();
			} else {
				//Get Rates into btcUsd and rate, when it is done, update the page
				var def = $.Deferred();
				this.getBtcRate(def, this.currency);
				def.done(function(rate){
					console.log(rate)
					rate = rate.replace(/,/g , '')
					master.btcFiat = rate;
					master.updateFiat();
					master.updatePage();
				})

				/*this.getFiatRate("USD",this.currency).done(function(data) {
					master.rate = data.result;
					master.getBtcRate().done(function(data) {
						master.btcUsd = data.result;
						master.updateFiat();
					});
				});*/
			}
		},

		//Called in updateRate and even input fiat (keydown)
		updateFiat: function() {
			this.fiat = $('input[id=fiat]').val();
			this.amount = Math.floor(10000 * (this.fiat / (this.btcFiat))) / 10000;
			this.updatePage();
		},

		// Called in lookupFromInput, updateRate
		updatePage: function() {
			//update result elements
			this.updateLink();
			this.updateLegend();
			$('div[id=qrcode-address-image]').text('');
			$('div[id=qrcode-privkey-image]').text('');
			this.makeQrCode();
		}, 

		// Called in updateRate and updatePage
		updateLink: function() {
			var currency = '?currency=' + this.currency;
			var address = this.address ? '&address=' + this.address : '';
			var onename = this.onename ? '&onename=' + this.onename : '';
			var link = window.location.pathname + currency + address + onename + '#receive';
			$('div[id=link]').html("</br></br></br></br></br><a href=" + link + ">Link to this page</a>");
		},

		// Called in updatePage
		updateLegend: function() {
			var ratePerBTC = Math.floor(100 * this.btcFiat ) / 100;
			if (!ratePerBTC) {
				return
			};
			var symbol = _.findWhere(currencies,{code:this.currency}).symbol;
			$('span[id=currencyAddon]').text(symbol);
			$('span[id=rateAddon]').text(this.amount + ' Bitcoin @ Rate: '+ ratePerBTC + ' ' + symbol + '/Ƀ');
		},

		// Called in updatePage, updateQr
		makeQrCode: function() {
			var qrcode = new QRCode("qrcode-address-image", { width: 260, height: 260, correctLevel: QRCode.CorrectLevel.H });
			var data = 'bitcoin:' + this.address + (this.amount ? '?amount=' + this.amount : '');
			qrcode.makeCode(data);
			if (this.thumb) {
				this.drawThumb();
			};
			$('canvas').css('border', '20px solid #FFFFFF')
		},

		// Called in updatePage, makeQrCode
		drawThumb: function() {
			var url = this.thumb.url
			function draw() {
				var image = new Image();
				var ctx = $('canvas')[0].getContext('2d');
				image.src = url;
				ctx.drawImage(image, 90, 90, 80, 80);
			}
			$.loadImage(url).done(draw);
		},

//MODELS

		// Called in render, lookupFromInput
		lookupOnename: function(onename) {
			var def = $.Deferred();
			$.getJSON('https://onename.com/' + this.onename + '.json')
			.done(function(data) {
				def.resolve({
					address:data.bitcoin.address ? data.bitcoin.address : '',
					avatar:data.avatar ? data.avatar : ''
				});
			})
			return def.promise();
		},

		// Called in updateRate
 		getFiatRate: function(from, to) {
			var def = $.Deferred();
			$.getJSON('https://rate-exchange.appspot.com/currency?from=' + from + '&to=' + to + '&callback=?')
			.done(function(data) { 
				def.resolve({
					result:data.rate
				});
			});
			return def.promise();
		},

		// Called in updateRate
 		getBtcRate: function(def, fiat) {
 			
 			
 			(function() {
				var API = "http://api.coindesk.com/v1/bpi/currentprice/" + fiat + ".json";
				console.log(API)

					$.getJSON( API, function(data){
						def.resolve(data.bpi[fiat].rate)
					})
					/*.done(function( data ) {
						console.log(data)
					});*/
				})();

 			/*var longURL = fiat + '.json';
 			success = function(data) {
 				console.log(data)
 				deff.resolve(data)
 			}
			var ud = 'json'+(Math.random()*100).toString().split('.')[0]
				// Define API URL:
				console.log(ud)
			
			
				API = 'http://api.coindesk.com/v1/bpi/currentprice/';
			//window[ud]= function(o){ success && success(o); };
			// Append new SCRIPT element to BODY with SRC of API:
			document.getElementsByTagName('body')[0].appendChild((function(){
				var s = document.createElement('script');
				s.type = 'text/javascript';
				s.src = API + (longURL);
				console.log(s.src)
				return s;
			})())*/
			return def

 			//cryptoscrypt.getJSONrequest('http://www.freecurrencyconverterapi.com/api/v3/convert?q=BTC_' + fiat + '&compact=y', callback)
			/*var def = $.Deferred();
			$.getJSON('http://www.freecurrencyconverterapi.com/api/v3/convert?q=BTC_' + fiat + '&compact=y&callback=callback')
			.done(function(data) { 
				def.resolve({
					result:data['BTC_' + fiat].val//.bpi.USD.rate
				});
			});
			return def.promise();*/
		},

		// Called in render
		getParameterByName: function(name) {

		    name = name.replace(/[\[]/, "\\[").replace(/[\]]/, "\\]");
		    var regex = new RegExp("[\\?&]" + name + "=([^&#]*)"),
		        results = regex.exec(location.search);
		    try {
		    	console.log(results)
		    	if(results != null) {
					$('.nav > li').css('display', 'none')
				}
		    } catch(err) {}
		    return results === null ? "" : decodeURIComponent(results[1].replace(/\+/g, " "));
		},
	});
	return Coinvoice;
});
