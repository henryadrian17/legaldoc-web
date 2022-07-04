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
                SwalRedirect("Usuario creado satisfactoriamente", "/login");
            } else {
                SwalError(data.serviceStatus.message);
            }
        }).catch(function (error) {
            SwalError("Error al registrar usuario");
        });
    }
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