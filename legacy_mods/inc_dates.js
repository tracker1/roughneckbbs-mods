/*****************************************************************************
                 Date Handling Functions For JavaScript
------------------------------------------------------------------------------
FILE NAME : inc_dates.js
VERSION   : 1.1
CREATED BY: Michael J. Ryan (tracker1[at]theroughnecks.net)
CREATED ON: 2002-11-16
------------------------------------------------------------------------------
MODDED  BY: Michael J. Ryan (tracker1[at]theroughnecks.net)
MODDED  ON: 2003-01-05 (mjr)
MOD       : fixed replaces in formatDate(), would error with day and d, or
          : in march's "H"... also, now case insensitive. :)
------------------------------------------------------------------------------
No additional info.
*****************************************************************************/

Date.prototype.months = Array("January","February","March","April","May","June","July","August","September","October","November","December");
Date.prototype.days = Array("Sunday","Monday","Tuesday","Wednesday","Thursday","Friday","Saturday");
Date.prototype.formatDate = function(strFormat) {
	//h = 24hr time, padded.
	//h24 = 24hr time, not padded
	//hh = 12hr time, padded.
	//h12 = 24hr time, not padded.

	var yyyy = this.getFullYear();
	var yy = (""+yyyy).substr(2,2);
	var month = this.months[this.getMonth()];
	var mmm = month.substr(0,3);
	var mm = this.getMonth() + 1;
	var m = mm;
	var day = this.days[this.getDay()];
	var ddd = day.substr(0,3);
	var dd = this.getDate();
	var d = dd;
	var h = this.getHours();
	var h24 = h;
	var ap = (h24 > 12)?"PM":"AM";
	var h12 = (h24 > 12)?(h24 - 12):h24;
	var nn = this.getMinutes();
	var ss = this.getSeconds();
	var ms = this.getMilliseconds();
	if (h12 == 0) h12 = 12;
	var hh = h12;
	if (mm < 10) mm = "0" + mm;
	if (dd < 10) dd = "0" + dd;
	if (h < 10) h = "0" + h;
	if (hh < 10) hh = "0" + hh;
	if (nn < 10) nn = "0" + nn;
	if (ss < 10) ss = "0" + ss;
	if (ms < 10) ms = "00" + ms;
	else if (ms < 100) ms = "0" + ms;
	tz = this.getTimezoneOffset();
	var gmt;
	if (tz < 0)
		gmt = "GMT-" +  tz / 60;
	else if (tz == 0)
		gmt = "GMT";
	else
		gmt = "GMT+" + tz / 60;
	tz = gmt;

	return strFormat.replace(/yyyy/ig,yyyy).replace(/yy/ig,yy
		).replace(/day/ig,day).replace(/ddd/ig,ddd).replace(/dd/ig,dd).replace(/d$/ig,d).replace(/d([^a-z])/ig,d+"$1"
		).replace(/gmt/ig,gmt).replace(/tz/ig,tz).replace(/ms/ig,ms
		).replace(/h24/ig,h24).replace(/h12/ig,h12).replace(/hh/ig,hh
		).replace(/^h/ig,h).replace(/([^a-z])h/ig,"$1"+h
		).replace(/month/ig,month).replace(/mmm/ig,mmm).replace(/mm/ig,mm).replace(/m$/ig,m).replace(/m([^a-z])/ig,m+"$1"
		).replace(/nn/ig,nn).replace(/ss/ig,ss).replace(/ap/ig,ap);
}
