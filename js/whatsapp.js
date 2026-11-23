/* ============================================================
   WHATSAPP — mensajes armados (números reales de Oasis)
   WhatsApp / Asistencia 24h: +1 (809) 693-0840
   WhatsApp reservas: (809) 549-1531
   ============================================================ */
const WA_ASISTENCIA = '18096930840';
const WA_RESERVAS   = '18095491531';

/** Link de reserva de un vehículo con el mensaje exacto solicitado. */
function waReserve(carro, precio, fechaRecogida, fechaRegreso, lugar){
  const texto = `Hola Oasis, quiero reservar el ${carro} por US$${precio}/día, del ${fechaRecogida} al ${fechaRegreso} en ${lugar}. ¿Está disponible?`;
  return `https://wa.me/${WA_ASISTENCIA}?text=${encodeURIComponent(texto)}`;
}

/** Link del formulario de contacto. */
function waContact(nombre, asunto, correo, mensaje){
  const texto = `Hola Oasis, soy ${nombre}. Asunto: ${asunto}. Correo: ${correo}. Mensaje: ${mensaje}`;
  return `https://wa.me/${WA_ASISTENCIA}?text=${encodeURIComponent(texto)}`;
}

/** Link genérico de asistencia 24h. */
function waGeneral(){
  return `https://wa.me/${WA_ASISTENCIA}`;
}
