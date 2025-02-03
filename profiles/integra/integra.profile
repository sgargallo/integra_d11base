<?php

/**
 * @file
 * Enables modules and site configuration for a standard site installation.
 */

use Drupal\Core\Form\FormStateInterface;

/**
 * Implements hook_form_FORM_ID_alter() for install_configure_form().
 *
 * Allows the profile to alter the site configuration form.
 */
function integra_form_install_configure_form_alter(&$form, FormStateInterface $form_state) {
  
  //Ajuste del campo de contraseña para que acepte valores de entrada
  $form['admin_account']['account']['pass']['#type'] = 'textfield';
  
  //Precarga de datos del formulario
  $form['site_information']['site_name']['#default_value'] = 'Nuevo Sitio Web (' . integra_obtener_nombre_sitio() . ')';
  $form['site_information']['site_mail']['#default_value'] = 'eformedia@efor.es';

  $form['admin_account']['account']['name']['#default_value'] = 'Integra';
  $form['admin_account']['account']['mail']['#default_value'] = '[usuario]@integratecnologia.es';
  $form['admin_account']['account']['pass']['#default_value'] = 'Int.' . date("my");

  $form['update_notifications']['enable_update_status_module']['#default_value'] = true;
}

function integra_form_install_settings_form_alter(&$form, FormStateInterface $form_state) {

  //Ajuste del campo de contraseña para que acepte valores de entrada
  $form['settings']['Drupal\\mysql\\Driver\\Database\\mysql']['password']['#type'] = 'textfield';

  //Precarga de datos del formulario
  $form['settings']['Drupal\\mysql\\Driver\\Database\\mysql']['database']['#default_value'] = integra_obtener_nombre_sitio();
  $form['settings']['Drupal\\mysql\\Driver\\Database\\mysql']['username']['#default_value'] = 'eformedia';
  $form['settings']['Drupal\\mysql\\Driver\\Database\\mysql']['password']['#default_value'] = 'efor2017';
}

function integra_obtener_nombre_sitio() {
  
  //Extraemos partes de la URL
  $url = (empty($_SERVER['HTTPS']) ? 'http' : 'https') . "://$_SERVER[HTTP_HOST]$_SERVER[REQUEST_URI]";
  $urlParts = explode('/', str_ireplace(array('http://', 'https://'), '', $url));
  
  //Devolvemos el primer fragmento
  return $urlParts[1];
}