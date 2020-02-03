load("sbbsdefs.js");

print("Nuking Old Users ");

function ttyear(timeT) {
	return  ((new Date(timeT * 1000)).getYear() + 1900)
}

oUser = new User(1);
var killYear = ttyear((new Date()).valueOf()/1000) - 1;

for (i=1; i<=system.lastuser; i++) {
	oUser.number = i;

	if (ttyear(oUser.stats.laston_date) < killYear) {
		print("nuking " + oUser.alias + " laston " + (new Date(oUser.stats.laston_date * 1000)));
		oUser.settings |= USER_DELETED;
	}
	
	
	//if (console != undefined) console.line_counter = 0;
}
