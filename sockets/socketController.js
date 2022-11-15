const { Socket } = require("socket.io");
const { comprobarJWT } = require("../helpers");
const { ChatMensajes } = require("../models");

const chatMensajes = new ChatMensajes();

const socketController = async (socket = new Socket, io) => {

    const usuario = await comprobarJWT(socket.handshake.headers['x-token']);
    if (!usuario)
        return socket.disconnect();

    // console.log('se conecto', usuario.nombre);
    //agregar el usuario conectado

    chatMensajes.conectarUsuario(usuario);
    io.emit('usuarios-conectados', chatMensajes.usuariosArr);
    socket.emit('recibir-mensaje', chatMensajes.ultimos10);


    //conectar a una sal especial-- salas: global, socket.id, usuario.id
    socket.join(usuario.id)//se creo un sala con ese nombre ;

    //limpiar desconectados
    socket.on('disconnect', () => {
        chatMensajes.desconectarUsuario(usuario.id);
        io.emit('usuarios-conectados', chatMensajes.usuariosArr);
    });


    socket.on('enviar-mensaje', ({ uid, mensaje }) => {

        if (uid) {
            //mensajes privados// asia una sala esta emitiendo el evento
            socket.to(uid).emit('mensajes-privados', { de: usuario.nombre, mensaje });
        } else {
            chatMensajes.enviarMensajes(usuario.id, usuario.nombre, mensaje);
            io.emit('recibir-mensaje', chatMensajes.ultimos10);
        }

    });
}



module.exports = {
    socketController,
}