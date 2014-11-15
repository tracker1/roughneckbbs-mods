load("sbbsdefs.js");
load("inc_dates.js");

// BEFORE: text/menu/laston.???
// ROWS  :
// AFTER : text/menu/laston_foot.???

var header_footer_rows = 14; //rows used by the header+footer



var show_count = (argv.length > 0 && !isNaN(argv[0]))?parseInt(argv[0]):console.screen_rows - header_footer_rows; //number of logins to show
var u = new User(1);	// user object
var laston_list=new Array(); //array to hold recent users.


//Helper class for sorting information, and displaying lines.
function UserInfo(user_number) {
	this.number = user_number;
	this.logon getter = function() {
		var u = new User(this.number);
		return u.stats.laston_date;
	}

	this.writeLine = function() {
		var u = new User(this.number);

		var spacer = "                                                  ";
		
		var alias = u.alias + spacer;
		var age = " \1h\1k" + (u.age + spacer).substr(0,3);
		var sex = ((u.gender.toUpperCase() == "M")?"\1n\1bdude":"\1n\1mchic");
		var location = " \1h\1b" + (u.location + spacer).substr(0,24).replace(/([^a-z0-9])/ig,"\1n$1\1h\1b");
		var laston = (new Date(system.timestr(u.stats.laston_date)));
		laston = " \1n\1b" + laston.formatDate("mm\/dd\/yy h:nn").replace(/(\W)/g,"\1h\1k$1\1n\1b");
		var mode = u.connection + spacer;
	
		console.print("" +
			"\1h  \1n\1h" + alias.substr(0,20) +
			age + sex + location +
			"\1h\1b " + laston +
			"\1h\1k " + mode.substr(0,6) + "\1n\r\n"
		);

	}
}

function sortByLogon(a, b) {
	return a.logon - b.logon;
}

function main() {
	//display header
	console.clear()
	bbs.menu("laston");
	
	var lastuser;
	if(system.lastuser==undefined)  /* v3.10 */
		lastuser=system.stats.total_users;
	else                                                    /* v3.11 */
		lastuser=system.lastuser;
		
	for(var i=1; i<=lastuser; i++) {
	    u.number = i; //change to current user
	    if (
			u.stats.total_logons > 0
			&&
			u.compare_ars("NOT GUEST")
			&&
			((u.settings & USER_DELETED) != USER_DELETED)
	    )
	    	laston_list[laston_list.length] = new UserInfo(i);	
	}
	
	laston_list.sort(sortByLogon);
	
	
	var start = (laston_list.length > show_count) ? laston_list.length - show_count : 0;
	
	for (var i=start; i<laston_list.length; i++)
		laston_list[i].writeLine();
		
	//display footer.
	console.ansi_up(1);
	bbs.menu("laston_foot");
}

main();
