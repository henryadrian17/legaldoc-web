////CONFIGURACION DEL API Y SITIO WEB
const API_URL = 'http://localhost:8080/legaldoc/api/v1/'; //URL API LOCAL
//const API_URL = 'http://103.54.58.53:8080/legaldoc_web_services-0.0.1-SNAPSHOT/legaldoc/api/v1/'; //URL API REMOTA
const SITE_URL = 'http://localhost:3000'; //URL SITIO WEB
///VARIABLES GLOBALES DE TRABAJO
let lista_servicios = []; //lista de servicios
let carrito = []; //ITEMS EN EL CARRITO
let asesor_lista_servicios;
let servicioSeleccionado;

//FUNCIONES DE LOGIN
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

//FUNCIONES LISTA DE ASESORES
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

//FUNCIONES CONTRATAR ASESOR
function getDatosdelAsesorYServicios() {
    fetch(API_URL.concat('asesores/').concat(getUrlVars()["id"]), {
        method: 'GET'
    }).then(function (response) {
        return response.json();

    }).then(function (data) {
        asesor_lista_servicios = data.data;
        let carritoCookie = getItemsCarritoFromCookie();
        lista_servicios = data.data.servicios.filter(servi => !carritoCookie.includes(servi.id.toString()));
        servicioSeleccionado = lista_servicios[0];
        showAsesorCard();
        showServiciosCard();
        return data;
    }).catch(function (error) {
        console.log(error);
        SwalError("Error al traer datos del asesor");
    });
}

function getIdServicioSelect() {
    let select = document.getElementsByClassName("form-select mt-2")[0];
    return select.options[select.selectedIndex].value;
}

function showAsesorCard() {
    let asesorbox = document.getElementsByClassName(" col-6 card mb-3 mt-2 ")[0];
    asesorbox.innerHTML = `
    <div class="row no-gutters">
                        <div class="col-md-4">
                            <img src="${SITE_URL.concat('/img/').concat(asesor_lista_servicios.foto)}" class="card-img" alt="${asesor_lista_servicios.nombre.concat(' ').concat(asesor_lista_servicios.apellido)}">
                            <div class="card-body text-center">
                                <h7 class="card-title">ASESOR LEGAL</h7>
                            </div>
                        </div>
                        <div class="col-md-8">
                            <div class="card-body">
                                <h5 class="card-title">${asesor_lista_servicios.nombre.concat(' ').concat(asesor_lista_servicios.apellido)}</h5>
                                <p class="card-text">${asesor_lista_servicios.descripcionUsuario}</p>
                            </div>
                        </div>
                    </div>
    `;
}

function showServiciosCard() {
    let serviciosbox = document.getElementsByClassName("col-6  mb-3 mt-2")[1];
    if (servicioSeleccionado !== undefined && servicioSeleccionado !== null) {
        serviciosbox.innerHTML = ` 
                    <h4>Precio ${new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD'
        }).format(servicioSeleccionado.precioServicio)}</h4>
                    <p>${servicioSeleccionado.descriptionServicio}</p>
                    <select class="form-select mt-2" onchange="serviciosOnChange()">
                        ${lista_servicios.map(servicio => `<option value="${servicio.id}" ${servicio.id === servicioSeleccionado.id ? 'selected' : ''}>${servicio.nombreServicio}</option>`).join('')}
                    </select><br>
                    <a href="/c_carritoCompra">
                        <button type="button" class="btn btn-primary mt-2 botones">Contratar</button>
                    </a><br>
                        <button type="button" class="btn btn-primary mt-2 botones" onclick="agregarItemAlCarrito()">Añadir al carrito</button>
                    <br>
    `;
    }else{
        serviciosbox.innerHTML = ` 
                    <h4>No hay servicios para este asesor</h4>
                    <p>Por favor, seleccione otro asesor</p>
    `;
    }
}

function serviciosOnChange() {
    servicioSeleccionado = lista_servicios.find(servicio => servicio.id == getIdServicioSelect());
    showServiciosCard();
}

/// FUNCTIONES DE ALERTAS//////////////////////////////////////////////////////////////////////////////////////////////////////////////
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


////////carrito de compra//////////////

function getItemsCarritoFromCookie() {
    try {
        return carritoCompra = document.cookie.split("carritoCompra=")[1].split(";")[0].split(",");
    } catch (e) {
        return [];
    }
}

function getCarritoDataFromServer() {
    fetch(API_URL.concat("carrito"), {
        method: 'GET',
        headers: {
            "Content-Type": "application/json",
            "Carrito-Compra": getItemsCarritoFromCookie().join(",")
        }
    }).then(response => {
        return response.json();
    }).then(data => {
        carrito = data.data.content;
    }).catch(error => {
        carrito = [];
    })
}

function agregarItemAlCarrito() {
    let id = getIdServicioSelect();
    let idItems = getItemsCarritoFromCookie();
    if (!idItems.includes(id)) {
        idItems.push(id);
        lista_servicios.splice(lista_servicios.findIndex(servicio => servicio.id == id), 1);
        showToastrAddServiceToCarrito();
        servicioSeleccionado = lista_servicios[0];
        showServiciosCard();
        document.cookie = "carritoCompra=" + idItems.join(",");
    } else {
        SwalError("El servicio ya esta en el carrito");
    }
}

function showToastrAddServiceToCarrito(){
    toastr.success(`Servicio ${servicioSeleccionado.nombreServicio} agregado al carrito`);
}

///funciones globales
function getUrlVars() {
    let vars = {};
    let parts = window.location.href.replace(/[?&]+([^=&]+)=([^&]*)/gi, function (m, key, value) {
        vars[key] = value;
    });
    return vars;
}

///FUNCIONES EJECUTADAS AL CARGAR EL SCRIPT////////////////////////////////////////////////////////////////////////////////////////////
getCarritoDataFromServer();


