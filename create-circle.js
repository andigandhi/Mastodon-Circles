/*
Dies ist eine erste Implementierung, da ist noch vieeeel zu tun :)
*/

let userInfo;
let connection_list = {};

// The main function called by the button-click
function circle_main() {
    // Get handle from Textfield
    let mastodon_handle = document.getElementById("txt_mastodon_handle").value;
    userInfo = formatedUserHandle(mastodon_handle);
    getStatuses();
    setTimeout(showConnections,3000);
}

// Format the Mastodon Handle to an array: [username, userID, instance.tld]
function formatedUserHandle(mastodon_handle) {
    // Remove leading @
    if (mastodon_handle.charAt(0) === '@') mastodon_handle = mastodon_handle.substr(1);
    // Split handle into name and 
    mastodon_handle = mastodon_handle.split("@");
    // Return the array
    return [mastodon_handle[0], getIdFromName(mastodon_handle[0], mastodon_handle[1]), mastodon_handle[1]];
}

// Get the user ID from the handle
function getIdFromName(name, server) {
    // https://mieke.club/api/v1/accounts/lookup?acct=HeilandSanremo
    var xmlHttp = new XMLHttpRequest();
    let url = "https://"+server+"/api/v1/accounts/lookup?acct="+name;
    xmlHttp.open( "GET", url, false ); // false for synchronous request
    xmlHttp.send( null );
    return JSON.parse(xmlHttp.responseText)["id"];
}

// Get a JSON String with all the posted statuses from the account and call processStatuses()
function getStatuses() {
    // Build the URL
    let url = "https://"+userInfo[2]+"/api/v1/accounts/"+userInfo[1]+"/statuses";
    // Do the async http request and call processStatuses()
    httpRequest(url, processStatuses);
}

// Process the JSON String into an array
function processStatuses(statuses) {
    jsonStat = JSON.parse(statuses);

    let request_limit = Math.min(30, jsonStat.length);

    console.log(request_limit)

    for (var i=0; i<request_limit; i++) {
        //if (jsonStat[i]["reblog"] != null) {
            evaluateStatus(jsonStat[i]["id"], (jsonStat[i]["favourites_count"]>0), (jsonStat[i]["reblogs_count"]>0));
        //}
    }
}

function evaluateStatus(id, faved, rebloged) {
    // Build the URL
    let url1 = "https://"+userInfo[2]+"/api/v1/statuses/"+id+"/reblogged_by";
    // Do the async http request
    if (rebloged) httpRequest(url1, addRepostConnections, 3);

    // Build the URL
    let url2 = "https://"+userInfo[2]+"/api/v1/statuses/"+id+"/favourited_by";
    // Do the async http request
    if (faved) httpRequest(url2, addRepostConnections, 1);
}

function addRepostConnections(jsonString, plus) {
    let jsonArray = JSON.parse(jsonString);
    
    for (var i=0; i<jsonArray.length; i++) {
        incConnectionValue(jsonArray[i], plus);
    }
}


// increment the relationship value by the integer "plus" (3 for reblogs, 1 for likes)
function incConnectionValue(conJSON, plus) {
    let id = conJSON["id"];
    // Test if a connection was already discovered
    if (!(id in connection_list)) {
        // NO? call addNewConnection and create the connection!
        addNewConnection(conJSON)
    }
    // Increment the connection strength
    connection_list[id]["conStrength"] = connection_list[id]["conStrength"] + plus;

    //document.getElementById("outDiv").innerText = JSON.stringify(connection_list);
}

// Create a new node in the connection_list dictionary
function addNewConnection(jsonArray) {
    connection_list[jsonArray["id"]] = {};
    connection_list[jsonArray["id"]]["conStrength"] = 0;
    connection_list[jsonArray["id"]]["acct"] = jsonArray["acct"];
    connection_list[jsonArray["id"]]["pic"] = jsonArray["avatar"];
    connection_list[jsonArray["id"]]["name"] = jsonArray["display_name"]
    connection_list[jsonArray["id"]]["bot"] = jsonArray["bot"];
}



function showConnections() {
    var items = Object.keys(connection_list).map(
        (key) => { return [key, connection_list[key]] });

    items.sort(
        (first, second) => { return second[1]["conStrength"] - first[1]["conStrength"] }
    );

    for (var i=0; i<items.length; i++) {
        //createUserObj(items[i][1])
        if (!items[i][1]["bot"]) createUserObj(items[i][1]);
    }
}

function createUserObj(usr) {
    console.log(usr)
    let usrElement = document.createElement("div");
    usrElement.innerHTML = "<img src=\""+usr["pic"]+"\" width=\"20px\"><b>"+usr["name"]+"</b>\t"+usr["acct"];
    document.getElementById("outDiv").appendChild(usrElement);
}


// Function for the http request
function httpRequest(url, callback, callbackVal=null)
{
    var xmlHttp = new XMLHttpRequest();
    xmlHttp.onreadystatechange = function() { 
        if (xmlHttp.readyState == 4 && xmlHttp.status == 200) {
            callback(xmlHttp.responseText, callbackVal);
        } else if (xmlHttp.readyState == 4 && xmlHttp.status == 404)
            callback("[]", callbackVal);
    }
    xmlHttp.open("GET", url, true);
    xmlHttp.send(null);
}