# solana-optimizer
builds, optimizes, serializes, encodes a solana transaction for both apps and actions

![powered by solana](https://camo.githubusercontent.com/4a0138729f5af10f6389f7030f00eca28d2963932c6c21e7f397f077d8a908d7/68747470733a2f2f6364366e61326c6d6132323267706967766971637072356e377565776778643775686f636b6f66656c666c7375616f70376f69712e617277656176652e6e65742f45507a516157774774614d3942716f674a3865745f516c6a58482d683343553470466c584b6748502d3545)

# note
requires a helius rpc as it utilizes the getPriorityFeeEstimate method

# example
```javascript
import optimizer from 'solana-optimizer';
// create your instructions and then:
// optimize transaction
const _tx_ = {};
_tx_.rpc = rpc;     
_tx_.blink = false;                   // bool   : default false
_tx_.account = payer;                 // string : required
_tx_.instructions = [instruction];    // array  : required
_tx_.signers = false;                 // array  : default false
_tx_.serialize = false;               // bool   : default false
_tx_.encode = false;                  // bool   : default false
_tx_.table = false;                   // array  : default false
_tx_.tolerance = 1.1;                 // float  : default 1.1    
_tx_.compute = true;                  // bool   : default true
_tx_.fees = true;                     // bool   : default true
_tx_.priority = "Medium";             // string : VeryHigh,High,Medium,Low Min
_tx_.memo = "Awesome Memo Man!";      // string : default false
const tx = await optimizer.tx(_tx_);  
if(typeof tx.status!="undefined"){console.log(tx);}
else{
    const signed = await provider.signTransaction(tx);
    const signature = await optimizer.send(rpc,signed);
    console.log("signature", signature);
    console.log("awaiting status...");
    const status = await optimizer.status(rpc,signature);
    if(status!="finalized"){console.log("status", status);}
    else{console.log(status);}
}
```