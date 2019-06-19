# PAX_LoadTest
Test utility that creates multiple transactons between accounts

### Installation

Requires [Node.js](https://nodejs.org/) v4+ to run.

Install the dependencies and devDependencies and start the server.

```sh
$ npm install -d
```
Create test config in folder `testcfg` in format [env].json. Example format below
```json
{  
   "accounts":{  
      "env":"",
      "url":"http://localhost:3000",
      "src_acc":"12343-1cd-21d",
      "src_acc_hash":"5181604",
      "dest_acc":"4f03-15ed-7b5",
      "dest_acc_hash":"3316e318"
   },
   "txs":1000
}
```


### Run
```sh
$ npm run [env] [options]
```
or
```sh
$ node qtest.js [env] [options]
```
