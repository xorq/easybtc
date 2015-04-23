define([
	'underscore',
	'jquery',
	'models/qrcode',
], function(_, $, qrcode) {
	return window.dialogs = dialogs = {
		dataGetter: function(text, title, callback, callback2) {
			try {
				$('#dialog-data-getter').dialog('destroy');
			} catch(err){

			}

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
				width: 420,
				height:420,
				hide:'fade',
				show:'fade'
			};
			$('#dialog-data-getter').dialog(opt);
			$('#dialog-data-getter').css({
				'border': '1px solid #ccec8c',
				'background':'#ccec8c', 
				'border': '2px solid #ccec8c', 
				'color': '#000000', 
				'title': 'Details',
				'hide': { effect: "fade", duration: 2000 }
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
					}, 2000);
					$('#dialog-data-getter').append('<h4 style="position:absolute;top:100px;color:red;word-break:break-all">' + code + '</h4>');
					callback2(code);			
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
				width: 420 + extraSize,
				height:540 + extraSize,
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
				'hide': { effect: "fade", duration: 2000 }
			});
			$('#dialog-qrcode').dialog('open')
			$('[role=dialog]').addClass('hidden-print')
			$('canvas').css('border','20px solid').css('border-color','white');

		},

		dialogQrCodes: function(dataArray, text, title, QRDataSize, comments) {
			$('div[class=visible-print]').html('');
				//dataArray = ['zerzerzer','zfizuoizeuroizeru','jozeirjzoeiruzeroziu']
			QRDataSize = QRDataSize ? QRDataSize : 850
			if (typeof(dataArray) == 'string') {
				dataArray = cryptoscrypt.stringToChunks(dataArray, 850);
			}
			$('#dialog-qrcodes').dialog('destroy');
			//var link = window.location.pathname + '?data=' + this.model.exportData() + '#Multisig';
			$( '#dialogs' ).html('\
			<div id="dialog-qrcodes" title=' + title + '>'

				+ text +

				'<div id="qrcode-display-window" media="print">\
				<button class="btn btn-danger" type="button" value="Print Div" onclick=print()> Print </button>\
				</div>\
			</div>');
			$('div[class=visible-print]').append('<h3 style=text-align:center>' + title + '</h3></br>');
			$('div[class=visible-print]').append('<h4 style=text-align:left>' + text + '</h4></br>');
			dataArray.forEach(function(chunk, index) {
				$('div[id=qrcode-display-window]').append('<div style=margin-bottom:20px id=qrcode-number-' + index + '> ' + (comments && comments[index] ? '<h5>' + comments[index] + '</h5>' : '') + '<button name=btn-qrcode-number-' + index + ' class=btn-primary>QRCode # ' + (1 + index) + '</button></div>')
				$('div[class=visible-print]').append('\
				<div class=col-xs-6 style="page-break-inside: avoid">\
					<legend>QRcode #' + (1 + index) + '</legend>\
					<div id=aqrcode-number-' + index + '></div>\
					' + (comments && comments[index] ? '<h5>' + comments[index] + '</h5>' : '') +'\
				</div>\
				'
				)

				var qrcodeData = new QRCode('qrcode-number-' + index, { 
					width: 300, 
					height: 300, 
					correctLevel : QRCode.CorrectLevel.L
				});
				qrcodeData.makeCode(chunk);
				$('canvas','div[id=qrcode-number-' + index + ']').css('border','20px solid').css('border-color','white');

				var aqrcodeData = new QRCode('aqrcode-number-' + index, { 
					width: 200, 
					height: 200, 
					correctLevel : QRCode.CorrectLevel.L
				});
			 
				aqrcodeData.makeCode(chunk);
				

				$('button[name=btn-qrcode-number-' + index + ']').click(function() {
				$('canvas', 'div[id=qrcode-number-' + index + ']').toggle('blind');
				})
				$('canvas', 'div[id=qrcode-number-' + index + ']').css('display','none');
			});

			var opt = {
				autoOpen: false,
				modal: false,
				width: 420,
				height:500 + 10 * dataArray.length,
				hide: { effect: "fade", duration: 400 },
				show: { effect: "fade", duration: 400 }
			};

			$('#qrcode-display-window').append('<h2>Data</h2><h5 style=word-break:break-all>' + dataArray.join('</br></br>') + '</h5>');
			$('#dialog-qrcodes').dialog(opt);
			$('#dialog-qrcodes').css({
					'border': '1px solid #ccec8c',
					'background':'#ccec8c', 
					'border': '2px solid #ccec8c', 
					'color': '#000000', 
					'title': 'Details',
					'hide': { effect: "fade", duration: 2000 }
			});
			$('#dialog-qrcodes').dialog('open')//.parent().effect('slide');
			$('[role=dialog]').addClass('hidden-print')
		}
	}
})
