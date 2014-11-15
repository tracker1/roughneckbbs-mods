/* $Id$ */
/* Used for rendering, and selecting from a list of options. */
/* Created By tracker1(at)theroughnecks(dot)net */

load("sbbsdefs.js");

if (!bbs.mods) bbs.mods = {};
if (!bbs.mods.vanguard) bbs.mods.vanguard = {};

bbs.mods.vanguard.selectList = function(options,x1,y1,x2,y2,defaultVal) {
	/*********************************************************************
	NOTES:
		ANSI ONLY, not friendly to ascii/plain text clients.
	======================================================================
	CONSTRUCTOR ARGUMENTS:
		options		an associative array of the options to select from;
		x1			left box position on the screen
		y1			top box position on the screen
		x2			right box position on the screen
		y2			bottom box position on the screen
		defaultVal	optional: value of current item from options array
	----------------------------------------------------------------------
	PROPERTIES: (only properties meant to be public are listed here)
		options		same as above
		x1			same as above
		y1			same as above
		x2			same as above
		y2			same as above
		normalText	prefixed to normal/unselected text
		selectedText prefixed to selected text
		onchange	function to call when a selection changes, passes ONE
					argument, the selected option's value
		raised		when choose() is called, the key that raised the
					return will be stored here, default null;
		value		the value of the current selection will be stored here
					if cancelled, will hold the original/default value.
	----------------------------------------------------------------------
	METHODS: (only properties meant to be public listed)
		choose		renders the select box, and returns the selected
					option's value, when one is selected, returns null
					if ctrl-c, or escape are pressed, returns the value
					on enter or tab
	*********************************************************************/
		
	// CONSTRUCTION
	try {
		if ((x1 == null) || (x1 == undefined) || (x1 < 1))
			throw("ArgumentError: x1 is invalid");
		if ((x2 == null) || (x2 == undefined) || (x2 < 1))
			throw("ArgumentError: x2 is invalid");
		if ((y1 == null) || (y1 == undefined) || (y1 < 1))
			throw("ArgumentError: y1 is invalid");
		if ((y2 == null) || (y2 == undefined) || (y2 < 1))
			throw("ArgumentError: y2 is invalid");
		if (5 > (x2 - x1))
			throw("ArgumentError: x2 must be at least x1 + 4");
		if (2 > (y2 - y1))
			throw("ArgumentError: y2 must be at least y1 + 1");

		this.padding = "                                                                                ";
		this.options = options;
		this.x1 = x1;
		this.x2 = x2;
		this.y1 = y1;
		this.y2 = y2;
		
		this.normalBackground = "\1n\1"+"0";
		this.normalForground = "\1w";
		this.normalHotkey = "\1h\1y";
		this.normalSpacer = "\1h\1k";
		
		this.selectedBackground = "\1n\1"+"4";
		this.selectedForground = "\1h\1w";
		this.selectedHotkey = "\1h\1y";
		this.selectedSpacer = "\1k";
		
		//this.normalText = "\1w\1n";
		//this.normalTextHotkey = "\1n\1h\1y";
		//this.selectedText = "\1n\1w\1h\1"+"4";
		//this.selectedTextHotkey = "\1n\1"+"4\1h\1y";
		
		this.spacer = " - "
		this.showKeys = false;
		this.padText = false;
		
		this.scrollBarUpOn = "\1n\1h\1w\036";
		this.scrollBarUpOff = "\1n\036";
		this.scrollBarDownOn = "\1n\1h\1w\037";
		this.scrollBarDownOff = "\1n\037";
		this.scrollBarBlock = "\1n\333";
		this.scrollBarBack = "\1n\1h\1k\262";
		this.scrolling = true;
		this.onchange = null;
		this.ontick = null;
		this.raised = null;
		this.defaultVal = defaultVal;
		this.value = defaultVal;
		this.current = 0;
		this.start = 0;
		this.opts = new Array(); //numeric array for internal use
		this.optsVal = new Array(); //numeric array for internal use
		
		for (var x in this.options) {
			this.opts[this.opts.length] = this.options[x];
			this.optsVal[this.optsVal.length] = x;
		}
	} catch(err) {
		console.print("\1n\1hERROR: \1n\r\n" + err + "\r\n\r\n");
		console.pause();
	}
	
	this.clear = function() {
		for (var i=this.y1; i<=this.y2; i++) {
			console.ansi_gotoxy(this.x1,i);
			for (var j=x1; j<=x2; j++)
				console.write(" ");
		}
	}
	
	this.renderScrollBar = function() {
		//show arrow
		console.ansi_gotoxy(this.x2,this.y1);
		if (this.current == 0)
			console.print(this.scrollBarUpOff);
		else
			console.print(this.scrollBarUpOn);
			
		
		//show down arrow
		console.ansi_gotoxy(this.x2,this.y2);
		if (this.current == this.opts.length-1)
			console.print(this.scrollBarDownOff);
		else
			console.print(this.scrollBarDownOn);

		//clear between
		for (var y = this.y1+1; y<this.y2; y++) {
			console.ansi_gotoxy(x2,y);
			console.print(this.scrollBarBack);
		}

		//show block - if needed
		if (this.y2 - this.y1 < this.opts.length-1) {
			var h = this.y2 - this.y1 - 2;
			var s = parseInt(h*(this.current+1)/this.opts.length);
			if (s > h-1) s == h-1;
			console.ansi_gotoxy(this.x2,this.y1+1+s);
			console.print(this.scrollBarBlock);
		}
	}
	
	this.getCurrentOption = function() {
		var ret="";
		var i = -1;
		for (x in this.options) {
			i++;
			if (i == this.current)
				ret = x;
		}
		
		return ret;
	}
	
	this.renderOptions = function() {
		var x1 = this.x1
		var x2 = this.x2 - 1;
		var y1 = this.y1;
		var y2 = this.y2;
		var w = x2 - x1 + 1;
		var h = y2 - y1 + 1;
		var keyLen = 0;
		
		if (this.current == 0) {
			this.start = 0;
		} else if (this.current <= this.start) {
			this.start = this.current - 1;
		} else if (this.current == this.opts.length - 1) {
			this.start = this.current - h + 1;
		} else if (this.current > this.start + h - 2) {
			this.start = this.current - h + 2;
		}
		
		if (this.start < 0)
			this.start = 0;
		
		for (var i=0; i<this.optsVal.length; i++)
			if (this.optsVal[i].indexOf("spacer") != 0 && this.optsVal[i].length > keyLen)
				keyLen = this.optsVal[i].length;
			
		console.ansi_gotoxy(x1,y1);
		
		var optVal;
		var optText;
		var optSpacer;
		for (var i=this.start,j=y1; j<=y2; i++,j++) {
			console.line_counter = 0;
			console.ansi_gotoxy(x1,j);
			
			
			if (i >= this.opts.length) {
				print(this.normalBackground + this.normalForground + this.padding.substring(0,w));
			} else {
				if (this.optsVal[i].indexOf("spacer") == 0) {
					optVal = "";
					optSpacer = this.padding.substring(0,w).replace(/ /g,"-");
					optText = "";
			 	} else if (this.showKeys) {
					optVal = this.padding + this.optsVal[i];
					optVal = optVal.substring(optVal.length - keyLen - ((this.padText)?1:0));
					optSpacer = this.spacer;
					optText = (this.opts[i] + this.padding).substring(0,w - keyLen - this.spacer.length - ((this.padText)?2:0)) + ((this.padText)?" ":"");
				} else {
					optVal = ""
					optSpacer = ""
					optText = ((this.padText)?" ":"") + (this.opts[i] + this.padding).substring(0,w - ((this.padText)?2:0)) + ((this.padText)?" ":"");
				}
				
				if (i == this.current) {
					print(
						this.selectedBackground +
						this.selectedHotkey +
						optVal + 
						this.selectedBackground +
						this.selectedSpacer +
						optSpacer +
						this.selectedBackground +
						this.selectedForground +
						optText
					);
				} else {
					print(
						this.normalBackground +
						this.normalHotkey +
						optVal + 
						this.normalBackground +
						this.normalSpacer +
						optSpacer +
						this.normalBackground +
						this.normalForground +
						optText
					);
						
				}
			}
		}
		
		this.renderScrollBar();
		
		this.value = this.getCurrentOption();
		if (this.onchange && typeof(this.onchange)=="function") this.onchange(this.value);
		
		console.ansi_gotoxy(x2+2,y2);
	}
	
	this.choose = function() {
		var init_passthru=console.ctrlkey_passthru;
		try {
			console.status &= ~(1<<8); //CON_RAW_IN - no raw input
			console.ctrlkey_passthru=~(0x08000000);
			this.raised = null; //reset raised value
			
			var ret = null;
			
			this.clear();
			this.renderOptions();
			
			var k = "";
			var x1 = this.x1;
			var x2 = this.x2 - 1;
			var y1 = this.y1;
			var y2 = this.y2;
			var w = x2 - x1 + 1;
			var h = y2 - y1 + 1;
			
			while (bbs.online && ret == null) {
				console.line_counter = 0;
				
				k = console.inkey();
				if (bbs.sys_status&SS_ABORT) { //ctrl-c
					bbs.sys_status &= ~SS_ABORT;
					k = "\3";
				}
				if (k == "" && ((system.node_list[bbs.node_num-1].misc&NODE_NMSG) != 0)||((system.node_list[bbs.node_num-1].misc&NODE_MSGW) != 0)) {
					this.raised = "";
					ret = "";
				} if (k != "") {
					if (this.onkeypress != null && typeof(this.onkeypress)=="function")
						this.onkeypress(k);
					
					//console.print(k.charCodeAt(0).toString(8));
					switch (k) {
						case(KEY_UP):
							this.current--;
							if (this.current < 0)
								this.current = this.opts.length - 1;
								
							while (this.optsVal[this.current].indexOf("spacer") == 0) {
								this.current--;
								if (this.current < 0)
									this.current = this.opts.length - 1;
							}
							
							this.renderOptions();
							break;
						case(KEY_DOWN):
							this.current++;
							if (this.current >= this.opts.length)
								this.current = 0;
							while (this.optsVal[this.current].indexOf("spacer") == 0) {
								this.current++;
								if (this.current >= this.opts.length)
									this.current = 0;
							}
							
							this.renderOptions();
							break;
						case "\r":
							ret = this.value;
							break;
						default:
							if (k == "") {
								ret = "";
							} else if (k.charCodeAt(0) < 32) { //raise control key
								this.raised = k;
								ret = "";
							} else {
								var firstMatch = -1; //first matching item
								var matches = 0; //count of matches
								for (var i=0; i<this.optsVal.length; i++) {
									var t = this.optsVal[i];
									if ((t.indexOf("spacer") != 0) && ((t.toLowerCase() == k.toLowerCase()) || (t.substring(0,1).toLowerCase() == k.toLowerCase()))) {
										if (firstMatch == -1) firstMatch = i;
										matches++
									}
								}
								if (firstMatch >= 0) {
									this.current = firstMatch;
									this.renderOptions();
									if (matches == 1)
										ret = this.optsVal[firstMatch];
								}
							}
							break;
					}
				} else if (this.ontick && typeof(this.ontick)=="function") {
					this.ontick();
					console.ansi_gotoxy(this.x2+1,this.y2);
				}
				sleep(10);
				
			}
			console.ansi_gotoxy(1,this.y2+1);
			
			console.ctrlkey_passthru=init_passthru;
		} catch(err) {
			ret = "";
			console.print("\1n\1hERROR: \1n\r\n" + err + "\r\n\r\n");
			console.pause();
		}
		console.ctrlkey_passthru=init_passthru;
		return ret;
	} // end choose()
} // end bbs.mods.vanguard.selectList