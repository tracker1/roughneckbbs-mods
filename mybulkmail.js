// bulkmail.js

// Bulk email all users that match AR String input

// written by the hanged man, Solace BBS, solace.synchro.net

load("sbbsdefs.js");

const REVISION = "$Revision: 1.4 $".split(' ')[1];

print("Synchronet BulkMailer " + REVISION);

print("Enter ARS matches to send mail to or [ENTER] for everyone");

printf("ARS to match: "); 
if((ars=console.getstr(40,K_UPPER))==undefined)
	exit();

printf("\r\n\1y\1hSubject: ");

if((subj=console.getstr(70,K_LINE))=="")
	exit();

fname = "d:\\bulkmsg.txt";

//file_remove(fname)

//console.editfile(fname);

if(!file_exists(fname))	// Edit aborted
	exit();

file = new File(fname);
if(!file.open("rt")) {
    log("!ERROR " + errno_str + " opening " + fname);
    exit();
}
msgtxt = lfexpand(file.read(file_size(fname)));
file.close();
delete file;

if(msgtxt == "")
    exit();

msgbase = new MsgBase("mail");
if(msgbase.open()==false) {
	log("!ERROR " + msgbase.last_error);
	exit();
}

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

    if(u.stats.total_logons < 1)
    	continue;
    
	if(u.settings&(USER_DELETED|USER_INACTIVE))
		continue;

    if(!u.compare_ars(ars))
		continue;
		
	if (u.compare_ars("GUEST"))
		continue;

	/*checking for netmail forward */
//	if(u.settings&USER_NETMAIL && u.netmail.length)
		hdr = { to_net_addr: u.netmail, to_net_type: NET_INTERNET };
//	else
//		hdr = { to_ext: String(u.number) };
	
	hdr.to = u.alias;
	rcpt_list.push(hdr);

	printf("Sending mail to %s #%u\r\n", u.alias, i);
	log(format("Sending bulk mail message to: %s #%u", u.alias, i));
	sent++;
}

hdr = { from: "tracker1", from_net_addr: "tracker1@theroughnecks.net", from_ext: "1", subject: subj };  
if(!msgbase.save_msg(hdr, msgtxt, rcpt_list))
	log("!ERROR " + msgbase.last_error + "saving bulkmail message");

msgbase.close();

if(sent>1) {
	print("Sent bulk mail to " + sent + " users");
	log("Sent bulk mail message to " + sent + " users");
}
