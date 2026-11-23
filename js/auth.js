/* ============================================================
   AUTH — usuarios, sesión y reservas (todo en localStorage)
   Roles: master (control total), atendedor (solo reservas), cliente.
   ============================================================ */
(function(){
  'use strict';

  const USERS = 'oasis-users-v1';
  const SESSION = 'oasis-session-v1';
  const RESERVAS = 'oasis-reservas-v1';

  const MASTERS = [
    { id:'master-1', cedula:'001-0000000-1', nombre:'Master Oasis 1', telefono:'809-000-0001', email:'master1@oasisrentcar.com', pass:'master123', rol:'master' },
    { id:'master-2', cedula:'002-0000000-2', nombre:'Master Oasis 2', telefono:'809-000-0002', email:'master2@oasisrentcar.com', pass:'master123', rol:'master' },
    { id:'atencion-1', cedula:'003-0000000-3', nombre:'Atención al cliente', telefono:'809-000-0003', email:'atencion@oasisrentcar.com', pass:'atencion123', rol:'atendedor' }
  ];

  function read(key,fallback){
    try{ const v=JSON.parse(localStorage.getItem(key)); return v??fallback; }catch(e){ return fallback; }
  }
  function write(key,value){ localStorage.setItem(key,JSON.stringify(value)); }

  function seed(){
    if(!localStorage.getItem(USERS)) write(USERS, MASTERS);
  }
  seed();

  const Auth={
    statuses:['En espera','En camino','Recibido','En servicio','Devuelto','Cancelado'],

    users(){ return read(USERS,[]); },
    current(){ return read(SESSION,null); },
    isLogged(){ return !!Auth.current(); },
    role(){ return Auth.current()?.rol || null; },
    isMaster(){ return Auth.role()==='master'; },
    isStaff(){ return ['master','atendedor'].includes(Auth.role()); },

    login(cedula,pass){
      const u=Auth.users().find(x=>x.cedula===String(cedula).trim() && x.pass===String(pass));
      if(!u) return {ok:false,error:'Cédula o contraseña incorrecta.'};
      write(SESSION,u);
      return {ok:true,user:u};
    },

    register(data){
      const list=Auth.users();
      if(list.some(x=>x.cedula===data.cedula)) return {ok:false,error:'Esa cédula ya está registrada.'};
      const user={
        id:'user-'+Date.now(), cedula:data.cedula, nombre:data.nombre,
        telefono:data.telefono||'', email:data.email||'', pass:data.pass,
        rol:'cliente'
      };
      list.push(user); write(USERS,list); write(SESSION,user);
      return {ok:true,user};
    },

    logout(){ localStorage.removeItem(SESSION); },

    require(roles,redirect){
      const u=Auth.current();
      if(!u || (roles && !roles.includes(u.rol))){ location.href=redirect||'login.html'; return false; }
      return true;
    },

    /* --- Reservas --- */
    reservas(){ return read(RESERVAS,[]); },
    misReservas(){
      const u=Auth.current(); if(!u) return [];
      return Auth.reservas().filter(r=>r.usuarioId===u.id);
    },
    createReserva(data){
      const u=Auth.current();
      const r={
        id:'RES-'+Date.now(),
        usuarioId:u?.id||'', cedula:u?.cedula||'', nombre:u?.nombre||data.nombre||'Cliente',
        telefono:u?.telefono||'', vehiculoId:data.vehiculoId, vehiculo:data.vehiculo,
        precio:data.precio, pickup:data.pickup, entrega:data.entrega,
        fechaRecogida:data.fechaRecogida, fechaRegreso:data.fechaRegreso,
        status:'En espera', creada:new Date().toISOString()
      };
      const list=Auth.reservas(); list.unshift(r); write(RESERVAS,list);
      return r;
    },
    setStatus(id,status){
      const list=Auth.reservas().map(r=>r.id===id?{...r,status}:r);
      write(RESERVAS,list);
    },
    removeReserva(id){
      write(RESERVAS,Auth.reservas().filter(r=>r.id!==id));
    },
    findReserva(id){ return Auth.reservas().find(r=>r.id===id); }
  };

  window.OasisAuth=Auth;
})();
