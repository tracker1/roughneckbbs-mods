function writeln(outputText) {
	console.print(outputText + "\r\n");
}
load("sbbsdefs.js");
load("inc_dates.js");
load("SynchroNet.DbUtil.RelayServiceClient.js");

var start=new Date();
try {
	var ret = ODBC_Query("SELECT DISTINCT `who` FROM `synchronet`.`logon` ORDER BY `when` DESC LIMIT 25");
	
	writeln(((new Date()) - start) + " milliseconds");
	
	writeln(ret);
} catch (err) {
	console.line_counter = 0;
	console.clear()
	if (err.type && err.message)
		writeln("\1h\1wERROR: " + err.type + "\1n\r\n" + err.message + "\r\n\r\n");
	else
		writeln(err.toString());
}

