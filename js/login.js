/* ============================================================
   LOGIN — ingreso y registro de usuarios
   ============================================================ */
(function(){
  'use strict';
  const A=window.OasisAuth;
  const next=new URLSearchParams(location.search).get('next');

  function go(user){
    if(user.rol==='master') location.href='admin.html';
    else if(user.rol==='atendedor') location.href='atencion.html';
    else location.href=next||'mis-vehiculos.html';
  }
  function error(msg){
    const e=document.getElementById('authError'); e.textContent=msg;
  }

  document.getElementById('tabLogin').onclick=()=>{
    document.getElementById('tabLogin').classList.add('on');
    document.getElementById('tabRegister').classList.remove('on');
    document.getElementById('loginForm').style.display='grid';
    document.getElementById('registerForm').style.display='none';
    document.getElementById('authTitle').textContent='Ingresar';
    document.getElementById('authSub').textContent='Entra con tu cédula para ver tus vehículos reservados.';
    error('');
  };
  document.getElementById('tabRegister').onclick=()=>{
    document.getElementById('tabRegister').classList.add('on');
    document.getElementById('tabLogin').classList.remove('on');
    document.getElementById('registerForm').style.display='grid';
    document.getElementById('loginForm').style.display='none';
    document.getElementById('authTitle').textContent='Crear usuario';
    document.getElementById('authSub').textContent='Regístrate con tu cédula para guardar tus reservas.';
    error('');
  };

  document.getElementById('loginForm').onsubmit=e=>{
    e.preventDefault(); error('');
    const r=A.login(document.getElementById('lCedula').value, document.getElementById('lPass').value);
    if(!r.ok){ error(r.error); return; }
    go(r.user);
  };

  document.getElementById('registerForm').onsubmit=e=>{
    e.preventDefault(); error('');
    const r=A.register({
      nombre:document.getElementById('rNombre').value.trim(),
      cedula:document.getElementById('rCedula').value.trim(),
      telefono:document.getElementById('rTel').value.trim(),
      email:document.getElementById('rEmail').value.trim(),
      pass:document.getElementById('rPass').value
    });
    if(!r.ok){ error(r.error); return; }
    go(r.user);
  };
})();
