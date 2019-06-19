const rp = require('request-promise')
var readline = require('readline');
var randomWords = require('random-words');
var fs = require('fs');
var jp = require('jsonpath');

let environment
let amount
let num = 0;
var data=""
var acc=false
var ping=false
var cfg_out ={
    accounts: [],
    txs:""
}


console.log("\x1b[31m"+"***PAX Tester***"+"\x1b[0m")
function Init() {
  if (process.argv.length <= 2) {
      console.log("Usage:");
      console.log("---------------------------------------------")
      console.log(" npm run accont local - creates 2 test accounts for the localhosted environment http://localhost:3000")
      console.log(" npm run accont test - creates 2 test accounts for the test environment e.g http://blockexplorer.paxtalk.xyz:8080")
      console.log(" npm run <local/test> - creates 1000 txs forward AND 1000 backward between crated accounts")
      console.log(" npm run <local_forward/local_backward> <forward/backward> - creates 1000 txs forward O between crated accounts")
      console.log(" npm run <test_forward/test_backward>  - creates  1000 backward between crated accounts")
      console.log("---------------------------------------------")

      process.exit(-1);
  }
    process.argv.forEach((val, index) => {
    switch (val) {
          case "account":
            acc=true
            amount =process.argv[4]
            console.log("\x1b[32m","--- Test accounts creator---")
            break;
          case "test":
            url = "http://blockexplorer.paxtalk.xyz:8080"
            environment=process.argv[2];
            cfg=loadConfig(environment)
          break;
          case "local":
            url="http://localhost:3000"
            environment=process.argv[2];
             cfg=loadConfig(environment)
                break;
          case "forward":
              num=cfg.txs
                src_acc=cfg.accounts.src_acc
                src_acc_hash=cfg.accounts.src_acc_hash
                dest_acc=cfg.accounts.dest_acc
                dest_acc_hash=cfg.accounts.dest_acc_hash
                break;
          case "backward":
              num=cfg.txs
                src_acc=cfg.accounts.dest_acc
                src_acc_hash=cfg.accounts.dest_acc_hash
                dest_acc=cfg.accounts.src_acc
                dest_acc_hash=cfg.accounts.src_acc_hash
                break;
          case "ping":
                ping=true
                amount=1
                num=1
                src_acc=cfg.accounts.src_acc
                src_acc_hash=cfg.accounts.src_acc_hash
                dest_acc=cfg.accounts.dest_acc
                dest_acc_hash=cfg.accounts.dest_acc_hash
                break;
            default:
                return;
}
    })
}

function loadConfig(env){
  let rawdata = fs.readFileSync('./testcfg/'+env+'.json');
  return JSON.parse(rawdata);
}
async function Runner(hash) {
    let cmd = url + "/account/" + hash

    var options = {
        url: cmd,
        headers: {
            'User-Agent': 'tester'
        }
    };
    const result = await rp(options)

    body = JSON.parse(result);
      console.log("\x1b[33m"+"Command: "+"\x1b[0m"+cmd)
      console.log("\x1b[33m"+"Response: "+"\x1b[0m"+result)
    return body.result.nonce
}


async function AccRunner() {
    let cmd = url + "/account/new"

    var options = {
        method: "POST",
        url: cmd,
        headers: {
            'User-Agent': 'tester'
        }
    };
    const result = await rp(options)

    body = JSON.parse(result);
      console.log("\x1b[33m"+"Command: "+"\x1b[0m"+cmd)
    return body.result
}


async function newTx(from, to, amount, nonce,n) {
    let cmd = url + "/tx/new"
    console.log("\x1b[33m"+"Transaction: "+"\x1b[0m");//+"\x1b[0m"+`${from} -> ${to}`);
      var start = Date.now();
    for (var i = 1; i <= n; i++) {
        var options = {
            method: 'POST',
            uri: cmd,
            body: {
                "from": from,
                "to": to,
                "amount": amount,
                "message": randomWords({ exactly: 7, join: ' ' }),
                "nonce": ++nonce
            },
            json: true // Automatically stringifies the body to JSON
        };

        const result = await rp(options)
        readline.clearLine(process.stdout);
        readline.cursorTo(process.stdout, 0);

        process.stdout.write(`working(${i}) ... ${nonce}`);

    }
    var millis = Date.now() - start;
    process.stdout.write('\n')
    process.stdout.write("\x1b[36m"+`Time elapsed:`+"\x1b[0m"+` ${ millis/1000 } sec`);
    process.stdout.write('\n')
    return "\x1b[32m"+"----------D-O-N-E-----------" +"\x1b[0m"

}
function storeConfig(env){
  var fs = require('fs');
  var file_name=env+'.json'


  var json = JSON.stringify(cfg_out);

  fs.writeFile(file_name, json, 'utf8',(err) => {
  if (err) throw err;
  process.stdout.write("\x1b[31m"+`The file: ${file_name} has been saved!\n`+"\x1b[0m");

});
}
function createAccounts(env){
      var acc ={
          env: env,
          url: url,
          src_acc:"",
          src_acc_hash:"",
          dest_acc:"",
          dest_acc_hash:"",

      }
      AccRunner()
          .then((v) => {
      process.stdout.write(`Account `+"\x1b[31m"+`A`+"\x1b[0m"+` created: \n -Hash:${v.hash}\n -Key :${v.key}\n`);
         acc.src_acc=v.key;
         acc.src_acc_hash=v.hash;
         cfg_out.txs=amount
         cfg_out.accounts=acc;
         AccRunner()
             .then((v) => {
         process.stdout.write(`Account `+"\x1b[31m"+`B`+"\x1b[0m"+`  created: \n -Hash:${v.hash}\n -Key :${v.key}\n`);
         acc.dest_acc=v.key;
         acc.dest_acc_hash=v.hash;
         cfg_out.accounts=acc;
         storeConfig(environment)
             })
            .catch(console.error)
          })
         .catch(console.error)
}
function testPing(env){
for(var i=0; i<1000;++i){


    Runner(dest_acc_hash)
        .then((v) => {

          console.log("\x1b[33m"+"Start nonce: "+"\x1b[0m"+v)

            newTx(src_acc, dest_acc, 1, v,100)
                .then(console.log)
                  .catch(console.error)
                    Runner(src_acc_hash)
                      .then((v) => {

                        console.log("\x1b[33m"+"Start nonce: "+"\x1b[0m"+v)

                          newTx(src_acc, dest_acc, 1, v,100)
                              .then(console.log)
                                .catch(console.error)
                              })
                             .catch(console.error)
        })
       .catch(console.error)
}
}

Init()
console.log("\x1b[33m"+"Environment: " +"\x1b[0m"+ url)
if (ping){
  testPing(environment)
}else{
if (!acc){

Runner(dest_acc_hash)
    .then((v) => {
      console.log("\x1b[32m","--- Transactions creator ---" +"\x1b[0m")
      console.log("\x1b[33m"+"Start nonce: "+"\x1b[0m"+v)
        newTx(src_acc, dest_acc, 1, v,cfg.txs)
            .then(console.log)
              .catch(console.error)
    })
   .catch(console.error)
}else {
  var res=createAccounts(environment)


}}
