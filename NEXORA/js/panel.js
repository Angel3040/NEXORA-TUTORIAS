document.addEventListener('DOMContentLoaded', () => {
  const bookingsList = document.getElementById('bookingsList');
  const panelUserName = document.getElementById('panelUserName');
  const panelUserEmail = document.getElementById('panelUserEmail');

  // Obtener usuario guardado en sesión (o asignar uno por defecto si no ha iniciado sesión)
  const user = JSON.parse(localStorage.getItem('nexora_user')) || {
    name: "Alumno Registrado",
    email: "alumno@nexora.com",
    role: "Alumno"
  };

  // Mostrar datos del usuario en la barra lateral derecha
  if (panelUserName) panelUserName.textContent = user.name;
  if (panelUserEmail) panelUserEmail.textContent = `${user.email} (${user.role})`;

  // Cargar lista de reservaciones desde localStorage
  const allBookings = getBookings();
  const userBookings = allBookings.filter(b => b.studentEmail === user.email);

  // Estado vacío: Si el alumno no tiene clases agendadas aún
  if (userBookings.length === 0) {
    bookingsList.innerHTML = `
      <div style="background:white; border-radius:20px; padding:40px; text-align:center; border:1px solid var(--border-light); margin-top:10px;">
        <div style="font-size:48px; margin-bottom:12px;">📅</div>
        <h3 style="font-size:20px; font-weight:800; margin-bottom:8px;">Aún no tienes clases agendadas</h3>
        <p style="color:var(--texto-mutado); font-size:14px; margin-bottom:20px;">Explora la lista de profesores disponibles y reserva tu primera asesoría.</p>
        <a href="index.html#profesores" class="btn btn-orange">Ver Catálogo de Profesores</a>
      </div>
    `;
    return;
  }

  // Renderizar Tarjetas de Reservaciones
  bookingsList.innerHTML = "";

  userBookings.forEach(b => {
    const card = document.createElement('div');
    card.style.background = "var(--blanco)";
    card.style.border = "1px solid var(--border-light)";
    card.style.borderRadius = "20px";
    card.style.padding = "20px";
    card.style.boxShadow = "0 4px 12px rgba(0,0,0,0.02)";

    const isOnline = b.modality === "Online" || b.modality === "Ambos" || (b.meetLink && b.meetLink.includes("meet.google.com"));

    card.innerHTML = `
      <div style="display:flex; justify-content:space-between; align-items:flex-start; flex-wrap:wrap; gap:10px;">
        <div>
          <div style="display:flex; align-items:center; gap:8px; margin-bottom:6px;">
            <span class="tag-pill" style="background:#EEF2FF; color:var(--azul-primary); font-weight:800; margin:0;">${b.subject}</span>
            <span style="font-size:12px; color:var(--texto-mutado);"><i class="far fa-clock"></i> 60 min</span>
          </div>
          <h3 style="font-size:20px; font-weight:800;">Profesor: ${b.teacherName}</h3>
        </div>
        <div>
          <span style="font-size:20px; font-weight:900; color:var(--texto-oscuro);">$${b.price} MXN</span>
        </div>
      </div>

      <div style="margin-top:15px; padding-top:15px; border-top:1px dashed var(--border-light); display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:12px;">
        <div>
          <p style="font-size:14px; font-weight:700; color:var(--texto-oscuro);">
            <i class="far fa-calendar-alt" style="color:var(--naranja-accent);"></i> ${b.date} • ${b.time}
          </p>
          <p style="font-size:12px; color:var(--texto-mutado); margin-top:3px;">
            <i class="fas fa-map-marker-alt"></i> Modalidad: <strong>${b.modality || "Online"}</strong>
          </p>
        </div>

        <div>
          ${isOnline && b.meetLink && b.meetLink !== 'N/A (Presencial)' ? `
            <a href="${b.meetLink}" target="_blank" class="btn btn-purple" style="font-size:13px; padding:10px 18px; text-decoration:none; display:inline-flex; align-items:center; gap:8px;">
              <i class="fas fa-video"></i> Entrar a Google Meet
            </a>
          ` : `
            <span class="btn" style="background:#F1F5F9; color:var(--texto-mutado); font-size:13px; cursor:default;">
              <i class="fas fa-user-friends"></i> Asesoría Presencial
            </span>
          `}
        </div>
      </div>
    `;

    bookingsList.appendChild(card);
  });
});