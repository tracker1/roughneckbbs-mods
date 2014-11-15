load("sbbsdefs.js");

if(system.lastuser!=undefined)
	lastuser=system.lastuser;				// v3.11
else
    lastuser=system.stats.total_users;		// v3.10

var sent=0;
var rcpt_list=new Array();
var u = new User(0);	// user object

for(i=1; i<=lastuser; i++) {
	console.line_counter = 1;
    u.number = i;
    
    u.editor = "DCT";
    
    printf("Set: %s #%u\r\n", u.alias, i);
}