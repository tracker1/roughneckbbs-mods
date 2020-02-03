/*****************************************************************************
                       Synchronet 3 Create New User Module
------------------------------------------------------------------------------
FILE NAME : create_new_user.js
CREATED BY: Michael J. Ryan (tracker1[at]theroughnecks.net)
CREATED ON: 2003-01-07
------------------------------------------------------------------------------
This file requires Synchronet v3.10g or newer.

This module will walk through a new user creation, and will email the password
to the user, instead of prompting for it... (telnet validation).

to use in your login.js
bbs.newuser = new Function("bbs.exec('?create_new_user.js');return false;");

for login.baja .. make sure to *NOT* login/on the user
exec "?create_new_user.js"

Changes by Merlin to stop it creating a temp user, only make it save to user
database when the entries are all done. It also fixes the bug that stops
users with a single username alias not being able to log on.

Also changed the password message.

*****************************************************************************/
load("sbbsdefs.js");
load("inc_dates.js");

// Global object, to store information, status set to deleted.
var newinfo = {}; //to temporarily store new user info.

var newHelp = {
	alias:"" +
		"\1l\1nYour Alias, also your username, is used for logging into this system.\r\n" +
		"In addition to being what others will see you as.  You may use letters,\r\n" +
		"numbers and spaces in your username.\r\n",
	handle:"\r\n\r\nYour Chat Handle is how people will see your messages when you are\r\n" +
		"in multinode chat on this bbs.\r\n",
	name:"\r\n\r\nBy entering your real name, it helps us to know who YOU are. If you\r\n" +
		"wish to maintain a certain anonymity, just put your First Name, and your\r\n" +
		"Last Initial.\r\n",
	gender:"",
	dob:"",
	location:"\r\n\r\nYour location will be displayed to other users while you are online\r\n" +
		"as well as in the user listing, and in the User Profiles.\r\n",
	email:"\1nYour email address is important for confirming lost passwords, as well as\r\n" +
		"allowing for your BBS email to be forwarded to your normal email.\r\n" +
		"Please give your REAL email address.  Your email address will never be shared\r\n" +
		"or given out.\r\n\r\n" +
		"\1h\1yYour email address is required, your password will be sent to it.\r\n",
	emailForward:"\r\nBy choosing to have bbs email forwarded, email that is recieved for\r\n" +
		"you on this BBS will be delivered to your email address on file.\r\n\r\n",
	phone:"",
}


//checks for an existing user with the value given
//   ex. checkForUser("alias","myUsername");
function checkForUser(info, input) {
	//console.print("\r\ncheckForUser(\"" + info.toString() + "\", \"" + input.toString() + "\")\r\n\r\n")
	var oUser = new User(0);
	
	if (info.toLowerCase() == "alias" && system.matchuser(input))
		return true;

	for (var i=1; i<=system.stats.total_users; i++) {
		oUser.number = i;
		
		if (!(oUser.settings&USER_DELETED)) {
			var info_chk = oUser[info] || "";

			if (info == "name") {
				if (input.substr(0,1).toLowerCase() == info_chk.substr(0,1).toLowerCase())
					sleep(250);
			}
				
			if (info_chk.toString().replace(/\W/g,"").toLowerCase() == input.toString().replace(/\W/g,"").toLowerCase())
				return true;
		}
	}
	return false;
}

//get ansi settings, if ansi was detected, use detected.
function getAnsiSettings() {
	bAuto = (console.autoterm&USER_AUTOTERM);
	bAnsi = (console.autoterm&USER_ANSI);
	bColor = (console.autoterm&USER_COLOR);
	bNoExAscii = (console.autoterm&USER_NO_EXASCII);

	user.settings |= USER_AUTOTERM;
	if (bAnsi)
		user.settings |= USER_ANSI;
	else
		user.settings &= ~USER_ANSI;
		
	if (bColor)
		user.settings |= USER_COLOR;
	else
		user.settings &= ~USER_ANSI;
		
	if (bNoExAscii)
		user.settings |= USER_NO_EXASCII;
	else
		user.settings &= ~USER_NO_EXASCII;
		
	return;
}

//get the alias/username
function getAlias() {
	if (!newinfo.alias)
		newinfo.alias = "";
	
	console.print(newHelp.alias);
		
	while(bbs.online) {
		console.print("\r\n\1n\1cPlease enter your desired Alias.\r\n\1h\1b:\1n ");
		newinfo.alias = console.getstr(newinfo.alias,25,K_EDIT)
		if (newinfo.alias == "") {
			if (!console.noyes("Abort new user creation")) {
				newinfo.abort = true;
				return;
			}
		} else if (!newinfo.alias.match(/^[a-z][\w\.\_' -]{1,}$/i))
			console.print("\r\n\1h\1yMust begin with a letter, and contain only\r\nletters, numbers, spaces, and \"'_.-\".\1n\r\n");
		else if (checkForUser("alias",newinfo.alias))
			console.print("\r\n\1h\1yA user with that alias already exists.\1n\r\n");
		else
			return;
	}
}

function getHandle() {
	if (!newinfo.handle)
		newinfo.handle = newinfo.alias.substr(0,8);
	var save = false;
	
	console.print(newHelp.handle);
	while(bbs.online && !save) {
		console.print("\r\n\1c\1cPlease enter your chat handle. \1h\1k(\1h\1bfor multinode chat\1k)\r\n:\1n ");
		newinfo.handle = console.getstr(newinfo.handle,8,K_EDIT)
		if (newinfo.handle == "") {
			if (!console.noyes("Abort new user creation")) {
				newinfo.abort = true;
				return;
			}
		} else if (!newinfo.handle.match(/^[a-z][\w ]{2,}$/i))
			console.print("\r\n\1h\1yMust begin with a letter, and contain only letters, numbers, and spaces.\1n\r\n");
		else if (checkForUser("handle",newinfo.handle))
			console.print("\r\n\1h\1yA user with that chat handle already exists.\1n\r\n");
		else
			save = true;
	}
}

function getName() {
	if (!newinfo.name)
		newinfo.name = "";
	var save = false;
	
	console.print(newHelp.name);
	while (bbs.online && !save) {
		console.print("\r\n\1n\1cPlease enter your REAL Name. \1h\1k(\1bfirst name and last initial is OK\1k)\1n\r\n: ");
		newinfo.name = console.getstr(newinfo.name,25,K_EDIT|K_UPRLWR)
		if (newinfo.name == "") {
			if (!console.noyes("Abort new user creation")) {
				newinfo.abort = true;
				return;
			}
		} else if (!newinfo.name.match(/^[a-z][a-z-]+ [a-z][a-z\.\_' -]*$/i))
			console.print("\r\n\1h\1yFirst and Last name. (only letters, spaces, and \"'.-\".)\1n\r\n");
		else if (checkForUser("name",newinfo.name))
			console.print("\r\n\1h\1yA user with that name already exists.\1n\r\n");
		else
			save = true;
	}
}

function getDOB() {
	var now = new Date();
	
	if (!newinfo.dob)
		newinfo.dob = now.formatDate("yyyy-mm-dd");
	
	var y = parseInt(newinfo.dob.split("-")[0]);
	var m = parseInt(newinfo.dob.split("-")[1]);
	var d = parseInt(newinfo.dob.split("-")[2]);
	var this_year = parseInt(now.formatDate("yyyy"));
	
	console.clear();
	console.print("\r\n\1n\1cPlease enter your date of birth.\1n\r\n");
	do {
		console.print("\1h\1byear : \1n");
		y = console.getstr(y.toString(),4,K_EDIT|K_NUMBER|K_AUTODEL);
		y = (isNaN(y))?1900:parseInt(y);
		if (y<=1900 || y>=this_year)
			console.print("\1h\1yEnter a full year (ex. 1975).\1n\r\n");
	} while (bbs.online && (y<(this_year - 100) || y>=this_year));

	do {
		console.print("\1h\1bmonth: \1n");
		m = console.getstr(m.toString(),2,K_EDIT|K_NUMBER|K_AUTODEL);
		m = (isNaN(m))?0:parseInt(m);
		if (m<1 || m>12)
			console.print("\1y\1hEnter a numeric month (1-12).\1n\r\n");
	} while (bbs.online && (m<1 || m>12));
	
	var max_d = (new Date(y,m,0,0,0,0,0)).formatDate("d");
	do {
		console.print("\1h\1bday  : \1n");
		d = console.getstr(d.toString(),2,K_EDIT|K_NUMBER|K_AUTODEL);
		d = (isNaN(d))?0:parseInt(d);
		if (d<1 || d>max_d)
			console.print("\1h\1yEnter a numeric day (1-"+max_d+").\1n\r\n");
	} while (bbs.online && (d<1 || d>max_d));
		
	newinfo.dob = (new Date(y,m-1,d,0,0,0,0)).formatDate("yyyy-mm-dd");
}

function getGender() {
	console.print("\r\n\r\n\1n\1cWhat gender are you? \1h\1k(\1bM or F\1k)\1b : \1n")
	newinfo.gender = console.getkeys("MF");
}

function getLocation() {
	if (!newinfo.location)
		newinfo.location = "";
	
	console.print(newHelp.location);
	do {
		console.print("\r\n\1n\1cPlease enter your location. \1h\1k(\1bex. City, State\1k)\r\n\1b: \1n");
		newinfo.location = console.getstr(newinfo.location,30,K_EDIT|K_NOEXASC);
		
		if (newinfo.location == "") {
			if (!console.noyes("Abort new user creation")) {
				newinfo.abort = true;
				return;
			}
		} else
			return;
	} while (bbs.online && !newinfo.location);
}

function getEmail() {
	if (!newinfo.email)
		newinfo.email = "";
		
	//console.print("\1l\1h\1yNOTE: \1nMany .RU addresses are blocking mail from this system.\r\n\r\n");
	//console.print("\1h\1yNOTE: \1nHotmail seems to be blocking mail from this system.\r\n\r\n");
	//console.print("\1h\1yNOTE: \1nYahoo is not delivering mail from this BBS.\r\n\r\n");
	
	console.print(newHelp.email);
	while (bbs.online) {
		console.print("\r\n\1n\1cPlease enter your email address.\r\n\1h\1b: \1n")
		newinfo.email = console.getstr(newinfo.email,60,K_EDIT).toLowerCase();
		
		if (newinfo.email.toLowerCase().indexOf('mailinator.com') >=0)
			newinfo.email = "";
		
		
		if (newinfo.email.match(/^[a-z0-9][\w\.\_-]*@[a-z0-9][\w\.\_-]+\.[a-z]{2,7}$/)) {
			//stupid filtering...
			if (newinfo.email.toLowerCase().indexOf("@yahoo.com") >= 0) {
				//console.print("\r\n\1n\1h\YAHOO.COM will probably block or put your new user email into your BULK folder.\1n\r\nPlease check in your junk mail folder a few minutes after submitting your \r\nnew user entry.\r\n");
				console.print("\r\n\1n\1h\YAHOO.COM is not delivering email from this BBS.\1n\r\nPlease use another email address.\r\n");
				continue;
			}
			
			if (newinfo.email.toLowerCase().indexOf("@hotmail.com") >= 0)
				console.print("\r\n\1n\1h\1yHOTMAIL.COM will probably block or put your new user email into your junk folder.\1n\r\nPlease check in your junk mail folder a few minutes after submitting your \r\nnew user entry.\r\n");
				
			if (newinfo.email.toLowerCase().indexOf("@msn.com") >= 0)
				console.print("\r\n\1n\1h\1yMSN.COM will probably block or put your new user email into your junk folder.\1n\r\nPlease check in your junk mail folder a few minutes after submitting your \r\nnew user entry.\r\n");
				
			console.print("\r\n\1n\1cPlease \1h\1yCONFIRM\1n\1c your email address.  \1nEnter nothing to change.\1h\1b\r\n: \1n");
			if (console.getstr("",60,K_EDIT).toLowerCase() == newinfo.email) {
				if (system.settings&SYS_FWDTONET) {
					console.print(newHelp.emailForward);
					newinfo.emailforward = console.yesno("Would you like to forward BBS mail to your email address");
				} else
					newinfo.emailforward = false;

				if (newinfo.email != "")
					newinfo.save = true;

				return;
			} else
				console.print("\r\n\1h\1yEmail addresses don't match.\1n\r\n");
		} else
			console.print("\r\n\1h\1yPlease enter a VALID email address. \1n(no ip addressing).\r\n");
	}
}

function saveNewUser(pwd) {
	var usr = system.new_user(newinfo.alias);
	usr.alias = newinfo.alias;
	usr.handle = newinfo.handle;
	usr.name = newinfo.name;
	
	var dob = newinfo.dob.split("-");
	dob = new Date(dob[0],dob[1]-1,dob[2],0,0,0,0)
	if (system.settings&SYS_EURODATE)
		usr.birthdate = dob.formatDate("dd/mm/yy");
	else
		usr.birthdate = dob.formatDate("mm/dd/yy");

	usr.gender = newinfo.gender;
	usr.location = newinfo.location;

	usr.security.password=pwd;	
	//usr.security.password_date = 0; //force change at next login
	
    usr.netmail = newinfo.email;
    
	if (newinfo.emailforward)
		usr.settings |= USER_NETMAIL;
	else
		usr.settings &= ~USER_NETMAIL;
	
	usr.settings |= USER_AUTOTERM;
	
	//remove netmail access to start
	usr.security.restrictions |= UFLAG_M;
	
	console.print("\1nSaved #"+ usr.number + " " + usr.alias + "\r\n");
	log("Saved #"+ usr.number + " " + usr.alias);
}

function sendPassword(pwd) {
	var mail = new MsgBase("mail");
	if(mail.open!=undefined && mail.open()==false) {
		var err_msg = "!ERROR " + msgbase.last_error;
		console.print(err_msg);
		log(err_msg);
		exit();
	}
	
	var hdr = {
		from:system.name,
		from_net_addr:"tracker1@roughneckbbs.com", //system.operator.toLowerCase()+"@"+system.inetaddr.toLowerCase(),
		to:newinfo.alias,
		to_net_addr:newinfo.email,
		subject:"Password for " + system.name,
		to_net_type:NET_INTERNET
		}
		
	var msg = "" +
		"Hello "+newinfo.alias+",\r\n"+
		"\r\n"+
		"This is your temporary password for "+system.inetaddr+"\r\n\r\n"+
		pwd + 
		"\r\n\r\n"; //+
		//"If you are on bbsmates.com, be sure to add this system to your profile.\r\n"+
		//"http://www.bbsmates.com/viewbbs.aspx?id=146809\r\n";
		
	if (!mail.save_msg(hdr,msg)) {
		var err_msg = "!ERROR " + msgbase.last_error + " saving mail.";
		console.print(err_msg);
		log(err_msg);
		exit();
	}
	
	
	//Operator Email
	msg = "" +
		"Alias         : "+newinfo.alias+"\r\n" +
		"Password      : "+pwd+"\r\n" +
		"Real name     : "+newinfo.name+"\r\n" +
		"Chat handle   : "+newinfo.handle+"\r\n" +
		"Location      : "+newinfo.location+"\r\n" +
		"Gender        : "+((newinfo.gender=="F")?"Female":"Male")+"\r\n" +
		"Date of birth : "+newinfo.dob+"\r\n" +
		"Email         : "+newinfo.email+((newinfo.emailforward)?" (forwarded)":"")+"\r\n";
	
	//tracker1
	hdr = {
		to: system.operator.toLowerCase(),
		to_ext: '1',
		from: newinfo.alias,
		replyto: newinfo.alias,
		replyto_net_addr: newinfo.email,
		subject: system.name + " New User Information (telnet)"
	};
	mail.save_msg(hdr,msg); //send to tracker1
	mail.close();

	console.print("\1nYour password has been sent to \1h\1w"+newinfo.email+"\n\r\n");
	console.print("\r\n\1n\1y\1hCheck your junk/spam folder.\r\n\1nIf you do not receive your password email within the next 20 minutes,\r\nemail tracker1@roughneckbbs.com and I should reply within a day.\1n\r\n");
	log("Password sent to " + newinfo.alias + " at " + newinfo.email);
}


function showInfo() {
	console.print("\r\n\r\n");
	console.print("\1h\1bAlias         \1k: \1n"+newinfo.alias+"\r\n");
	console.print("\1h\1bReal name     \1k: \1n"+newinfo.name+"\r\n");
	console.print("\1h\1bChat handle   \1k: \1n"+newinfo.handle+"\r\n");
	console.print("\1h\1bLocation      \1k: \1n"+newinfo.location+"\r\n");
	console.print("\1h\1bGender        \1k: \1n"+((newinfo.gender=="F")?"Female":"Male")+"\r\n");
	console.print("\1h\1bDate of birth \1k: \1n"+newinfo.dob+"\r\n");
	console.print("\1h\1bEmail         \1k: \1n"+newinfo.email+((newinfo.emailforward)?" (forwarded)":"")+"\r\n");
	console.print("\r\n");
}

function genpass() {
	var pwchars='ACDEFHJKLMNPQRTUVWXY23456789!?-=+&%*[]';
	var pw='';

	for (var i=0;i<8;i++)
		pw+=pwchars.substr(parseInt(Math.random() * pwchars.length), 1);
		
	return(pw);
}

function main() {
	bbs.user_event(EVENT_NEWUSER);
	system.node_list[bbs.node_num-1].status = NODE_NEWUSER;
	newinfo.saved = false;
	newinfo.abort = false;
		
	while (bbs.online && !(newinfo.abort||newinfo.saved)) {
		if (!newinfo.abort) getAlias();
		if (!newinfo.abort) getHandle();
		if (!newinfo.abort) getName();
		if (!newinfo.abort) getLocation();
		if (!newinfo.abort) getGender();
		if (!newinfo.abort) getDOB();
		if (!newinfo.abort) getEmail();
		
		if (newinfo.abort)
			console.print("\r\n\r\n\1h\1rAborted.\1n\r\n\r\n");
		else if (newinfo.save) {
			showInfo();
			if (console.yesno("Is this information correct (password will be emailed)")) {
				console.print("\1n");
				var passwd = genpass(); //base64_encode(parseInt(Math.random() * Math.pow(2, 64))).toUpperCase().substr(0,8);
				saveNewUser(passwd);
				sendPassword(passwd);
				return;
			} else if (!console.noyes("Abort new user creation")) {
				return;
			}
		}
	}
}
function preMain() {
	console.line_counter = 0
	console.clear();
	console.print("" +
	"\1n\1c======================================================\r\n" +
	"\1c\1h  DO *NOT* USE FAKE INFORMATION!!!\r\n" +
	"\1n\1c------------------------------------------------------\r\n" +
	"\1n\1n  You will not be able to login with a fake email\r\n" +
	"  address, and other fake information pisses me off\r\n" +
	"  there is no need for it.\r\n" +
	"\1n\1c------------------------------------------------------\r\n" +
	"\1n\1n  See http://www.theroughnecks.net/Privacy.aspx for \r\n" +
	"  our privacy policy... by creating an account here, \r\n" +
	"  you are presumed to agree to it. \r\n" +
	"\1n\1c------------------------------------------------------\r\n" +
	"\1n\1n  Use CTRL+C to abort new user creation. \r\n" +
	"\1n\1c======================================================\r\n" +
	"");
	console.pause();
}
preMain();
main();
console.pause();
