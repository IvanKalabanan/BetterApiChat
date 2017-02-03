
# Socket.IO Chat

A simple chat demo for socket.io

## How to use

#### If you don't have node :
```
$ curl -sL https://deb.nodesource.com/setup_6.x | sudo -E bash -
$ sudo apt-get install -y nodejs
```
#### After
In main folder :
```
$ npm install
$ npm install socket.io --save
$ npm start
```
Change in `index.js` :
```js
server.listen(80,'192.168.1.18', function () { ...
```
 to your port and ip.
