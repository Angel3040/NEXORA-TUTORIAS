document.addEventListener('DOMContentLoaded', () => {
  const teachersGrid = document.getElementById('teachersGrid');
  const subjectSelect = document.getElementById('subjectSelect');
  const modalitySelect = document.getElementById('modalitySelect');

  // Elementos del Modal y Sesión
  const authModal = document.getElementById('authModal');
  const openAuthBtn = document.getElementById('openAuthBtn');
  const closeAuthBtn = document.getElementById('closeAuthBtn');
  const userInfo = document.getElementById('userInfo');
  const logoutBtn = document.getElementById('logoutBtn');
  const myBookingsBtn = document.getElementById('myBookingsBtn');

  // Vistas y Botones del Modal
  const authStepChoose = document.getElementById('authStepChoose');
  const authStepForm = document.getElementById('authStepForm');
  const selectStudentRole = document.getElementById('selectStudentRole');
  const selectTeacherRole = document.getElementById('selectTeacherRole');
  
  const formAvatarCircle = document.getElementById('formAvatarCircle');
  const formAvatarEmoji = document.getElementById('formAvatarEmoji');
  const formAuthTitle = document.getElementById('formAuthTitle');
  const switchPromptText = document.getElementById('switchPromptText');
  const toggleRoleBtn = document.getElementById('toggleRoleBtn');
  const authForm = document.getElementById('authForm');

  let currentRole = "Student";

  // Verificar estado de sesión
  checkSession();

  // 1. RENDERIZAR PROFESORES DE FORMA SEGURA
  function renderTeachers() {
    if (!teachersGrid) return;

    let teachers = [];
    if (typeof getTeachers === 'function') {
      teachers = getTeachers();
    } else {
      console.warn("data.js no está cargado correctamente.");
      return;
    }

    const selectedSubject = subjectSelect ? subjectSelect.value : "";
    const selectedModality = modalitySelect ? modalitySelect.value : "";

    const filtered = teachers.filter(t => {
      const matchSubject = selectedSubject === "" || 
                           t.subject.toLowerCase() === selectedSubject.toLowerCase() ||
                           (t.bio && t.bio.toLowerCase().includes(selectedSubject.toLowerCase()));
      const matchModality = selectedModality === "" || t.modalidad === selectedModality || t.modalidad === "Ambos";
      
      return matchSubject && matchModality;
    });

    teachersGrid.innerHTML = "";

    if (filtered.length === 0) {
      teachersGrid.innerHTML = `
        <div style="grid-column: 1/-1; text-align:center; padding:40px; background:white; border-radius:20px; border:1px solid var(--border-light);">
          <div style="font-size:40px; margin-bottom:10px;">🔍</div>
          <p style="color:var(--texto-mutado); font-weight:600;">No se encontraron profesores que coincidan con la materia o modalidad seleccionada.</p>
        </div>
      `;
      return;
    }

    filtered.forEach(t => {
      const card = document.createElement('div');
      card.className = 'teacher-card';
      card.innerHTML = `
        <div class="teacher-image-wrapper">
          <img src="${t.image}" alt="${t.name}" class="teacher-img">
          <div class="teacher-overlay-info">
            <h3>${t.name}</h3>
            <p><i class="fas fa-map-marker-alt"></i> ${t.city}</p>
          </div>
        </div>
        <div class="teacher-card-body">
          <span class="badge-modality"><i class="fas fa-video"></i> ${t.modalidad}</span>
          <p><strong>Materia:</strong> ${t.subject}</p>
          <p style="font-size: 13px; color: var(--texto-mutado); line-height: 1.4;">${t.bio}</p>
          <div style="display:flex; justify-content:space-between; align-items:center; margin-top:10px;">
            <span class="price-tag">$${t.price} <small style="font-size:12px; font-weight:normal;">MXN/h</small></span>
            <a href="perfil.html?id=${t.id}" class="btn btn-primary" style="padding:8px 16px; font-size:13px;">Ver Horarios</a>
          </div>
        </div>
      `;
      teachersGrid.appendChild(card);
    });
  }

  if (subjectSelect) subjectSelect.addEventListener('change', renderTeachers);
  if (modalitySelect) modalitySelect.addEventListener('change', renderTeachers);

  // 2. CAMBIO DE VISTA EN EL MODAL (SELECCIÓN DE ROL / FORMULARIO)
  function setRoleView(role) {
    currentRole = role;
    if (authStepChoose) authStepChoose.style.display = 'none';
    if (authStepForm) authStepForm.style.display = 'block';

    if (role === 'Student') {
      if (formAvatarCircle) formAvatarCircle.className = 'role-avatar-circle bg-yellow';
      if (formAvatarEmoji) formAvatarEmoji.textContent = '🎓';
      if (formAuthTitle) formAuthTitle.textContent = 'Sign in as Student';
      if (switchPromptText) switchPromptText.textContent = 'Are you a teacher?';
    } else {
      if (formAvatarCircle) formAvatarCircle.className = 'role-avatar-circle bg-green';
      if (formAvatarEmoji) formAvatarEmoji.textContent = '👨‍🏫';
      if (formAuthTitle) formAuthTitle.textContent = 'Sign in as Teacher';
      if (switchPromptText) switchPromptText.textContent = 'Are you a student?';
    }
  }

  if (selectStudentRole) {
    selectStudentRole.addEventListener('click', () => setRoleView('Student'));
  }

  if (selectTeacherRole) {
    selectTeacherRole.addEventListener('click', () => setRoleView('Teacher'));
  }

  if (toggleRoleBtn) {
    toggleRoleBtn.addEventListener('click', () => {
      setRoleView(currentRole === 'Student' ? 'Teacher' : 'Student');
    });
  }

  // 3. ABRIR Y CERRAR EL MODAL DE AUTENTICACIÓN
  function openModal() {
    if (authModal) {
      if (authStepChoose) authStepChoose.style.display = 'block';
      if (authStepForm) authStepForm.style.display = 'none';
      authModal.classList.add('active');
    }
  }

  function closeModal() {
    if (authModal) {
      authModal.classList.remove('active');
    }
  }

  if (openAuthBtn) {
    openAuthBtn.onclick = openModal;
  }

  const openTeacherSignup = document.getElementById('openTeacherSignup');
  if (openTeacherSignup) {
    openTeacherSignup.onclick = (e) => {
      e.preventDefault();
      openModal();
      setRoleView('Teacher');
    };
  }

  if (closeAuthBtn) {
    closeAuthBtn.onclick = closeModal;
  }

  // Cerrar modal al hacer clic en el fondo oscuro
  if (authModal) {
    authModal.onclick = (e) => {
      if (e.target === authModal) closeModal();
    };
  }

  // 4. GUARDAR SESIÓN Y CONTROL DE LOGOUT
  if (authForm) {
    authForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const emailInput = document.getElementById('authEmail');
      const email = emailInput ? emailInput.value : "usuario@nexora.com";
      const userName = email.split('@')[0];

      const user = {
        name: userName.charAt(0).toUpperCase() + userName.slice(1),
        email: email,
        role: currentRole === 'Student' ? 'Alumno' : 'Profesor'
      };

      localStorage.setItem('nexora_user', JSON.stringify(user));
      closeModal();
      checkSession();
    });
  }

  function checkSession() {
    const user = JSON.parse(localStorage.getItem('nexora_user'));
    if (user) {
      if (openAuthBtn) openAuthBtn.style.display = 'none';
      if (userInfo) {
        userInfo.style.display = 'inline-block';
        userInfo.textContent = `Hola, ${user.name} (${user.role})`;
      }
      if (logoutBtn) logoutBtn.style.display = 'inline-block';
      if (myBookingsBtn) myBookingsBtn.style.display = 'inline-block';
    } else {
      if (openAuthBtn) openAuthBtn.style.display = 'inline-block';
      if (userInfo) userInfo.style.display = 'none';
      if (logoutBtn) logoutBtn.style.display = 'none';
    }
  }

  if (logoutBtn) {
    logoutBtn.onclick = () => {
      localStorage.removeItem('nexora_user');
      checkSession();
    };
  }

  renderTeachers();
});