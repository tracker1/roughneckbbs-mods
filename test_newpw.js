function genpass() {
	var pwchars='ACDEFHJKLMNPQRTUVWXY3479!?-=+&%*()';
	var pw='';

	for (var i=0;i<8;i++)
		pw+=pwchars.substr(parseInt(Math.random() * pwchars.length), 1);
		
	return(pw);
}

console.write(genpass() + "\r\n");
//console.write(base64_encode(parseInt(Math.random() * Math.pow(2, 64))).toUpperCase().substr(0,8) + "\r\n");
