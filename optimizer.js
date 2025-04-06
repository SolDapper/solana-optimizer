// name: optimizer.js
// author: @SolDapper
// license: MIT
'use strict';
import { PublicKey, Connection, TransactionMessage, VersionedTransaction, ComputeBudgetProgram } from "@solana/web3.js";
import bs58 from 'bs58';
import { createMemoInstruction } from '@solana/spl-memo';
class optimizer {
    constructor() {
      this.name = "solana-optimizer";
    }
    async send(rpc,tx){
        try{
            const connection = new Connection(rpc,"confirmed");
            const signature = await connection.sendRawTransaction(tx.serialize(),{skipPreflight:true,maxRetries:0});
            return signature;
        }
        catch(err){
            const _error_ = {}
            _error_.status="error";
            _error_.message=err;
            return _error_;
        }
    }
    async status(cluster,sig,max=10,int=4){
        return await new Promise(resolve=>{
            let start = 1;
            let connection = null;
            connection = new Connection(cluster, "confirmed");
            let intervalID = setInterval(async()=>{
            let tx_status = null;
            tx_status = await connection.getSignatureStatuses([sig], {searchTransactionHistory: true,});
            if (tx_status == null || 
            typeof tx_status.value == "undefined" || 
            tx_status.value == null || 
            tx_status.value[0] == null || 
            typeof tx_status.value[0] == "undefined" || 
            typeof tx_status.value[0].confirmationStatus == "undefined"){
                console.log("trying again...");
            } 
            else if(tx_status.value[0].confirmationStatus == "processed"){
                start = 1;
            }
            else if(tx_status.value[0].confirmationStatus == "confirmed"){
                console.log("confirming...");
                start = 1;
            }
            else if (tx_status.value[0].confirmationStatus == "finalized"){
                if(tx_status.value[0].err != null){
                resolve('program error!');
                clearInterval(intervalID);
                }
                resolve('finalized');
                clearInterval(intervalID);
            }
            start++;
            if(start == max + 1){
                resolve((max * int)+' seconds max wait reached');
                clearInterval(intervalID);
            }
            },(int * 1000));
        });  
    }
    async ComputeLimit(cluster,opti_payer,opti_ix,opti_tolerance,blockhash,opti_table=false){
        const connection = new Connection(cluster, 'confirmed');
        const opti_sim_limit = ComputeBudgetProgram.setComputeUnitLimit({units:1400000});
        const opti_fee_limit = ComputeBudgetProgram.setComputeUnitPrice({microLamports:10000});
        let re_ix = [];
        for (let o in opti_ix) {re_ix.push(opti_ix[o]);}
        opti_ix = re_ix;
        opti_ix.unshift(opti_sim_limit);
        opti_ix.unshift(opti_fee_limit);
        let opti_msg = null;
        opti_msg = new TransactionMessage({payerKey:opti_payer.publicKey,recentBlockhash:blockhash,instructions:opti_ix,}).compileToV0Message(opti_table);
        const opti_tx = new VersionedTransaction(opti_msg);    
        const opti_cu_res = await connection.simulateTransaction(opti_tx,{replaceRecentBlockhash:true,sigVerify:false,});
        if(opti_cu_res.value.err != null){
            return {"status":"error","message":"simulation error","details":opti_cu_res.value.err,"logs":opti_cu_res.value.logs};
        }
        const opti_consumed = opti_cu_res.value.unitsConsumed;
        const opti_cu_limit = Math.ceil(opti_consumed * opti_tolerance);
        console.log("setting cu limit", opti_cu_limit);
        return opti_cu_limit;
    }
    async FeeEstimate(cluster,payer,priority_level,instructions,blockhash,table=false){
        const connection = new Connection(cluster,'confirmed',);
        let re_ix = [];
        for (let o in instructions) {re_ix.push(instructions[o]);}
        instructions = re_ix;
        const _msg = new TransactionMessage({payerKey:payer.publicKey,recentBlockhash:blockhash,instructions:instructions,}).compileToV0Message(table);
        const tx = new VersionedTransaction(_msg);
        const response = await fetch(cluster, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
            jsonrpc: "2.0",
            id: "1",
            method: "getPriorityFeeEstimate",
            params: [
                {
                transaction: bs58.encode(tx.serialize()), // Pass the serialized transaction in Base58
                options: { priorityLevel: priority_level },
                },
            ],
            }),
        });
        let data = await response.json();
        data = parseInt(data.result.priorityFeeEstimate);
        if(data == 1){data = 100000;}
        if(data < 10000){data = 10000;}
        console.log("fee estimate", data);
        return data;
    }
    async tx(_data_){
        try{
            let _obj_={};let _rpc_;let _account_;let _instructions_;let _signers_;let _priority_;let _tolerance_;let _serialize_;let _encode_;let _table_;let _compute_;let _fees_;let _memo_;
            if(typeof _data_.rpc=="undefined"){_obj_.message="missing rpc";return _obj_;}else{_rpc_=_data_.rpc;}
            if(typeof _data_.account=="undefined"){_obj_.message="missing account";return _obj_;}else{_account_=_data_.account;}
            if(typeof _data_.instructions=="undefined"){_obj_.message="missing instructions";return _obj_;}else{_instructions_=_data_.instructions;}
            if(typeof _data_.signers=="undefined" || _data_.signers==false){_signers_=false;}else{_signers_=_data_.signers;}
            if(typeof _data_.priority=="undefined"){_priority_="Low";}else{_priority_=_data_.priority;}
            if(typeof _data_.tolerance=="undefined"){_tolerance_="1.1";}else{_tolerance_=_data_.tolerance;}
            if(typeof _data_.serialize=="undefined"){_serialize_=false;}else{_serialize_=_data_.serialize;}
            if(typeof _data_.encode=="undefined"){_encode_=false;}else{_encode_=_data_.encode;}
            if(typeof _data_.compute=="undefined"){_compute_=true;}else{_compute_=_data_.compute;}
            if(typeof _data_.fees=="undefined"){_fees_=true;}else{_fees_=_data_.fees;}
            if(typeof _data_.table=="undefined" || _data_.table==false){_table_=[];}else{_table_=[_data_.table];}
            if(typeof _data_.memo!="undefined" && _data_.memo!=false){_memo_=_data_.memo;}else{_memo_=false;}
            const _wallet_= new PublicKey(_account_);
            const connection = new Connection(_rpc_,"confirmed");
            const _blockhash_ = (await connection.getLatestBlockhash('confirmed')).blockhash;
            if(_priority_=="Extreme"){_priority_="VeryHigh";}
            let _payer_={publicKey:_wallet_}
            console.log("_memo_", _memo_);
            if(_memo_ != false){
                const memoIx = createMemoInstruction(_memo_,[new PublicKey(_account_)]);
                _instructions_.push(memoIx);
            }
            if(_compute_ != false){
                let _cu_ = null;
                _cu_= await this.ComputeLimit(_rpc_,_payer_,_instructions_,_tolerance_,_blockhash_,_table_);
                if(typeof _cu_.logs != "undefined"){
                    _obj_.status="error";
                    _cu_.message="there was an error when simulating the transaction";
                    return _cu_;
                }
                else if(_cu_==null){
                    _obj_.status="error";
                    _obj_.message="there was an error when optimizing compute limit";
                    return _obj_;
                }
                _instructions_.unshift(ComputeBudgetProgram.setComputeUnitLimit({units:_cu_}));
            }
            if(_fees_ != false){
                const get_priority = await this.FeeEstimate(_rpc_,_payer_,_priority_,_instructions_,_blockhash_,_table_);
                _instructions_.unshift(ComputeBudgetProgram.setComputeUnitPrice({microLamports:get_priority}));
            }
            let _message_ = new TransactionMessage({payerKey:_wallet_,recentBlockhash:_blockhash_,instructions:_instructions_,}).compileToV0Message(_table_);
            let _tx_ = new VersionedTransaction(_message_);
            if(_signers_!=false){
                _tx_.sign(_signers_);
            }
            if(_serialize_ === true){
                _tx_=_tx_.serialize();
            }
            if(_encode_ === true){
                _tx_= Buffer.from(_tx_).toString("base64");
            }
            if(_serialize_ == false || _encode_ == false){
                _obj_ = _tx_;
            }
            else{
                _obj_.status="ok";
                _obj_.message="success";
                _obj_.transaction=_tx_;
            }
            return _obj_;

        }
        catch(err){
            const _error_ = {}
            _error_.status="error";
            _error_.message=err;
            return _error_;
        }
    }
}
const _optimizer_ = new optimizer();
export default _optimizer_;