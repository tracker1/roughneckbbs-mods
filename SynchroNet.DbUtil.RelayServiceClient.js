//scripts from xmljs.sourceforge.net
load("sockdefs.js");
load("xmlsax.js");
load("xmlw3cdom.js");

var ODBC_RELAY_HOST = "127.0.0.1";
var ODBC_RELAY_PORT = "1000";

function ODBC_Error(_type,_message,_fulltext) {
	this.type = _type;
	this.message = _message;
	this.fulltext = _fulltext;
	
	this.toString = function() {
		return this.fulltext;
	}
}

function ODBC_Query(sqlQuery,connectionString) {
	var start = new Date();
	writeln("pre xmldom " + ((new Date()) - start))
	var dom = new DOMImplementation();
	var doc = dom.loadXML("<request></request>");
	var root = doc.getDocumentElement();
	root.setAttribute("type","select");
	
	if (connectionString != null && connectionString != undefined)
		root.setAttribute("connection",connectionString);
	
	root.appendChild(doc.createTextNode(dom.escapeString(sqlQuery)));
	
	writeln("pre socket" + ((new Date()) - start))
	
	var s = new Socket(SOCK_STREAM); //tcp
	s.setoption("TCP_NODELAY",true);
	
	writeln("pre socket connect " + ((new Date()) - start))
	if (!s.connect(ODBC_RELAY_HOST,ODBC_RELAY_PORT,5))
		throw new ODBC_Error("ConnectionException","Unable to connect to Relay Host.","ODBC_Query() >> ConnectionException: Unable to connect to Relay Host;")
	
	writeln("connected" + ((new Date()) - start))
		
	var RequestEnd = "--" + s.readln(50,5).replace("--","");
	var response = "";
	var buffer;
	
	writeln("-----BEGIN REQUEST-----\r\n" + root.toString() + "\r\n" + RequestEnd + "\r\n-----END REQUEST-----\r\n");
	s.send(root.toString() + "\r\n" + RequestEnd + "\r\n");
	
	while (s.is_connected) {
		if (s.data_waiting) {
			buffer = s.readln(4096,1);
			if (buffer.length > 0) {
				if (buffer.length == 4096)
					response += buffer;
				else
					response += buffer + "\r\n";
			}
		} //else
			//sleep(10);
	}
	while (s.data_waiting) {
		buffer = s.readln(4096,1);
		if (buffer.length > 0) {
			if (buffer.length == 4096)
				response += buffer;
			else
				response += buffer + "\r\n";
		}
	}
	s.close();
	writeln("done with response... " + ((new Date()) - start))
		
	response = response.substring(0,response.length - RequestEnd.length - 2); //.replace(RequestEnd,"");
	return response; //new ODBC_Recordset(response);
}

/*
function ODBC_ColDef(rs,data_type,column_name) {
	
}

function ODBC_Record(rs,arrColumns) {
	this.Col = function(column_name) {
	}
	this.cols = new Array();
}

function ODBC_Recordset(strXML) {
	this.colDefs = new Array();
	this.rows = new Array();
	
	var dom = new DOMImplementation();
	var doc = dom.loadXML(strXML);
	var root = doc.getDocumentElement();
	
	writeln(strXML  + "\r\n\r\n");
	writeln("|" + root.getAttribute("type") + "|");
	
	switch (root.getAttribute("type").toString()) {
		case "tabledata":
			//to do
			break;
		case "rowcount":
			throw parseInt(root.getFirstChild().getChildNodes());
			break;
		case "error":
			if (root.getFirstChild().nodeName == "error") {
				var err = root.getFirstChild();
				throw(
					new ODBC_Error(
						err.getAttribute("type"),
						err.getAttribute("message"),
						err.getChildNodes();
					)
				);
			}
		default:
			throw(new ODBC_Error("Invalid Response","Invalid Response From Relay Server","Invalid Response Exception: Invalid Response From Server."))
	}
}
*/