/* $Id$ */
/* Used for tracing errors. */
/* Created By tracker1(at)theroughnecks(dot)net */

if (!bbs.mods) bbs.mods = {};
if (!bbs.mods.vanguard) bbs.mods.vanguard = {};
if (!bbs.trace) {
	//used for rendering traceObject data
	bbs.mods.vanguard.traceLayers = 0;
	
	//object held in traceObject.stack
	bbs.mods.vanguard.traceItem = function(_type,_section,_message) {
		this.type = _type; // "branch", "write", "warn"
		this.section = _section; // "descriptive name"
		this.message = _message; // "message, unless a branch"
		this.trace = null; //traceObject, if a branch
		
		if (this.type == "branch") {
			//traceItem is a branch, load a trace object to hold children
			this.trace = new bbs.mods.vanguard.traceObject(_section);
			this.trace.enabled = true; //presume enabled, as parent should be.
		}
	}
	
	bbs.mods.vanguard.traceObject = function(_id) {
		this.id = _id;
		this.padding = "                                                                               ";
		this.enabled = false;
		this.stack = new Array();
		this.closed = false;
		
		//clear the stack
		this.clear = function() {
			this.stack = new Array();
		}
		
		//clear/close the traceObject, only if not _root
		this.close = function() {
			this.clear();
			if (this.id != "_root") this.closed = true;
		}		
	
		//create a branched item
		this.branch = function(routine) {
			if (this.enabled && !this.closed) {
				if ((this.stack.length > 0) && (this.stack[this.stack.length-1].type=="branch") && (!this.stack[this.stack.length-1].closed)) {
					this.stack[this.stack.length-1].trace.branch(routine)
				} else {
					this.stack[this.stack.length] = new bbs.mods.vanguard.traceItem("branch",routine,"");
				}
			}
		}
		
		//merge/close branched traceItem
		this.merge = function() {
			if (this.enabled && !this.closed) {
				if ((this.stack.length > 0) && (this.stack[this.stack.length-1].type=="branch") && (!this.stack[this.stack.length-1].closed)) {
					//last child is an open branch - merge child
					this.stack[this.stack.length-1].trace.merge();
				} else {
					//if this traceObject isn't _root, closes self;
					if (this.id != "_root")
						this.close();
				}
			}
		}
	
		//adds a warn message to the stack		
		this.warn = function(section,message) {
			if (this.enabled && !this.closed) {
				var sec = (message)?section:""; //only set if 2 items are passed
				var msg = (message)?message:section; //uses last param
				
				if ((this.stack.length > 0) && (this.stack[this.stack.length-1].type=="branch") && (!this.stack[this.stack.length-1].closed)) {
					//if last traceItem in stack is a branch, pass down.
					this.stack[this.stack.length-1].trace.warn(section,message);
				} else {
					//message for this traceObject
					this.stack[this.stack.length] = new bbs.mods.vanguard.traceItem("warn",sec,msg);
				}
			}
		}
		
		//adds a normal message to the stack, similar to warn
		this.write = function(section,message) {
			if (this.enabled && !this.closed) {
				var sec = (message)?section:"";
				var msg = (message)?message:section;
				if ((this.stack.length > 0) && (this.stack[this.stack.length-1].type=="branch") && (!this.stack[this.stack.length-1].closed)) {
					this.stack[this.stack.length-1].trace.write(section,message);
				} else {
					this.stack[this.stack.length] = new bbs.mods.vanguard.traceItem("write",sec,msg);
				}
			}
		}
		
		//uses console output if bbs.online, in addition to log output
		this.printLine = function(_line) {
			log(_line);
			if (bbs.online)
				print(_line);
		}
		
		//render the stack using the print() function...
		this.render = function(_err) {
			//display error description/message/toString if anything to display
			if (_err) {				
				if (_err.description) {
					this.printLine("\r\n\r\n\1h\1yAn Error Occured: \1n" + ((_err.number)?_err.number + " ":"") + _err.description + "\r\n");
				} else if (_err.message) {
					this.printLine("\r\n\r\n\1h\1yAn Error Occured: \1n" + ((_err.number)?_err.number + " ":"") + _err.message + "\r\n");
				} else {
					this.printLine("\r\n\r\n\1h\1yAn Error Occured: \1n" + _err.toString() + "\r\n");
				}
			}
			
			if (!this.enabled) {
				this.printLine("\1n\1y\1hNO STACK TO RENDER: \1ntrace.enabled is false.");
			} else {
				var prespace = "  ";
				
				if (bbs.mods.vanguard.traceLayers == 0)
					this.printLine("\1n\1y\1hRENDERING TRACE STACK:\1n ");
				else
					prespace = "                                                  ".substring(0,(bbs.mods.vanguard.traceLayers*2) + 2)
				
				if (this.closed) {
					this.printLine(prespace + "\1h\1n\1c" + this.id + "\1n{<closed>}");
				} else {
					this.printLine(prespace + "\1h\1n\1c" + this.id + "\1n{");
					
					bbs.mods.vanguard.traceLayers++;
					for (var i=0; i<this.stack.length; i++) {
						switch(this.stack[i].type) {
							case "branch":
								this.stack[i].trace.render();
								break;
							case "warn":
								this.printLine(
									prespace + "  " +
									"\1h\1w  " + (this.stack[i].section + this.padding).substring(0,18) +
									"\1r  " + (this.stack[i].message + this.padding).substring(0,(54 - prespace.length)) +
									"\1n "
								);
								break;
							case "write":
								this.printLine(
									prespace + "  " +
									"\1n\1h\1w  " + (this.stack[i].section + this.padding).substring(0,18) +
									"\1n  " + (this.stack[i].message + this.padding).substring(0,(54 - prespace.length)) +
									"\1n "
								);
								break;
						}
					}
					bbs.mods.vanguard.traceLayers--;
					
					this.printLine(prespace + "\1n} \1h\1k" + this.id + "\1n");
				}
				
				if (bbs.mods.vanguard.traceLayers == 0)
					this.printLine("");
			}
		} //end traceObject.render()
	} //end traceObject()


	//create bbs.trace object
	bbs.trace = new bbs.mods.vanguard.traceObject("_root");
}
