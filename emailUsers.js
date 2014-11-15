load("sbbsdefs.js");

var strSubject = "Roughneck BBS GT Friday";
var strMessage = "" +
	"I know many of you aren't from the Phoenix area, so disregard the GT \r\n" +
	"notice.. ;)\r\n" +
	"\r\n" +
	"Roughneck BBS first went online 2002-02-02, and for 4 years has\r\n" +
	"remained online consistantly... In celebration, I am hoping to get some \r\n" +
	"people together at Brigett's Last Laugh, on Cave Creek, Friday Night.\r\n" +
	"I will be there around 9pm, there will be Karaoke, and drinking.. \r\n" +
	"For more information and directions, see http://www.brigetts.com/\r\n" +
	"\r\n" +
	"After these emails go out, I will be nuking all accounts more than a \r\n" +
	"year old.\r\n" +
	"\r\n" +
	"-- \r\n" +
	"Michael J. Ryan - tracker1(at)theroughnecks(dot)net - www.theroughnecks.net\r\n" +
	"icq: 4935386  -  AIM/AOL: azTracker1  -  Y!: azTracker1  -  MSN/Win: (email)\r\n" +
	"";

function writeln(inline) {
	if (bbs.online)
		console.print(inline + "\r\n");
}

function emailAddr(name,alias,addr) {
	this.name = name;
	this.alias = alias;
	this.addr = addr;
}


function sendMessages(userEmails) {

	var mail = new MsgBase("mail");
	if(mail.open!=undefined && mail.open()==false) {
		var err_msg = "!ERROR " + msgbase.last_error;
		writeln(err_msg);
		log(err_msg);
		return;
	}

	for (var i=0; i<userEmails.length; i++) {
		em = userEmails[i];

		var hdr = {
			from:"Tracker1 - Roughneck BBS",
			from_net_addr:"tracker1@"+system.inetaddr,
			to:em.name,
			to_net_addr:em.addr,
			subject:strSubject + " ("+em.alias+" - "+(new Date()).formatDate("yyyy-mm-dd")+")",
			to_net_type:NET_INTERNET
			}
		writeln("     "+em.alias + " <" + em.addr+">");
		if (bbs.online)
			console.line_counter = 0;
		if (!mail.save_msg(hdr,strMessage)) {
			var err_msg = "!ERROR " + msgbase.last_error + " saving mail.";
			console.print(err_msg);
			log(err_msg);
		}
	}
	mail.close();
}

function getAddresses() {
	//get archived addresses.
	var ret = new Array();
	
	var exp_file = new File(system.data_dir + "mailing_temp.txt");
	if (!exp_file.open("r")) {
		writeln("unable to open file...\r\n");
		return ret;
	}

	var exp_old = exp_file.readAll();
	for (var i=0; i<exp_old.length; i++) {
		if (exp_old[i].indexOf("\t")) {
			var em = exp_old[i].split("\t");
			if (em.length == 3)
				ret[ret.length] = new emailAddr(em[0],em[1],em[2]);
		}
	}
	exp_file.close();
	return ret;
}

writeln("getting emails..");
var userEmails = getAddresses();
writeln("sending emails..");
sendMessages(userEmails);
writeln("sent " + userEmails.length + " emails.")
