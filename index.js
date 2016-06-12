var http = require('http');
var fs = require('fs');
var ipaddr = require('ipaddr.js');
var ldap = require('ldapjs');
var tempfile = require('tempfile');
var child_process = require('child_process').exec;


function sendNSUpdateFile(file){
    //TODO execute nsupdate cmd
    //`/usr/bin/nsupdate -k $key -v $file`;
}

function createNSUpdateFile(domain, ipAddress){
    updateFile = tempfile();
    console.log(updateFile);

    var ttl = "60";
    var ipToSend;
    var recordType;
    if (ipaddr.IPv4.isValid(ipAddress)) {
        // ipAddress is IPv4
        ipToSend = ipAddress
        recordType = "A";
    } else if (ipaddr.IPv6.isValid(ipAddress)) {
        var ip = ipaddr.IPv6.parse(ipAddress);
        if (ip.isIPv4MappedAddress()) {
            // ip.toIPv4Address().toString() is IPv4
            ipToSend = ip.toIPv4Address().toString();
            recordType = "A";
        } else {
            ipToSend = ipAddress;
            // ipAddress is IPv6
            recordType = "AAAA";
        }
    }

    fs.appendFileSync(updateFile, "update delete " + domain + " " + recordType + "\n");
    fs.appendFileSync(updateFile, "update add " + domain + " " + ttl + " " + ipToSend + "\n");
    fs.appendFileSync(updateFile, "send\n");
    return updateFile;
}

function authenticateUser(username, password){

}

function checkIfUserMayUpdateDomain(domain, username){

}

var server = http.createServer(function(req, res) {
    var ipAddress = req.headers['x-forwarded-for'] ||
        req.connection.remoteAddress ||
        req.socket.remoteAddress ||
        req.connection.socket.remoteAddress;

    var domain = req.url;
    domain = domain.replace(/\//g, '');

    var file = createNSUpdateFile(domain, ipAddress);
//    var returncode, message = sendNSUpdateFile(file);

    res.writeHead(200);
    res.end(domain);
//    console.log(ipToSend);
});
server.listen(8080);