define([
	'underscore',
	'jquery',
], function(_, $) {
	return window.dialogs = dialogs = {
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
				width: 400,
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
)
