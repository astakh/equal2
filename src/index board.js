var canvas = document.getElementById("paint")
var cursor = document.getElementById("zoom")
var screen = document.getElementById("screen")
var saveMenu = document.getElementsByClassName("save_menu")[0]
var scrpix = new Array(10);
let editmode = false;
let lookmode = true;
let screenmode = false; 
// params###########################
let xs = 500;
let ys = 300;
let ps = 2;
 
// отрисовка картинки
function drawpix(pix) {
    console.log("drawpix.. 0/0 = " + pix[0][0]);
    for(var x = 0; x < xs; x++) {
        for(var y = 0; y < ys; y++){
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
    }
})
document.getElementById("edit").addEventListener("click", function (e) {
    editmode = true; 
    lookmode = false;
    console.log("edit mode=true");
})

// формируем board
function getpic() {
    let pix = new Array(xs);
    let yt = false
    for(var x = 0; x < xs; x++) {
        yt = !yt;
        pix[x] = new Array(ys);
        for(var y = 0; y < ys; y++){
            if (yt) {pix[x][y] = "black";} else {pix[x][y] = "white";}
            yt = !yt;

        }
    }
    return pix;
}
// refresh
document.getElementById("refresh").addEventListener("click", function(e){
    if (lookmode) {
    drawpix(getpic());
    console.log("refreshed");}
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
    scrpix[px][py] = !scrpix[px][py]; 
    if (scrpix[px][py]) {
        scr.fillStyle = screencolor;
        scr.fillRect(px*screenwidth, py*screenwidth, screenwidth, screenwidth);
        console.log("mark: " + px + "|" + py + " with " + screencolor);
        console.log("draw: " + px*screenwidth + "|" + py*screenwidth)
    }
    else {
        scr.fillStyle = pix[px+crsx][py+crsy];
        scr.fillRect(px*screenwidth, py*screenwidth, screenwidth, screenwidth);
        console.log("unmark: " + px + "|" + py);
    }
    console.log("screen click: " + px + "|" + py);   

})


document.getElementById("color").addEventListener("click", function() {
    if (screenmode) {
    screencolor = document.getElementById("color").value;
    drawScreen()
    }
})

document.getElementById("save").addEventListener("click", function() {
    //document.getElementById("savemenu").style.visibility = "hidden";
    hide("savemenu");
    if (editmode) {
        for (var i = 0; i<10; i++) {
            for (var j = 0; j<10; j++) {
                if (scrpix[i][j]) {
                    pix[i+crsx][j+crsy] = screencolor;
                } 
                else { scr.fillStyle = pix[i+crsx][j+crsy];}
            }
        }
    }
    editmode = false;
    document.getElementById("zoom").style.visibility = "hidden";
    drawpix(pix);
})

document.getElementById("closescreen").addEventListener("click", function() {
    document.getElementById("savemenu").style.visibility = "hidden";
    editmode = false;
    document.getElementById("zoom").style.visibility = "hidden";
})


var screencolor = "";
var screenwidth = 10;
var crsx = 0;
var crsy = 0;
// Точка входа в скрипт 
if(canvas.getContext){
    canvas.width = xs*ps;
    canvas.height= ys*ps;
    cursor.width = 10*ps;
    cursor.height= 10*ps;
    screen.width = 10*10*ps;
    screen.height= 10*10*ps;
    let piccoords = document.getElementById("paint").getBoundingClientRect();
    var picx = piccoords.left;
    var picy = piccoords.top; 
    var picw = piccoords.width;
    var pich = piccoords.height; 


    var pix = getpic();
 
    var ctx = canvas.getContext("2d")
    var crs = cursor.getContext("2d")
    var scr = screen.getContext("2d")

    drawCursor();
    drawpix(pix);

    //drawField(10)
}