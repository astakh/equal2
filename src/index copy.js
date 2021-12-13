import { Signer } from '@waves/signer';
import { ProviderWeb } from '@waves.exchange/provider-web';
import { nodeInteraction } from "@waves/waves-transactions";
import { split } from '@waves/ts-lib-crypto';
const nodeUrl = 'https://nodes-testnet.wavesnodes.com';
const dappAddress = '3MxfEq17wZjAWQfckWycU9o4oTkvf9nfNQX';
const signer = new Signer({NODE_URL: nodeUrl});
const provider = new ProviderWeb('https://testnet.waves.exchange/signer/')
signer.setProvider(provider);
function userstatus(serveranswer) {
    if (serveranswer == null) {
        console.log("user status: " + 0)
        return 0;
    }
    else {
        document.getElementById("clamerstatus").innerHTML = serveranswer.value; 
        let answerstr = document.getElementById("clamerstatus").innerHTML;
        let status = answerstr.split("|");
    return status.length; }
};
// #login################################################################################################
document.getElementById("login").addEventListener("click", async function () {
    console.log("action: login");
    try {
        const user = await signer.login();
        console.log("user: ", user.address);
        document.getElementById("loginstatus").innerHTML = "Logged in as: " + user.address;
        let serveranswer = await nodeInteraction.accountDataByKey(user.address,dappAddress,nodeUrl);
        if (serveranswer !== null) {
            console.log("userstatus: " + userstatus(serveranswer));
            let v = blockvisibility(userstatus(serveranswer));}
        else {
            document.getElementById("clamerstatus").innerHTML = "you have not received your tokens yet"; 
            let v = blockvisibility(userstatus(serveranswer));
        }
    } catch (e) { 
        console.error('login error');
    };
}); 
// #visibility##################################################################################
function blockvisibility (s) {
    let p = Number(s);
    console.log("status:" + p);
    console.log("blockvisibility userstatus: " + p);
    if (p > -1) {
        document.getElementById("login").style.visibility = "hidden";
        if (p == 0) {document.getElementById("clamerstatus").innerHTML = " not received"; }
        if (p == 1) {document.getElementById("clamerstatus").innerHTML = " received"; }
        if (p == 2) {document.getElementById("clamerstatus").innerHTML = " received|bought1"; }
        if (p == 3) {document.getElementById("clamerstatus").innerHTML = " received|bought1|bought2"; }
    }
    if (p == 0) {
        document.getElementById("clameblock").style.visibility = "visible";
        document.getElementById("buy1block").style.visibility = "hidden";
        document.getElementById("buy2block").style.visibility = "hidden";
    }
    if (p == 1) {
        document.getElementById("clameblock").style.visibility = "hidden";
        document.getElementById("buy1block").style.visibility = "visible";
        document.getElementById("buy2block").style.visibility = "hidden";
    }
    if (p == 2) {
        document.getElementById("clameblock").style.visibility = "hidden";
        document.getElementById("buy1block").style.visibility = "hidden";
        document.getElementById("buy2block").style.visibility = "visible";
    }
    if (p > 2) {
        document.getElementById("clameblock").style.visibility = "hidden";
        document.getElementById("buy1block").style.visibility = "hidden";
        document.getElementById("buy2block").style.visibility = "hidden";
    }
    return true;
};

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

            let answer = await nodeInteraction.accountDataByKey(user.address,dappAddress,nodeUrl);
            
            if (userstatus(answer) == 3) {
                console.log("bought");
                let v = blockvisibility(userstatus(answer));
                document.getElementById("message").innerHTML = "you bought2 " ; 
            } else { document.getElementById("message").innerHTML = "not buy2 " ; };
            console.log(answer.value);
        } catch (e) { console.error('buy2 denied'); }; 

    } catch (e) { console.error('Login rejected') };

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

            let erroranswer = await nodeInteraction.accountDataByKey(user.address + "_error",dappAddress,nodeUrl);
            if (erroranswer == null) {

                let answer = await nodeInteraction.accountDataByKey(user.address,dappAddress,nodeUrl);
                
                if (userstatus(answer) == 2) {
                    console.log("bought");
                    let v = blockvisibility(userstatus(answer));
                    document.getElementById("message").innerHTML = " you bought1 " ; 
                } else { document.getElementById("message").innerHTML = " not buy1 " ; };
                console.log(answer.value);
            }
            else {
                document.getElementById("message").innerHTML = " you not bought, because " + erroranswer.value ;
                let v = blockvisibility(userstatus(answer));
            }
        } catch (e) { console.error('buy1 denied'); }; 

    } catch (e) { console.error('Login rejected') };

});

// #free##################################################################################################
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
            let erroranswer = await nodeInteraction.accountDataByKey(user.address + "_error",dappAddress,nodeUrl);
            if (erroranswer == null) {
                let answer = await nodeInteraction.accountDataByKey(user.address,dappAddress,nodeUrl);
            
                if (userstatus(answer) > 0) {
                    console.log("received");
                    let v = blockvisibility(userstatus(answer));
                    document.getElementById("message").innerHTML = " you received " ; 
                } else { document.getElementById("message").innerHTML = " not received " ; };
                console.log(answer.value);
            }
            else {
                document.getElementById("message").innerHTML = " you not received, because " + erroranswer.value ; 
                let v = blockvisibility(userstatus(answer));
            }

            
        } catch (e) { console.error('Clame denied'); }; 

    } catch (e) { console.error('Login rejected') };

});