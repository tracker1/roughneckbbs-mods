load("sbbsdefs.js");

print("Nuking Old Users...\r\n");

var oUser = new User(1);

// (now as time_t) - (sec * min * hours * days)
var killDate = ((new Date()).valueOf()/1000) - (60 * 60 * 24 * 30); //30 days ago

//for each user number
for (i=1; i<=system.lastuser; i++) {
	oUser.number = i; //set to user #i

	// if last logon is less than kill date, and total logons less than 3
	if (oUser.stats.laston_date < killDate && oUser.stats.total_logons < 3) {
		
		//output username and laston...
		print("nuking " + oUser.alias + " laston " + (new Date(oUser.stats.laston_date * 1000)) + "\r\n");
		
		//mark user as deleted
		oUser.settings |= USER_DELETED;
	}
	
	//if running as a bbs user...
	if (console && console.line_counter) 
		console.line_counter = 0; //prevent pause prompts when run from the bbs...
}
