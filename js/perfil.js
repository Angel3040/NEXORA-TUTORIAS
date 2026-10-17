document.addEventListener('DOMContentLoaded', () => {
  const profileMain = document.getElementById('profileMain');
  const profileRightSidebar = document.getElementById('profileRightSidebar');
  
  // Obtener el ID del profesor desde los parámetros de la URL
  const urlParams = new URLSearchParams(window.location.search);
  const teacherId = urlParams.get('id') || "1";
  const teacher = getTeacherById(teacherId);

  if (!teacher) {
    if (profileMain) {
      profileMain.innerHTML = `
        <div style="padding: 40px; text-align: center;">
          <h2>Profesor no encontrado</h2>
          <p style="color: var(--texto-mutado); margin-top: 10px;">Regresa al catálogo para seleccionar un profesor válido.</p>
          <a href="index.html" class="btn btn-orange" style="margin-top: 20px;">Volver al Inicio</a>
        </div>
      `;
    }
    return;
  }

  let selectedTimeSlot = "";

  // 1. Renderizar Sección Central (Información + Cuadrícula de Horarios)
  profileMain.innerHTML = `
    <!-- ENCABEZADO DEL PERFIL -->
    <div style="display:flex; gap:20px; align-items:center; flex-wrap:wrap;">
      <img src="${teacher.image}" style="width:100px; height:100px; border-radius:50%; object-fit:cover; border:3px solid var(--blanco); box-shadow:0 8px 20px rgba(0,0,0,0.08);" alt="${teacher.name}">
      <div>
        <div style="display:flex; gap:8px; align-items:center;">
          <h2 style="font-size:28px; font-weight:800;">${teacher.name}</h2>
          <span style="color:var(--azul-primary); font-size:18px;" title="Verificado"><i class="fas fa-check-circle"></i></span>
        </div>
        <p style="color:var(--texto-mutado); font-weight:600; margin-top:2px;">
          Profesor de ${teacher.subject} • <i class="fas fa-map-marker-alt"></i> ${teacher.city}
        </p>
        <div style="margin-top:6px; color:#F59E0B; font-weight:700; font-size:14px;">
          <i class="fas fa-star"></i> ${teacher.rating || 5.0} <span style="color:var(--texto-mutado); font-weight:500;">(${teacher.reviewsCount || 10} opiniones)</span>
        </div>
      </div>
    </div>

    <!-- TAGS DE ESPECIALIDAD -->
    <div style="margin-top:20px;">
      <span class="tag-pill">${teacher.subject}</span>
      <span class="tag-pill">Regularización</span>
      <span class="tag-pill">Exámenes</span>
      <span class="tag-pill">Google Meet</span>
      <span class="tag-pill">Modalidad: ${teacher.modalidad}</span>
    </div>

    <!-- BIOGRAFÍA / SOBRE MÍ -->
    <div style="margin-top:30px;">
      <h3 style="font-size:18px; font-weight:800; color:var(--texto-oscuro);">Sobre mí</h3>
      <p style="color:var(--texto-mutado); margin-top:8px; line-height:1.6; font-size:14px;">${teacher.bio}</p>
    </div>

    <!-- SELECTOR DE HORARIOS EN CUADRÍCULA (SCHEDULE PICKER) -->
    <div class="schedule-picker">
      <div style="display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:10px;">
        <div>
          <h3 style="font-size:18px; font-weight:800;">Horarios Disponibles</h3>
          <p style="font-size:12px; color:var(--texto-mutado);">Selecciona el horario que mejor se adapte a tu agenda</p>
        </div>
        <input type="date" id="bookingDate" style="padding:8px 14px; border-radius:12px; border:1px solid var(--border-light); outline:none; font-weight:600;" value="${new Date().toISOString().split('T')[0]}" min="${new Date().toISOString().split('T')[0]}">
      </div>

      <div class="time-slots-grid" id="timeSlotsContainer">
        ${teacher.schedule.map(slot => `<button class="time-slot-btn" type="button">${slot}</button>`).join('')}
      </div>
    </div>
  `;

  // 2. Renderizar Columna Derecha (Acción de Reserva, Tarifa y Previsualización)
  profileRightSidebar.innerHTML = `
    <div class="video-preview-box">
      <img src="${teacher.image}" alt="Preview del profesor">
    </div>

    <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:15px;">
      <span style="color:var(--texto-mutado); font-weight:600; font-size:14px;">Precio por clase</span>
      <span style="font-size:24px; font-weight:900; color:var(--texto-oscuro);">$${teacher.price} <small style="font-size:12px; color:var(--texto-mutado);">MXN/h</small></span>
    </div>

    <button id="bookBtn" class="btn btn-purple" style="padding:14px; width:100%; font-size:15px; margin-bottom:12px; border-radius:12px;">
      <i class="fas fa-bolt"></i> Reservar Clase Ahora
    </button>

    <div style="background:#F8FAFC; border:1px solid var(--border-light); border-radius:12px; padding:12px; text-align:center;">
      <p style="font-size:12px; color:var(--texto-mutado); margin:0;">
        <i class="fas fa-video" style="color:var(--azul-primary);"></i> Enlace automático de <strong>Google Meet</strong> generado al confirmar la cita.
      </p>
    </div>
  `;

  // 3. Evento para seleccionar un slot de horario
  const timeSlotBtns = document.querySelectorAll('.time-slot-btn');
  timeSlotBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      timeSlotBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      selectedTimeSlot = btn.textContent;
    });
  });

  // 4. Lógica para procesar y guardar la reservación
  document.getElementById('bookBtn').addEventListener('click', () => {
    // Obtener datos del usuario en sesión o asignar usuario por defecto
    const user = JSON.parse(localStorage.getItem('nexora_user')) || {
      name: "Alumno Demo",
      email: "alumno@nexora.com",
      role: "Alumno"
    };

    if (!selectedTimeSlot) {
      alert("Por favor selecciona un horario disponible de la cuadrícula.");
      return;
    }

    const bookingDate = document.getElementById('bookingDate').value;
    if (!bookingDate) {
      alert("Por favor selecciona una fecha válida.");
      return;
    }

    // Crear el objeto de reservación con enlace dinámico de Google Meet
    const booking = {
      id: Date.now().toString(),
      studentName: user.name,
      studentEmail: user.email,
      teacherName: teacher.name,
      subject: teacher.subject,
      date: bookingDate,
      time: selectedTimeSlot,
      modality: teacher.modalidad,
      price: teacher.price,
      meetLink: teacher.modalidad === 'Presencial' ? 'N/A (Presencial)' : generateGoogleMeetLink()
    };

    // Guardar reservación en localStorage
    saveBooking(booking);

    alert(`¡Reservación Confirmada!\n\nProfesor: ${teacher.name}\nMateria: ${teacher.subject}\nFecha: ${bookingDate}\nHora: ${selectedTimeSlot}\n\nPuedes consultar el enlace a tu videollamada en tu Panel de Clases.`);

    // Redireccionar al panel
    window.location.href = "panel.html";
  });
});