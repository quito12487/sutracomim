var app = require('express')();
var http = require('http').Server(app);
var io = require('socket.io')(http);
var PORT = process.env.PORT || 5000;
nicknames = {};

app.get('/',function(req,res){

	//res.send('<h1>Hola mundo</h1>');
	res.sendFile(__dirname +'/index.html');
});

io.sockets.on('connection',function(socket){
	console.log("usuario id : %s", socket.id);
	
	var channel = 'channel-a';

	socket.broadcast.emit('message','El Usuario '+socket.id+' se ha conectado!','System');
	socket.join(channel);
	socket.on('message',function(msj,user){
		//io.emit('message', msj,socket.id);
		console.log(user);
		io.sockets.in(channel).emit('message',msj,user);
		//enviar a todos del canal

		//socket.broadcast.to(channel)emit('message',msj,socket.id);
		//envia a todos el mensaje menos a mi
	});

	socket.on('newUser', function(data, callback){
		if(data in nicknames){
			callback(false);
		}else{
			callback(true);
			socket.nickname = data;
			nicknames[socket.nickname] = 1;
			socket.broadcast.emit('message','El Usuario '+socket.nickname+' se ha conectado!','System');
			updateNickNames();
		}
	});
	
	socket.on('disconnect',function(user){
		console.log("Desconectado :%s",user);
	});

	socket.on('change channel',function(newChannel){
			socket.leave(channel);
			socket.join(newChannel);
			channel = newChannel;
			socket.emit('change channel',newChannel);
	});

	socket.on('disconnect',function(){

		if(!socket.nickname) return;
		delete nicknames[socket.nickname];
		updateNickNames();
	});

	socket.on('stream',function(image){
		socket.broadcast.emit('stream',image);
	});

	function updateNickNames(){
		io.sockets.emit('usernames',nicknames);
	}
});


http.listen(PORT, function(){
	console.log('el servidor esta escuchando el puerto %s', PORT);
});
