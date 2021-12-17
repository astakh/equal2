import { Signer } from '@waves/signer';
import { ProviderWeb } from '@waves.exchange/provider-web';
import { nodeInteraction } from "@waves/waves-transactions";
import { messageDecrypt, split } from '@waves/ts-lib-crypto';
const nodeUrl = 'https://nodes-testnet.wavesnodes.com';
const dappAddress = '3MqnjEXWG6rvvRo2UDYRANN8iWLks7snDwj';
const signer = new Signer({NODE_URL: nodeUrl});
const provider = new ProviderWeb('https://testnet.waves.exchange/signer/')
signer.setProvider(provider);


var canvas = document.getElementById("paint")
var cursor = document.getElementById("zoom")
var screen = document.getElementById("screen")
//var saveMenu = document.getElementsByClassName("save_menu")[0]
var scrpix = new Array(10);
var editmode = false;
var lookmode = true;
var screenmode = false; 
var paintcommand = "";
var pricecommand = 0;
var markedcount  = 0;
var prevurl = "===";
// params###########################
var xs = 500;
var ys = 300;
var ps = 2;

var screencolor = "";
var screenwidth = 10;
var crsx = 0;
var crsy = 0;
var pix  = new Array(xs)
var url  = new Array(xs)
var price= new Array(xs);
for(var x = 0; x < xs; x++)  {
    pix[x]  = new Array(ys);
    url[x]  = new Array(ys);
    price[x]= new Array(ys);
    for (var y = 0; y < ys; y++) {
        pix[x][y] = "";
        url[x][y] = "";
        price[x][y] = 0;
    }
}
function message(m) {
    document.getElementById("message").innerHTML = m;
}

async function loadpix() {
    // clear pix
    for(var x = 0; x < xs; x++)  {
        pix[x] = new Array(ys);
        url[x] = new Array(ys);
        for (var y = 0; y < ys; y++) {
            pix[x][y] = "black"
            url[x][y] = ""
        }
    }
    let data = await nodeInteraction.accountDataByKey("",dappAddress,nodeUrl);
    console.log("data weight: " + data.length );

    data.forEach(function(item, index, array) {
        let n = parseInt(item.key)
        if (n>-1) {
            //console.log(index + ": pix" + n + "-" + item.value);
            let x = n % xs;
            let y = parseInt((n - x) / xs);
            let params = item.value.split("|");
            if (params.length > 3) { pix[x][y] = params[3];}
            else {pix[x][y] = "white"}
            if (params.length > 4) { url[x][y] = params[4];}
            //console.log("pixx:" + x + " pixy:" + y + "->" + pix[x][y]);
        }// else {console.log("item.key: " + item.key + " ->" + item.value);}
    });

    //console.log("in loadpix 0/0 = " + pix[0][0]);
    return pix;
    
}

function hide(el) {
    document.getElementById(el).style.visibility = "hidden";
};
function show(el) {
    document.getElementById(el).style.visibility = "visible";
};
async function geterror(ua) {
    if (ua == '' || ua == null) {
        console.log("not logged in");
        return -1;
    }
    else {
        let req = await nodeInteraction.accountDataByKey(ua + "_error",dappAddress,nodeUrl);
        if (req == null) {
            console.log("geterror request returned null");
            return ""; }
        else { 
            console.log("geterror request returned " + req.value); 
            return req.value; }
    }
};
// #login################################################################################################
document.getElementById("login").addEventListener("click", async function () {
    console.log("action: login");
    try {
        const user = await signer.login();
        console.log("user: " + user.address);
        document.getElementById("loginmessage").innerHTML = " Logged in as: " + user.address;
        hide("login");
        
    } catch (e) { console.error('login error'); };
}); 

// save##################################################################################################
document.getElementById("save").addEventListener("click", async function () {
    hide("savemenu");
    editmode     = true; 
    show("edit");
    lookmode     = false;
    show("refresh");
    editmode = false;
    lookmode = true;
    paintcommand = paintcommand + "||" + screencolor + "||" + document.getElementById("url").value;
    console.log("paintcommand=" + paintcommand);
    document.getElementById("zoom").style.visibility = "hidden";
    //drawpix();
    //###########################################
    let action = "save";
    console.log("action: " + action);
    try {
        const user = await signer.login();
        //document.getElementById("claimraddress").innerHTML = 'Your address is: ' + user.address;
        console.log('user: ', user.address);
        document.getElementById("message").innerHTML = " wait, please";
        
        console.log("start invoke save");
        try {
            await signer.invoke({
                dApp: dappAddress,
                call: {
                    function: "paint",
                    args:[{"type": "string", "value": paintcommand}]
                },
                payment: [{amount: 100000000, assetId:null }]
            }).broadcast({confirmations: 1}).then(resp => console.log(resp));

            let error = await geterror(user.address);
            console.log("error: " + error);
            if (error == "") {
                document.getElementById("message").innerHTML = " painted" ; 
            }
            else {
                document.getElementById("message").innerHTML = " not painted, because " + error ; 

            }
             
            drawpix();
        } catch (e) { console.error('save denied: ' + e); }; 
    } catch (e) { console.error('save Login rejected: ' + e) };

});

// отрисовка картинки
async function drawpix() {
    //console.log("in drawpix 0/0 = " + pix[0][0]);
    pix = await loadpix();
    for(var x = 0; x < xs; x++) {
        for(var y = 0; y < ys; y++) {
            ctx.fillStyle = pix[x][y];
            ctx.fillRect(x * ps, y * ps, ps, ps);
        }
    }
}
document.getElementById("paint").addEventListener("click", function (e) {
    if (editmode) {
        let cx = Math.min(Math.max(e.clientX - 5*ps, picx), picx + picw - 10*ps);
        let cy = Math.min(Math.max(e.clientY - 5*ps, picy), picy + pich - 10*ps);
        console.log("cursor coords: " + cx + "|" + cy);
        drawCursor(cx, cy);
        message("click on segment to edit it");
    }
    if (lookmode) {
        let px = parseInt((e.clientX - picx) / ps); // pixel coords
        let py = parseInt((e.clientY - picy) / ps);
        if (url[px][py] != "") {win = window.open("https://" + url[px][py]);}
    }
})
document.getElementById("paint").addEventListener("mousemove", function (e) {
    if (lookmode) {
        let px = parseInt((e.clientX - picx) / ps); // pixel coords
        let py = parseInt((e.clientY - picy) / ps);
        console.log("pixel url: " + url[px][py]);
        
        for(var x = 0; x < xs; x++)  {
            for (var y = 0; y < ys; y++) {
                if (url[x][y] == prevurl) {
                    ctx.fillStyle = pix[x][y];
                    ctx.fillRect(x * ps, y * ps, ps, ps);
                }
                if (url[x][y] == url[px][py] && url[px][py] != "") {
                    //console.log("same url: " + x + "|" + y);
                    ctx.fillStyle = "white";
                    ctx.fillRect(x * ps, y * ps, ps, ps);
                }
            }
        }
        prevurl = url[px][py];
        if (url[px][py]=="") { message(""); }
        else { message("https://" + url[px][py]); }
    }
})

document.getElementById("edit").addEventListener("click", function (e) {
    if (lookmode){
        editmode     = true; 
        hide("edit");
        lookmode     = false;
        hide("refresh");
        paintcommand = "";
        pricecommand = 0;    
        markedcount  = 0;
    }
    message("edit mode: click on board to choose segment for painting");
    console.log("edit mode=" + editmode + ", markedcount=" + markedcount);
})

// refresh
document.getElementById("refresh").addEventListener("click", function(e){
    if (lookmode) {
        console.log("refreshed");
        drawpix();
        message("refreshed");
    }
})

function drawCursor(x, y) {
    crsx = parseInt((x - picx)/ps); // pixel coords
    crsy = parseInt((y - picy)/ps);
    console.log("cursor pixel coords: " + crsx + "|" + crsy);
    if (editmode) {
        document.getElementById("zoom").style.top = y + "px";
        document.getElementById("zoom").style.left = x + "px";
        crs.fillStyle = "red";
        crs.fillRect(0, 0, 10*ps, 10*ps);
        //show("zoom");
        document.getElementById("zoom").style.visibility = "visible";
    }
}
function drawScreen() {
    if (editmode) {
        for (var i = 0; i<10; i++) {
            for (var j = 0; j<10; j++) {
                if (scrpix[i][j]) {
                    scr.fillStyle = screencolor;
                } 
                else { scr.fillStyle = pix[i+crsx][j+crsy];}
                scr.fillRect(i*screenwidth, j*screenwidth, screenwidth, screenwidth);
        
            }
        }

        //document.getElementById("screen").style.visibility = "visible";
    }
}
document.getElementById("zoom").addEventListener("click", function() {
    console.log("zoom click");
    screenmode = true;
    //show("savemenu");
    document.getElementById("savemenu").style.visibility = "visible";
    for (var i=0; i<10; i++) {
        scrpix[i] = new Array(10);
        for (var j=0; j<10; j++) {
            scrpix[i][j] = false;
        }
    }
    drawScreen();
})

document.getElementById("screen").addEventListener("click", function(e) {

    let scrcoords = document.getElementById("screen").getBoundingClientRect();
    let px = parseInt((e.clientX - scrcoords.left)/screenwidth);
    let py = parseInt((e.clientY - scrcoords.top)/screenwidth);
    if ((markedcount<29 && scrpix[px][py]==true) || (markedcount<28 && scrpix[px][py]==false)){
        scrpix[px][py] = !scrpix[px][py]; 
        if (scrpix[px][py]) {
            markedcount++;
            scr.fillStyle = screencolor;
            scr.fillRect(px*screenwidth, py*screenwidth, screenwidth, screenwidth);
        }
        else {
            markedcount--;
            scr.fillStyle = pix[px+crsx][py+crsy];
            scr.fillRect(px*screenwidth, py*screenwidth, screenwidth, screenwidth);
        }
        console.log("marked: " + markedcount);
        console.log("screen click: " + px + "|" + py);   
        let marked = []
        let l = 0;
        pricecommand = 0;
        for (var i=0; i<10; i++) {
            for (var j=0; j<10; j++) {
                if (scrpix[i][j]) {
                    marked[l] = (i+crsx)+(j+crsy)*xs;
                    l++;
                    pricecommand += price[px+crsx][py+crsy];
                };
            }
        }
        paintcommand = marked.join("|");
        message("");
        console.log("paintcommand=" + paintcommand);
    }
    else {
        message("max 28 pixs per painting");
    }

})


document.getElementById("color").addEventListener("change", function() {
    if (screenmode) {
    screencolor = document.getElementById("color").value;
    drawScreen();
    }
})
 
document.getElementById("closescreen").addEventListener("click", function() {
    show("edit");
    show("refresh");    
    hide("savemenu");
    hide("zoom");
    editmode = false;
    lookmode = true;
})


//###################################################################
if(canvas.getContext){
    canvas.width = xs*ps;
    canvas.height= ys*ps;
    cursor.width = 10*ps;
    cursor.height= 10*ps;
    screen.width = 10*10;
    screen.height= 10*10;
    var piccoords = document.getElementById("paint").getBoundingClientRect();
    var picx = piccoords.left;
    var picy = piccoords.top; 
    var picw = piccoords.width;
    var pich = piccoords.height; 
 
 
    var ctx = canvas.getContext("2d")
    var crs = cursor.getContext("2d")
    var scr = screen.getContext("2d")

    drawCursor();
    drawpix();

    //drawField(10)
}