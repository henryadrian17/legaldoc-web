const API_URL = 'http://localhost:8080/legaldoc/api/v1/';
function registrarUsuario() {
    let usuario = {
        nombre: document.getElementById('nombre'),
        apellido: document.getElementById('apellido'),
        fechaNacimiento: document.getElementById('cumpleanos'),
        correo: document.getElementById("exampleInputEmail1"),
        contrasena: document.getElementById("exampleInputPassword1"),
        contrasenaConfirmacion: document.getElementById("exampleInputPassword2"),
    };
    // validar que los campos no esten vacios
    if (usuario.nombre.value == "" || usuario.apellido.value == "" || usuario.fechaNacimiento.value == "" || usuario.correo.value == "" || usuario.contrasena.value == "" || usuario.contrasenaConfirmacion.value == "") {
        SwalError("Todos los campos son obligatorios");
    } else if (usuario.contrasena.value != usuario.contrasenaConfirmacion.value) {
        SwalError("Las contraseñas no coinciden");
    } else {
        let url = API_URL.concat('register');
        let data = {
            nombre: usuario.nombre.value,
            apellido: usuario.apellido.value,
            fechaNacimiento: usuario.fechaNacimiento.value,
            correo: usuario.correo.value,
            contrasena: usuario.contrasena.value,
            contrasenaConfirmacion: usuario.contrasenaConfirmacion.value,
        };
        //Swal loading
        SwalLoading("Registrando usuario...");
        fetch(url, {
            method: 'POST',
            body: JSON.stringify(data),
            headers: {
                'Content-Type': 'application/json'
            }
        }).then(function (response) {
            return response.json();
        }).then(function (data) {
            if (data.serviceStatus.status == 201) {
                /*
                {
                    "data": {
                        "apellido": "Molina",
                        "nombre": "Henry",
                        "tockenDeAcceso": "N5vk3f2PXjNTYuxtlHo+9qKT0vvNEgVTPeBx6jwY2b4=",
                        "fechaExpiracionTocken": "2022-07-04T19:34:40.561-05:00"
                    },
                    "serviceStatus": {
                        "status": 201,
                        "message": "Usuario creado satisfactoriamente"
                    }
                }
                 */
                document.cookie = "tockenDeAcceso=" + data.data.tockenDeAcceso + "; expires=" + data.data.fechaExpiracionTocken + "; path=/";
                SwalRedirect("Usuario creado satisfactoriamente", "/");
            } else {
                SwalError(data.serviceStatus.message);
            }
        }).catch(function (error) {
            SwalError("Error al registrar usuario");
        });
    }
}
function ingresarUsuario(){
    let usuario = {
        correo: document.getElementById("exampleInputEmail1"),
        contrasena: document.getElementById("exampleInputPassword1"),
    };
    // validar que los campos no esten vacios
    if (usuario.correo.value == "" || usuario.contrasena.value == "") {
        SwalError("Todos los campos son obligatorios");
    } else {
        let url = API_URL.concat('login');
        let data = {
            correo: usuario.correo.value,
            contrasena: usuario.contrasena.value,
        };
        //Swal loading
        SwalLoading("Ingresando...");
        fetch(url, {
            method: 'POST',
            body: JSON.stringify(data),
            headers: {
                'Content-Type': 'application/json'
            }
        }).then(function (response) {
            return response.json();
        }).then(function (data) {
            if (data.serviceStatus.status == 200) {
                /*
                {
                    "data": {
                        "apellido": "Molina",
                        "nombre": "Henry",
                        "tockenDeAcceso": "N5vk3f2PXjNTYuxtlHo+9qKT0vvNEgVTPeBx6jwY2b4=",
                        "fechaExpiracionTocken": "2022-07-04T19:34:40.561-05:00"
                    },
                    "serviceStatus": {
                        "status": 200,
                        "message": "Usuario autenticado satisfactoriamente"
                    }
                }
                 */
                document.cookie = "tockenDeAcceso=" + data.data.tockenDeAcceso + "; expires=" + data.data.fechaExpiracionTocken + "; path=/";
                SwalRedirect("Bienvenido ".concat(data.data.nombre), "/");
            } else {
                SwalError(data.serviceStatus.message);
            }
        }).catch(function (error) {
            SwalError("Error al ingresar");
        });
    }
}
function verificarSesion() {
    console.log("verificando sesion");
    if(document.cookie.indexOf("tockenDeAcceso=") === -1 && window.location.pathname !== "/login" && window.location.pathname !== "/register" && window.location.pathname !== "/"){
        SwalRedirect("No hay sesion iniciada", "/login");
    }
    let tockenDeAcceso = document.cookie.split("tockenDeAcceso=")[1].split(";")[0];
    console.log(tockenDeAcceso);
    if (tockenDeAcceso == "") {
        SwalRedirect("No hay sesion iniciada", "/login");
    }
    else if (window.location.pathname == "/login" || window.location.pathname == "/register") {
        SwalRedirect("Ya hay sesion iniciada", "/");
    }
}
function cerrarSesion() {
    document.cookie = "tockenDeAcceso=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
    SwalRedirect("Sesion cerrada", "/login");
}
function SwalError(message) {
    Swal.fire({
        icon: 'error',
        title: 'Error',
        text: message,
        type: 'error',
        confirmButtonText: 'Ok'
    });
}
function SwalSuccess(message) {
    Swal.fire({
        icon: 'success',
        title: 'Exito',
        text: message,
        type: 'success',
        confirmButtonText: 'Ok'
    });
}
function SwalLoading(message) {
    Swal.fire({
        title: 'Espere...',
        text: message,
        imageUrl: 'https://media.giphy.com/media/3oEjI6SIIHBdRxXI40/giphy.gif',
        showConfirmButton: false,
        allowOutsideClick: false,
        allowEscapeKey: false,
        allowEnterKey: false,
        customClass: {
            popup: 'animated tada'
        }
    });
}
function SwalRedirect(message, url) {
    //Swal redirect to url after 3 seconds
    Swal.fire({
        title: 'Redireccionando...',
        text: message,
        imageUrl: 'https://media.giphy.com/media/3oEjI6SIIHBdRxXI40/giphy.gif',
        showConfirmButton: false,
        timer: 3000,
        allowOutsideClick: false,
        allowEscapeKey: false,
        allowEnterKey: false,
        customClass: {
            popup: 'animated tada'
        }
    }).then(function () {
        window.location.href = url;
    });
}