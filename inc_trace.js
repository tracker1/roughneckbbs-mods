//=============================================
// TRACE OBJECT - inc_trace.js
// --------------------------------------------
// load this in the top of any page in your
// sbbs-js project... set system.trace.status
// to true... then, use the warn() and write()
// methods to help in debugging code.
// ============================================

function TraceObject() {
	this.status = false;
	this.write = function(strSection, strNote) {
		if (this.status) {
			if (strNote) {
				if (bbs.online)
					printf("\1h \b\1nTRACE     : %-15s %-50s\r\n",strSection,strNote);
				log("TRACE: " + strSection + ", " + strNote);
			}else{
				if (bbs.online)
					printf("\1h \b\1nTRACE     : %-15s %-50s\r\n","",strSection);
				log("TRACE: , " + strSection);
			}
		}
	}
	this.warn = function(strSection, strNote) {
		if (this.status) {
			if (strNote) {
				if (bbs.online)
					printf("\1h \b\1n\1h\1rTRACE WARN: %-15s %-50s\r\n",strSection,strNote);
				log("TRACE WARN: " + strSection + ", " + strNote);
			}else{
				if (bbs.online)
					printf("\1h \b\1n\1h\1rTRACE WARN: %-15s %-50s\r\n","",strSection);
				log("TRACE WARN: , " + strSection);
			}
		}
	}
}
//if (!system.trace)
	system.trace = new TraceObject();
