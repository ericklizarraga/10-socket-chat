
let usuario = null;
let socket = null;


//referencias
const txtUid = document.querySelector('#txtUid');
const txtMensaje = document.querySelector('#txtMensaje');
const ulUsuarios = document.querySelector('#ulUsuarios');
const ulMensajes = document.querySelector('#ulMensajes');
const btnSalir = document.querySelector('#btnSalir');

var url = (window.location.hostname.includes('localhost'))
  ? 'http://localhost:8080/api/auth/'
  : 'https://10-socket-chat-production.up.railway.app/api/auth/';


const validarJWT = async () => {

    const token = localStorage.getItem('token') || '';

    if (token.length <= 10) {
        window.location = 'index.html';
        throw new Error('no hay token en el server');
    }

    const respu = await fetch( url , {
        headers: {
            'x-token': token
        }
    });

    const { usuario: userDB, token: tokenDB } = await respu.json();
    localStorage.setItem('token', tokenDB);
    usuario = userDB;
    document.title = usuario.nombre;

    await conectarSocket();
}

const conectarSocket = async () => {

    socket = io({
        'extraHeaders': {
            'x-token': localStorage.getItem('token')
        }
    });

    //---------------------------

    socket.on('connect', () => {
        console.log('conectado');
    });

    //---------------------------

    socket.on('disconnect', () => {
        console.log('desconectado');
    });

    //---------------------------

    socket.on('recibir-mensaje', dibujarMensaje);

    //---------------------------

    socket.on('usuarios-conectados', dibujarUsuarios);

    //---------------------------

    socket.on('mensajes-privados', (payload) => {
        console.log('mensajes privados', payload);
    });
}

//-----------------------------------------------------------

const dibujarUsuarios = (usuarios = []) => {

    let usersHtml = '';
    usuarios.forEach(({ nombre, uid }) => {
        usersHtml += `
            <li>
                <p>
                    <h5 class="text-success"> ${nombre}</h5>
                    <span class="fs-6 text-muted">${uid}</span>
                </p>
            </li>
        `;
    });
    ulUsuarios.innerHTML = usersHtml;
}

//--------------------------------------------------------

const dibujarMensaje = (mensajes = []) => {

    let mensajesHTML = '';
    mensajes.forEach(({ nombre, mensaje }) => {
        mensajesHTML += `
            <li>
                <p>
                    <span class="text-primary"> ${nombre}:</span>
                    <span> ${mensaje}</span>
                </p>
            </li>
        `;
    });
    ulMensajes.innerHTML = mensajesHTML;
}

//-----------------------------------------------------------

txtMensaje.addEventListener('keyup', ({ keyCode }) => {

    const mensaje = txtMensaje.value;
    const uid = txtUid.value;

    if (keyCode !== 13) return;
    if (mensaje.trim().length === 0) return;

    socket.emit('enviar-mensaje', { mensaje, uid });
    txtMensaje.value = '';

});

//-----------------------------------------------------------

const main = async () => {
    await validarJWT();
}

main();