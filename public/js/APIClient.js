//const API_URL = 'http://localhost:8080/legaldoc/api/v1/';
const SITE_URL = 'http://localhost:3000';

const API_URL = 'http://103.54.58.53:8080/legaldoc_web_services-0.0.1-SNAPSHOT/legaldoc/api/v1/';

let lista_servicios = [];
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
        try {
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
                    document.cookie = "tockenDeAcceso=" + data.data.tockenDeAcceso + "; expires=" + data.data.fechaExpiracionTocken + "; path=/";
                    SwalRedirect("Usuario creado satisfactoriamente", "/");
                } else {
                    SwalError(data.serviceStatus.message);
                }
            }).catch(function (error) {
                SwalError("Error al registrar usuario");
            });
        } catch (error) {
            Swal.close()
            SwalError("Error al registrar usuario");
        }
    }
}

function ingresarUsuario() {
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
        try {
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
                    document.cookie = "tockenDeAcceso=" + data.data.tockenDeAcceso + "; expires=" + data.data.fechaExpiracionTocken + "; path=/";
                    SwalRedirect("Bienvenido ".concat(data.data.nombre), "/");
                } else {
                    SwalError(data.serviceStatus.message);
                }
            }).catch(function (error) {
                SwalError("Error al ingresar");
            });
        } catch (error) {
            Swal.close()
            SwalError("Error al ingresar");
        }
    }
}

function verificarSesion() {
    console.log("verificando sesion");
    if (document.cookie.indexOf("tockenDeAcceso=") === -1 && window.location.pathname !== "/login" && window.location.pathname !== "/register" && window.location.pathname !== "/") {
        SwalRedirect("No hay sesion iniciada", "/login");
    } else {
        let tockenDeAcceso = document.cookie.split("tockenDeAcceso=")[1].split(";")[0];
        if (tockenDeAcceso == "") {
            SwalRedirect("No hay sesion iniciada", "/login");
        } else if (window.location.pathname == "/login" || window.location.pathname == "/register") {
            SwalRedirect("Ya ha iniciado sesion", "/");
        } else {
            fetch(API_URL.concat('verifytoken'), {
                method: 'GET',
                headers: {
                    'Authorization': tockenDeAcceso
                }
            }).then(function (response) {
                return response.json();
            }).then(function (data) {
                if (data.serviceStatus.status !== 200) {
                    document.cookie = "tockenDeAcceso=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
                } else {
                    console.log("sesion verificada")
                }
            });
        }
    }

}

function cerrarSesion() {
    fetch(API_URL.concat('logout'), {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': document.cookie.split("tockenDeAcceso=")[1].split(";")[0]
        }
    }).then(function (response) {
        return response.json();
    }).then(function (data) {
        if (data.serviceStatus.status == 200) {
            document.cookie = "tockenDeAcceso=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
            SwalRedirect("Sesion cerrada", "/login");
        } else {
            SwalError(data.serviceStatus.message);
        }
    }).catch(function (error) {
        SwalError("Error al cerrar sesion");
    });
}

function traerListaDeAsesores(pageNum) {
    console.log(pageNum);
    SwalLoading("");
    if (isNaN(pageNum) || pageNum === undefined || pageNum == null) {
        pageNum = 1;
    }
    try {
        fetch(API_URL.concat('asesores?pageNum=').concat(pageNum.toString()), {
            method: 'GET'
        }).then(function (response) {
            return response.json();
        }).then(function (data) {
            let asesoresBox = document.getElementsByClassName("row row-cols-1 row-cols-md-3 g-4 mx-1")[0];
            asesoresBox.innerHTML = "";
            if (data.serviceStatus.status == 200) {
                asesoresBox.innerHTML = generarTargetasAsesores(data.data.content);
                let pagination = document.getElementsByClassName("pagination")[0];
                pagination.innerHTML = paginadoListaAsesores(data.data.pageable.pageNumber + 1, pageNum, data.data.totalPages);
            }
            //CLOSE Swal
            Swal.close();
        }).catch(function (error) {
            Swal.close();
            SwalError("Error al traer lista de asesores");
        });
    } catch (e) {
        Swal.close();
        SwalError("Error al traer lista de asesores");
    }
}

function mostrarContratarAsesor() {
    SwalLoading("");
    try{
        let id = window.location.href.split("?")[1].split("=")[1];
        fetch(API_URL.concat('asesores\\').concat(id), {
            method: 'GET'
        }).then(function (response) {
            return response.json();
        }).then(function (data) {
            if (data.serviceStatus.status == 200) {
                // replace item with class row no-gutters using generarTarjetaAsesor(data)
                let asesor = data.data;
                let asesorBox = document.getElementsByClassName("row no-gutters")[0];
                asesorBox.innerHTML = generarTarjetaAsesor(asesor);
                lista_servicios = asesor.servicios;
                mostrarListaServicios(lista_servicios[0].id);
            }
            Swal.close()
        }).catch(function (error) {
            Swal.close()
            SwalError("Error al traer asesor");
        })
    }catch (e) {
        Swal.close()
        SwalError("Error al traer asesor");
    }
}
function mostrarListaServicios(idServicio){
    lista_servicios.forEach(servicio => {
        if(servicio.id === idServicio){
            let servicioBox = document.getElementsByClassName("col-6  mb-3 mt-2")[1];
            servicioBox.innerHTML = generarTarjetaServicio(servicio);
        }
    })
}
function generarTarjetaServicio(servicio){
    serDetalle = `
                    <h4>Precio ${servicio.precioServicio}</h4>
                    <p>${servicio.descriptionServicio}</p>
                    <select class="form-select mt-2">
                        <option selected="">Seleccionar un Servicio</option>
                        ${lista_servicios.map(serviciom => `<option value="${serviciom.id}">${serviciom.nombreServicio}</option>`).join("")}
                    </select><br>
                    <a href="/c_carritoCompra">
                        <button type="button" class="btn btn-primary mt-2 botones">Contratar</button>
                    </a><br>
                    <a href="/c_carritoCompra">
                        <button type="button" class="btn btn-primary mt-2 botones">Añadir al carrito</button>
    `
    return serDetalle;
}


function generarTarjetaAsesor(data) {
    tarjeta = `
               
                        <div class="col-md-4">
                            <img src="${SITE_URL.concat("/img/").concat(data.foto)}" class="card-img" alt="...">
                        </div>
                        <div class="col-md-8">
                            <div class="card-body">
                                <h5 class="card-title">Asesor legal</h5>
                                <p class="card-text">${data.descripcionUsuario}</p>
                            </div>
                        </div>
                        <div class="card-body">
                            <h5 class="card-title">Contacto</h5>
                            <p class="card-text">E-mail: ${data.correo}</p>
                        </div>
               
    `
    return tarjeta;
}

function generarTargetasAsesores(data) {
    let targetas = "";
    for (let i = 0; i < data.length; i++) {
        targetas += `
            <div class="col">
                <div class="card h-100">
                    <h5 class="card-title text-center"> Asesor legal</h5>
                    <img src="${SITE_URL.concat('/img/').concat(data[i].foto)}" class="card-img-top mx-auto " alt="1">
                    <div class="card-body">
                        <h5 class="card-title">${data[i].apellido}, ${data[i].nombre}</h5>
                        <p class="card-text">${data[i].descripcionUsuario}</p>
                    </div>
                    <div class="card-footer">
                        <a href="/c_contratarAsesor?id=${data[i].idUser}"><button type="button" class="btn btn-primary botones">Contratar</button></a> 
                    </div>
                </div>
            </div>`;
    }
    return targetas;
}

function paginadoListaAsesores(actual, solicitda, totalpaginas) {
    let paginas = "";
    if (actual === 1) {
        paginas += `<li class="page-item disabled"><a class="page-link" href="#">Anterior</a></li>`;
    } else {
        paginas += `<li class="page-item"><a class="page-link" href="#" onclick="traerListaDeAsesores(${actual - 1})">Anterior</a></li>`;
    }
    for (let i = 1; i <= totalpaginas; i++) {
        if (i === actual) {
            paginas += `<li class="page-item active"><a class="page-link" href="#">${i}</a></li>`;
        } else {
            paginas += `<li class="page-item"><a class="page-link" href="#" onclick="traerListaDeAsesores(${i})">${i}</a></li>`;
        }
    }
    if (actual === totalpaginas) {
        paginas += `<li class="page-item disabled"><a class="page-link" href="#">Siguiente</a></li>`;
    } else {
        paginas += `<li class="page-item"><a class="page-link" href="#" onclick="traerListaDeAsesores(${actual + 1})">Siguiente</a></li>`;
    }
    return paginas;
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