import { Signer } from '@waves/signer';
import { ProviderWeb } from '@waves.exchange/provider-web';
import { nodeInteraction } from "@waves/waves-transactions";
const nodeUrl = 'https://nodes-testnet.wavesnodes.com';
const dappAddress = '3N7Gg64FJ3ESaqn41qu1ete7zmzbmoP1AAV';
const signer = new Signer({NODE_URL: nodeUrl});
const provider = new ProviderWeb('https://testnet.waves.exchange/signer/')
signer.setProvider(provider);
// ######################################################################################################
document.getElementById("login").addEventListener("click", async function () {
    console.log("action: login");
    try {
        const user = await signer.login();
        console.log("user: ", user.address);
        document.getElementById("clameraddress").innerHTML = 'Your address is: ' + user.address;
        let status = await nodeInteraction.accountDataByKey(user.address,dappAddress,nodeUrl);
        document.getElementById("clamerstatus").innerHTML = status.value;
        document.getElementById("login").style.visibility = "hidden";
    } catch (e) { 
        console.error('new address');
        document.getElementById("clamerstatus").innerHTML = "you have not received your tokens yet"; 
        document.getElementById("loginstatus").value = "You are logged in";
        document.getElementById("clameblock").style.visibility = "visible";
    };
}); 

document.getElementById("js-invoke").addEventListener("click", async function () {
    let action = "Clame";
    console.log("action: " + action);
    try {
        const user = await signer.login();
        document.getElementById("clameraddress").innerHTML = 'Your address is: ' + user.address;
        console.log('user: ', user.address);
        let transaction = document.getElementById("transaction").value;
        document.getElementById("clamerstatus").innerHTML = "wait, please";
        console.log("start invoke");
        try {
            await signer.invoke({
                dApp: dappAddress,
                call: {
                    function: "call",
                    args:[{"type": "string", "value": transaction}]
                }
            }).broadcast({confirmations: 1}).then(resp => console.log(resp));

        // Read an answer from dApp data storage
            let answer = await nodeInteraction.accountDataByKey(user.address,dappAddress,nodeUrl);
            document.getElementById("clamerstatus").innerHTML = answer.value; 
            let answerstr = document.getElementById("clamerstatus").innerHTML;
 
            if (answerstr.indexOf('received') == 0) {
                console.log("received");
                let rdate = new Date(Number(answerstr.substr(12, 13)));
                document.getElementById("clameblock").style.visibility = "hidden";
                document.getElementById("clamerstatus").innerHTML = "you received at " + rdate; 
            }
            else {
                console.log("not received yet");
                document.getElementById("clamerstatus").innerHTML = answer.value;
            }
            
            console.log(answer.value);
        } catch (e) {
            console.error('Clame denied');
        }; 

    } catch (e) {
        console.error('Login rejected')
    };

});