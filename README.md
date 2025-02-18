# solana-optimizer
builds, optimizes, serializes, and encodes a solana transaction for both apps and actions

# note
this tx optimizer requires a Helius RPC as it utilizes the getPriorityFeeEstimate method

# import
```javascript
import optimizer from 'solana-optimizer';
```

# example
```javascript

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
_tx_.priority = "Medium";             // string : VeryHigh,High,Medium,Low,Min
const tx = await optimizer.tx(_tx_);    // mcbuild

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