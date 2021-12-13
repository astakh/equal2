import { Signer } from '@waves/signer';
import { ProviderWeb } from '@waves.exchange/provider-web';
import { nodeInteraction } from "@waves/waves-transactions";
import { split } from '@waves/ts-lib-crypto';
const nodeUrl = 'https://nodes-testnet.wavesnodes.com';
const dappAddress = '3MxfEq17wZjAWQfckWycU9o4oTkvf9nfNQX';
const signer = new Signer({NODE_URL: nodeUrl});
const provider = new ProviderWeb('https://testnet.waves.exchange/signer/')
signer.setProvider(provider);
async function ditales() {
    let t = await nodeInteraction.accountDataByKey("issued",dappAddress,nodeUrl);
    let d = await nodeInteraction.accountDataByKey("dropped",dappAddress,nodeUrl);
    let g = await nodeInteraction.accountDataByKey("teamgift",dappAddress,nodeUrl);
    let s1= await nodeInteraction.accountDataByKey("sold1",dappAddress,nodeUrl);
    let s2= await nodeInteraction.accountDataByKey("sold2",dappAddress,nodeUrl);
    let b = await nodeInteraction.accountDataByKey("burnt",dappAddress,nodeUrl);
    let bs= await nodeInteraction.accountDataByKey("burningstage",dappAddress,nodeUrl);
    document.getElementById("issue").innerHTML = t.value/100000000;
    document.getElementById("drop").innerHTML = d.value/100000000;
    document.getElementById("sold1").innerHTML = s1.value/100000000;
    document.getElementById("sold2").innerHTML = s2.value/100000000;
    document.getElementById("team").innerHTML = g.value/100000000;
    document.getElementById("burnt").innerHTML = b.value/100000000;
    document.getElementById("distr").innerHTML = (t.value-d.value-g.value-s1.value-s2.value-b.value)/100000000;
    
}
async function userstatus(ua) {
    if (ua == '' || ua == null) {
        console.log("user status: is abcent, return 0");
        return 0;
    }
    else {
        let req = await nodeInteraction.accountDataByKey(ua,dappAddress,nodeUrl);
        if (req == null) {
            console.log("request returned null");
            document.getElementById("clamerstatus").innerHTML = " unknown";
            return 0; }
        else {
            console.log("request answer: " + req.value);
            document.getElementById("clamerstatus").innerHTML = req.value;
            document.getElementById("userstatus").innerHTML = req.value; 
            let answerstr = document.getElementById("userstatus").innerHTML;
            let status = answerstr.split("|");
            console.log("request answer status: " + status.length );
            return status.length; }
    }
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
        document.getElementById("loginstatus").innerHTML = "Logged in as: " + user.address;
        let ust = await userstatus(user.address);
        console.log("user status: " + ust);
        let v = blockvisibility(ust);
        
    } catch (e) { 
        console.error('login error');
    };
}); 
// #visibility##################################################################################
function blockvisibility (s) {
    let p = s;
    console.log("blockvisibility userstatus: " + p);
    let i = ditales();
    if (p == -1) {
        document.getElementById("login").style.visibility = "visible";
        document.getElementById("clameblock").style.visibility = "hidden";
        document.getElementById("buy1block").style.visibility = "hidden";
        document.getElementById("buy2block").style.visibility = "hidden";
    }
    if (p == 0) {
        document.getElementById("login").style.visibility = "hidden";
        document.getElementById("clameblock").style.visibility = "visible";
        document.getElementById("buy1block").style.visibility = "hidden";
        document.getElementById("buy2block").style.visibility = "hidden";
    }
    if (p == 1) {
        document.getElementById("login").style.visibility = "hidden";
        document.getElementById("clameblock").style.visibility = "hidden";
        document.getElementById("buy1block").style.visibility = "visible";
        document.getElementById("buy2block").style.visibility = "hidden";
    }
    if (p == 2) {
        document.getElementById("login").style.visibility = "hidden";
        document.getElementById("clameblock").style.visibility = "hidden";
        document.getElementById("buy1block").style.visibility = "hidden";
        document.getElementById("buy2block").style.visibility = "visible";
    }
    if (p > 2) {
        document.getElementById("login").style.visibility = "hidden";
        document.getElementById("clameblock").style.visibility = "hidden";
        document.getElementById("buy1block").style.visibility = "hidden";
        document.getElementById("buy2block").style.visibility = "hidden";
    }
    return true;
};
blockvisibility(-1);

// #buy2##################################################################################################
document.getElementById("buy2").addEventListener("click", async function () {
    let action = "buy2";
    console.log("action: " + action);
    try {
        const user = await signer.login();
        //document.getElementById("clameraddress").innerHTML = 'Your address is: ' + user.address;
        console.log('user: ', user.address);
        document.getElementById("message").innerHTML = " wait, please";
        document.getElementById("buy2block").style.visibility = "hidden";
        console.log("start invoke buy2");
        try {
            await signer.invoke({
                dApp: dappAddress,
                call: {
                    function: "buy",
                    args:[]
                },
                payment: [{amount: 200000000, assetId:null }]
            }).broadcast({confirmations: 1}).then(resp => console.log(resp));

            let error = await geterror(user.address);
            if (error == "") {
                let ust = await userstatus(user.address);
                console.log("buy2 user status: " + ust);

                if (ust == 3) {
                    console.log("buy1 saccess");
                    let v = blockvisibility(ust);
                    document.getElementById("message").innerHTML = " you bought2" ; 
                } else { document.getElementById("message").innerHTML = " not bought2 " ; };
                 
            }
            else {
                document.getElementById("message").innerHTML = " you not bought2, because " + error ; 
                let v = blockvisibility(0);
            }

        } catch (e) { console.error('buy2 denied: ' + e); }; 

    } catch (e) { console.error('Login rejected: ' + e) };

});


// #buy1##################################################################################################
document.getElementById("buy1").addEventListener("click", async function () {
    let action = "buy1";
    console.log("action: " + action);
    try {
        const user = await signer.login();
        //document.getElementById("clameraddress").innerHTML = 'Your address is: ' + user.address;
        console.log('user: ', user.address);
        document.getElementById("message").innerHTML = " wait, please";
        document.getElementById("buy1block").style.visibility = "hidden";
        console.log("start invoke buy1");
        try {
            await signer.invoke({
                dApp: dappAddress,
                call: {
                    function: "buy",
                    args:[]
                },
                payment: [{amount: 100000000, assetId:null }]
            }).broadcast({confirmations: 1}).then(resp => console.log(resp));
            console.log("look for errors");
            let error = await geterror(user.address);
            if (error == "") {
                let ust = await userstatus(user.address);
                console.log("buy1 user status: " + ust);

                if (ust == 2) {
                    console.log("buy1 saccess");
                    let v = blockvisibility(ust);
                    document.getElementById("message").innerHTML = " you bought1" ; 
                } else { document.getElementById("message").innerHTML = " not bought1 " ; };
                 
            }
            else {
                document.getElementById("message").innerHTML = " you not bought1, because " + error ; 
                let v = blockvisibility(0);
            }

        } catch (e) { console.error('buy1 denied: ' + e); }; 

    } catch (e) { console.error('Login rejected: ' + e) };

});

// #clame##################################################################################################
document.getElementById("js-invoke").addEventListener("click", async function () {
    let action = "Clame";
    console.log("action: " + action);
    try {
        const user = await signer.login();
        //document.getElementById("clameraddress").innerHTML = 'Your address is: ' + user.address;
        console.log('user: ', user.address);
        let transaction = document.getElementById("transaction").value;
        document.getElementById("message").innerHTML = " wait, please... trying to clame";
        document.getElementById("clameblock").style.visibility = "hidden";
        console.log("start invoke for: " + transaction);
        try {
            await signer.invoke({
                dApp: dappAddress,
                call: {
                    function: "free",
                    args:[{"type": "string", "value": transaction}]
                }
            }).broadcast({confirmations: 1}).then(resp => console.log(resp));
            let error = await geterror(user.address);
            if (error == "") {
                let ust = await userstatus(user.address);
                console.log("clame user status: " + ust);

                if (ust == 1) {
                    console.log("received");
                    let v = blockvisibility(ust);
                    document.getElementById("message").innerHTML = " you received your token" ; 
                } else { document.getElementById("message").innerHTML = " not received " ; };
                 
            }
            else {
                document.getElementById("message").innerHTML = " you not received, because " + error ; 
                let v = blockvisibility(0);
            }

            
        } catch (e) { console.error('Clame denied: ' + e); }; 

    } catch (e) { console.error('Login rejected: ' + e) };

});