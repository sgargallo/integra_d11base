jQuery(document).ready(function() {

	//Verificamos si el usuario ya ha tomado una decisión sobre las cookies aceptadas
	if (jQuery.cookie("aviso_cookies_revisado") != 1) {

		//No se ha mostrado el aviso de cookies hasta el momento o el usuario no ha tomado una decisión, mostramos el aviso de primer nivel
		jQuery('#modalCookies').modal({ backdrop: 'static', keyboard: false });
		jQuery('#modalCookies').modal('show');

		//Definimos los eventos de los botones que aparecen en la capa de primer nivel
		jQuery('#aceptarTodasCookies').click(function () { guardarConsentimiento(tiposCookiesActivos); });
		jQuery('#aceptarCookiesObligatorias').click(function () { guardarConsentimiento(tiposCookiesObligatorios); });
	}

	//Evento del botón que despliega la capa de segundo nivel
	jQuery('#verAjustesCookies').click(function () {

		jQuery('#modalCookies').modal('hide');
		jQuery('#modalAjustesCookies').modal({ backdrop: 'static', keyboard: false });
		jQuery('#modalAjustesCookies').modal('show');
	});

	//Evento del botón de cierre de la capa de segundo nivel
	jQuery('#guardarAjustesCookies').click(function () {

		var tiposCookies = tiposCookiesActivos.split(",");
		var tiposCookiesConsentidos = "";

		//Revisamos los tipos de cookies que han sido activados
		tiposCookies.forEach(function(valor, indice, array) {

			if (jQuery('#cookies_' + valor).is(':checked')) { tiposCookiesConsentidos += valor + ","; }
		});

		//Eliminamos el punto y coma de la cadena al final...
		if (tiposCookiesConsentidos != "") {

			tiposCookiesConsentidos = tiposCookiesConsentidos.substring(0, tiposCookiesConsentidos.length - 1);
		}

		//Almacenamos el consentimiento otorgado por el cliente
		guardarConsentimiento(tiposCookiesConsentidos);

		//Ocultamos la modal
		jQuery('#modalAjustesCookies').modal('hide');
	});

	//Funcionalidad del toggle de cada tipo de cookie
	jQuery('.btn-toggle').click(function() {

		jQuery(this).find('.btn').toggleClass('active');
		if (jQuery(this).find('.btn-primary').length>0) { jQuery(this).find('.btn').toggleClass('btn-primary'); }
		jQuery(this).find('.btn').toggleClass('btn-default');
	});

	jQuery('.accordion-item').on('click',function(){

		if(jQuery(this).find('.accordion-collapse.collapse').hasClass('show')==false){

			jQuery('.accordion-collapse.collapse.show').removeClass('show');
			jQuery(this).find('.accordion-collapse.collapse').addClass('show');
		}
	});

	//Sincronizamos los valores actuales con GTM al inicializar la página
	sincronizarConsentimiento();
});

function guardarConsentimiento(tiposCookiesConsentidos) {

	//Obtenemos los tipos de cookies habilitados
	var tiposCookies = tiposCookiesActivos.split(",");
	
	//Repasamos todos los tipos de cookies habilitados
	tiposCookies.forEach(function(valor, indice, array) {
	
		//Vemos si el tipo actual está entre los consentidos por el usuario
		if (tiposCookiesConsentidos.includes(valor)) {
		
			//Tipo de cookie consentida por el usuario
			jQuery.cookie("acepta_cookies_" + valor, 1, {expires: caducidadConsentimiento, path:'/'});
		} else {
		
			//Tipo de cookie NO consentida por el usuario
			jQuery.cookie("acepta_cookies_" + valor, 0, {expires: caducidadConsentimiento, path:'/'});
		}
	});
	
	//Guardamos la cookie como que el usuario ha revisado el aviso y tomado una decisión
	jQuery.cookie("aviso_cookies_revisado", 1, {expires: caducidadConsentimiento, path:'/'});
	
	//Enviamos evento de GTM para que pueda cambiar el escenario según la decisión del cliente
	if (typeof dataLayer !== 'undefined') {
		dataLayer.push({ 'event': 'cookies-aceptadas' });
	}
	
	//Ocultamos la modal
	jQuery('#modalCookies').modal('hide');
	
	//Sincronizamos valores con GTM
	sincronizarConsentimiento();
}

function sincronizarConsentimiento() {

	//Solo ejecutamos la sincronización de consentimientos si se ha inicializado la variable de tipos de consentimiento activos
	if (typeof tiposConsentimientoActivos !== 'undefined') {

		//Creamos un array con los tipos de consentimiento y su estado por defecto
		var consentimientos = {};

		//Obtenemos los tipos de consentimiento habilitados y establecemos su valor más restrictivo por defecto
		tiposConsentimientoActivos.split(",").forEach(function (valor, indice, array) { consentimientos[valor] = "denied"; });

		//Obtenemos los tipos de consentimiento obligatorios y los activamos
		tiposConsentimientoObligatorios.split(",").forEach(function (valor, indice, array) { consentimientos[valor] = "granted"; });

		//Repasamos todos los tipos de cookies habilitados
		tiposCookiesActivos.split(",").forEach(function (valor, indice, array) {

			//Comprobamos si el tipo de cookie actual está entre las habilitadas por el usuario
			if (jQuery.cookie("acepta_cookies_" + valor) == 1) {

			  //Extraemos los consentimientos asociados a la misma
			  tiposConsentimientoHabilitar = (jQuery("#cookies_" + valor).attr('tipos_consentimiento')).split(",");

			  //Repasamos todos los tipos de consentimiento que aplican en esta cookie
			  tiposConsentimientoHabilitar.forEach(function(valor, indice, array) {
				  
				if (valor != "") { consentimientos[valor] = "granted"; }
			  });
			}
		});

		//console.log(consentimientos);

		//Revisamos si ya ha aceptado el aviso de cookies o no para generar el default o un update
		if (jQuery.cookie("aviso_cookies_revisado") != 1) {

			//Primer acceso a la web sin operar previamente con el aviso
			if (typeof gtag !== 'undefined') { gtag('consent', 'default', consentimientos); }

		} else {

			//Recarga de la página con aviso ya consultado o visita posterior con preferencias cargadas en las cookies
			if (typeof gtag !== 'undefined') { gtag('consent', 'update', consentimientos); }
		}
	}
}
