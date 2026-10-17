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
  const authForm = document.getElementById('authForm');
  const authSubmitBtn = document.getElementById('authSubmitBtn');
  const authToggleText = document.getElementById('authToggleText');
  const toggleAuthModeBtn = document.getElementById('toggleAuthModeBtn');

  let currentRole = "Alumno";
  let isSignupMode = false;

  checkSession();

  // 1. DIVERGENCIA DE VISTA POR ROL (ALUMNO VS PROFESOR)
  function renderTeachers() {
    if (!teachersGrid) return;

    const currentUser = JSON.parse(localStorage.getItem('nexora_user'));
    const isTeacher = currentUser && currentUser.role === 'Profesor';

    // BUSCAR TÍTULO DE LA SECCIÓN
    const sectionTitle = teachersGrid.previousElementSibling || document.querySelector('h2');
    
    // --- SI EL USUARIO ES UN PROFESOR ---
    if (isTeacher) {
      if (sectionTitle) {
        sectionTitle.textContent = "Mis Reseñas y Calificaciones de Alumnos";
      }

      const customTeachers = JSON.parse(localStorage.getItem('nexora_teachers')) || [];
      const currentTeacherData = customTeachers.find(t => t.email && t.email.toLowerCase() === currentUser.email.toLowerCase()) || {
        name: currentUser.name,
        reviews: []
      };

      const reviews = currentTeacherData.reviews || [];
      const avgRating = reviews.length > 0 
        ? (reviews.reduce((acc, r) => acc + Number(r.rating), 0) / reviews.length).toFixed(1)
        : "5.0";

      teachersGrid.style.display = "block";
      teachersGrid.innerHTML = `
        <div style="background:white; border-radius:24px; padding:30px; border:1px solid var(--border-light); max-width:850px; margin:0 auto; box-shadow:0 10px 25px rgba(0,0,0,0.03);">
          
          <!-- RESUMEN DE PROMEDIO -->
          <div style="display:flex; align-items:center; justify-content:space-between; flex-wrap:wrap; gap:20px; border-bottom:1px dashed #E2E8F0; padding-bottom:20px; margin-bottom:24px;">
            <div>
              <h3 style="font-size:22px; font-weight:800; color:#0F172A; margin:0;">Resumen de Reputación</h3>
              <p style="color:#64748B; font-size:14px; margin:4px 0 0 0;">Comentarios y puntuaciones otorgadas por tus alumnos.</p>
            </div>
            <div style="text-align:center; background:#EEF2FF; padding:12px 24px; border-radius:20px;">
              <span style="font-size:32px; font-weight:900; color:#0052FF;">★ ${avgRating}</span>
              <p style="font-size:12px; font-weight:800; color:#475569; margin:0;">(${reviews.length} ${reviews.length === 1 ? 'opinión' : 'opiniones'})</p>
            </div>
          </div>

          <!-- LISTA DE RESEÑAS RECIBIDAS -->
          <div style="display:flex; flex-direction:column; gap:16px;">
            ${reviews.length === 0 ? `
              <div style="text-align:center; padding:30px 10px;">
                <div style="font-size:40px; margin-bottom:10px;">⭐</div>
                <h4 style="font-size:16px; font-weight:800; color:#0F172A;">Aún no tienes comentarios acumulados</h4>
                <p style="color:#64748B; font-size:13px; margin-top:4px;">Cuando impartas clases y tus alumnos te califiquen, sus opiniones aparecerán detalladas aquí.</p>
              </div>
            ` : reviews.map(r => `
              <div style="background:#F8FAFC; border-radius:16px; padding:18px; border:1px solid #E2E8F0;">
                <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:8px;">
                  <strong style="font-size:15px; color:#0F172A;">🎓 ${r.studentName}</strong>
                  <span style="color:#F59E0B; font-weight:800; font-size:14px; background:#FEF3C7; padding:2px 10px; border-radius:12px;">★ ${r.rating} / 5</span>
                </div>
                <p style="font-size:14px; color:#334155; line-height:1.5; margin:0;">"${r.comment}"</p>
                <small style="color:#94A3B8; font-size:11px; display:block; margin-top:8px;">Publicado el: ${r.date || 'Recientemente'}</small>
              </div>
            `).join('')}
          </div>

        </div>
      `;
      return;
    }

    // --- SI EL USUARIO ES ALUMNO O VISITANTE ---
    if (sectionTitle) {
      sectionTitle.textContent = "Profesores Destacados en Tuxtla Gutiérrez";
    }

    teachersGrid.style.display = "grid";
    const teachers = JSON.parse(localStorage.getItem('nexora_teachers')) || [];

    const selectedSubject = subjectSelect ? subjectSelect.value : "";
    const selectedModality = modalitySelect ? modalitySelect.value : "";

    const filtered = teachers.filter(t => {
      const matchSubject = selectedSubject === "" || 
                           (t.subject && t.subject.toLowerCase() === selectedSubject.toLowerCase()) ||
                           (t.bio && t.bio.toLowerCase().includes(selectedSubject.toLowerCase()));
      const matchModality = selectedModality === "" || t.modalidad === selectedModality || t.modalidad === "Ambos";
      
      return matchSubject && matchModality;
    });

    teachersGrid.innerHTML = "";

    if (filtered.length === 0) {
      teachersGrid.innerHTML = `
        <div style="grid-column: 1/-1; text-align:center; padding:40px; background:white; border-radius:20px; border:1px solid var(--border-light);">
          <div style="font-size:40px; margin-bottom:10px;">👨‍🏫</div>
          <p style="color:var(--texto-mutado); font-weight:600;">No hay profesores registrados con este criterio.</p>
        </div>
      `;
      return;
    }

    filtered.forEach(t => {
      const reviews = t.reviews || [];
      const avgRating = reviews.length > 0 
        ? (reviews.reduce((acc, r) => acc + Number(r.rating), 0) / reviews.length).toFixed(1)
        : "5.0";

      const shortBio = t.bio && t.bio.length > 90 ? t.bio.substring(0, 90) + "..." : (t.bio || "Docente comprometido con la enseñanza.");

      const card = document.createElement('div');
      card.className = 'teacher-card';
      card.style.display = "flex";
      card.style.flexDirection = "column";
      card.style.justifyContent = "space-between";

      card.innerHTML = `
        <div>
          <div class="teacher-image-wrapper">
            <img src="${t.image || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80'}" 
                 onerror="this.src='https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80';"
                 alt="${t.name}" class="teacher-img">
            <div class="teacher-overlay-info">
              <h3>${t.name}</h3>
              <p><i class="fas fa-map-marker-alt"></i> Tuxtla Gutiérrez</p>
            </div>
          </div>
          <div class="teacher-card-body" style="padding:15px;">
            <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:8px;">
              <span class="badge-modality" style="background:#EEF2FF; color:#0052FF; font-weight:800; padding:4px 12px; border-radius:20px; font-size:12px; display:inline-block;">
                <i class="fas fa-video"></i> ${t.modalidad || 'Ambos'}
              </span>
              <span style="font-weight:800; font-size:12px; color:#F59E0B;">
                ★ ${avgRating} (${reviews.length})
              </span>
            </div>
            <p style="margin-bottom:6px;"><strong>Materia:</strong> ${t.subject}</p>
            <p style="font-size: 12px; color: var(--texto-mutado); line-height: 1.4; min-height:40px;">${shortBio}</p>
          </div>
        </div>

        <div style="padding:0 15px 15px 15px; display:flex; justify-content:space-between; align-items:center; border-top:1px dashed #E2E8F0; padding-top:10px; margin-top:5px;">
          <span class="price-tag" style="font-size:18px; font-weight:900; color:#0F172A;">$${t.price} <small style="font-size:11px; font-weight:normal;">MXN/h</small></span>
          <button type="button" onclick="openTeacherFullProfile('${t.id}')" class="btn btn-primary" style="padding:8px 16px; font-size:13px; cursor:pointer;">Ver Perfil</button>
        </div>
      `;
      teachersGrid.appendChild(card);
    });
  }

  if (subjectSelect) subjectSelect.addEventListener('change', renderTeachers);
  if (modalitySelect) modalitySelect.addEventListener('change', renderTeachers);

  // 2. MODAL Y CONTROL DE ROLES
  function setupRoleForm(role) {
    currentRole = role;
    if (authStepChoose) authStepChoose.style.display = 'none';
    if (authStepForm) authStepForm.style.display = 'block';

    if (role === 'Alumno') {
      if (formAvatarCircle) formAvatarCircle.className = 'role-avatar-circle bg-yellow';
      if (formAvatarEmoji) formAvatarEmoji.textContent = '🎓';
    } else {
      if (formAvatarCircle) formAvatarCircle.className = 'role-avatar-circle bg-green';
      if (formAvatarEmoji) formAvatarEmoji.textContent = '👨‍🏫';
    }

    updateFormMode();
  }

  if (selectStudentRole) selectStudentRole.addEventListener('click', () => setupRoleForm('Alumno'));
  if (selectTeacherRole) selectTeacherRole.addEventListener('click', () => setupRoleForm('Profesor'));

  if (toggleAuthModeBtn) {
    toggleAuthModeBtn.addEventListener('click', () => {
      isSignupMode = !isSignupMode;
      updateFormMode();
    });
  }

  function updateFormMode() {
    const signupFields = document.querySelectorAll('.signup-only');
    const teacherFields = document.getElementById('teacherFields');

    if (isSignupMode) {
      if (formAuthTitle) formAuthTitle.textContent = `Registrarse como ${currentRole}`;
      if (authSubmitBtn) authSubmitBtn.textContent = "Crear Cuenta";
      if (authToggleText) authToggleText.textContent = "¿Ya tienes cuenta?";
      if (toggleAuthModeBtn) toggleAuthModeBtn.textContent = "Inicia sesión aquí";
      
      signupFields.forEach(el => el.style.display = 'flex');

      if (currentRole === 'Profesor' && teacherFields) {
        teacherFields.style.display = 'flex';
      } else if (teacherFields) {
        teacherFields.style.display = 'none';
      }
    } else {
      if (formAuthTitle) formAuthTitle.textContent = `Iniciar Sesión (${currentRole})`;
      if (authSubmitBtn) authSubmitBtn.textContent = "Iniciar Sesión";
      if (authToggleText) authToggleText.textContent = "¿No tienes cuenta?";
      if (toggleAuthModeBtn) toggleAuthModeBtn.textContent = "Regístrate aquí";

      signupFields.forEach(el => el.style.display = 'none');
      if (teacherFields) teacherFields.style.display = 'none';
    }
  }

  function openModal() {
    if (authModal) {
      if (authStepChoose) authStepChoose.style.display = 'block';
      if (authStepForm) authStepForm.style.display = 'none';
      authModal.classList.add('active');
      authModal.style.display = 'flex';
    }
  }

  function closeModal() {
    if (authModal) {
      authModal.classList.remove('active');
      authModal.style.display = 'none';
    }
  }

  if (openAuthBtn) openAuthBtn.onclick = openModal;

  const openTeacherSignup = document.getElementById('openTeacherSignup');
  if (openTeacherSignup) {
    openTeacherSignup.onclick = (e) => {
      e.preventDefault();
      openModal();
      setupRoleForm('Profesor');
      isSignupMode = true;
      updateFormMode();
    };
  }

  if (closeAuthBtn) closeAuthBtn.onclick = closeModal;

  if (authModal) {
    authModal.onclick = (e) => {
      if (e.target === authModal) closeModal();
    };
  }

  // 3. INICIAR SESIÓN / REGISTRARSE
  if (authForm) {
    authForm.addEventListener('submit', (e) => {
      e.preventDefault();

      const email = document.getElementById('authEmail')?.value.trim() || "usuario@nexora.com";
      const nameInput = document.getElementById('authName')?.value.trim();
      const fileInput = document.getElementById('authPhotoFile');
      const defaultPhoto = 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80';

      const customTeachers = JSON.parse(localStorage.getItem('nexora_teachers')) || [];

      if (!isSignupMode) {
        const matchedTeacher = customTeachers.find(t => t.email && t.email.toLowerCase() === email.toLowerCase());

        let userData = {};
        if (matchedTeacher && currentRole === 'Profesor') {
          userData = {
            name: matchedTeacher.name,
            email: matchedTeacher.email,
            role: 'Profesor',
            subject: matchedTeacher.subject,
            price: matchedTeacher.price,
            duration: matchedTeacher.duration || '60 min',
            photo: matchedTeacher.image,
            bio: matchedTeacher.bio,
            classInfo: matchedTeacher.classInfo || 'Clases dinámicas y enfocadas en la práctica.'
          };
        } else {
          userData = {
            name: nameInput || (email.split('@')[0].charAt(0).toUpperCase() + email.split('@')[0].slice(1)),
            email: email,
            role: currentRole,
            subject: 'General',
            price: '200',
            duration: '60 min',
            photo: defaultPhoto,
            bio: 'Docente registrado.',
            classInfo: 'Clases enfocadas en práctica.'
          };
        }

        localStorage.setItem('nexora_user', JSON.stringify(userData));
        closeModal();
        checkSession();
        renderTeachers();
        return;
      }

      const userName = nameInput || (email.split('@')[0].charAt(0).toUpperCase() + email.split('@')[0].slice(1));

      const saveUserDataAndProceed = (photoBase64) => {
        const userData = {
          name: userName,
          email: email,
          role: currentRole,
          subject: document.getElementById('authSubject')?.value || 'General',
          price: document.getElementById('authPrice')?.value || '200',
          duration: document.getElementById('authDuration')?.value || '60 min',
          photo: photoBase64 || defaultPhoto,
          bio: document.getElementById('authBio')?.value || 'Docente comprometido con la enseñanza.',
          classInfo: document.getElementById('authClassInfo')?.value || 'Clases dinámicas y enfocadas en la práctica.'
        };

        localStorage.setItem('nexora_user', JSON.stringify(userData));

        if (currentRole === 'Profesor' && isSignupMode) {
          const existingIndex = customTeachers.findIndex(t => 
            (t.email && t.email.toLowerCase() === userData.email.toLowerCase()) || 
            (t.name && t.name.toLowerCase() === userData.name.toLowerCase())
          );

          const newTeacherObj = {
            id: existingIndex !== -1 ? customTeachers[existingIndex].id : Date.now(),
            name: userData.name,
            email: userData.email,
            subject: userData.subject,
            price: userData.price,
            duration: userData.duration,
            image: userData.photo,
            bio: userData.bio,
            classInfo: userData.classInfo,
            modalidad: 'Ambos',
            reviews: existingIndex !== -1 && customTeachers[existingIndex].reviews ? customTeachers[existingIndex].reviews : []
          };

          if (existingIndex !== -1) {
            customTeachers[existingIndex] = newTeacherObj;
          } else {
            customTeachers.push(newTeacherObj);
          }

          localStorage.setItem('nexora_teachers', JSON.stringify(customTeachers));
        }

        closeModal();
        checkSession();
        renderTeachers();
      };

      if (fileInput && fileInput.files && fileInput.files[0]) {
        const reader = new FileReader();
        reader.onload = function (evt) {
          const img = new Image();
          img.src = evt.target.result;
          img.onload = function () {
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');
            canvas.width = 180;
            canvas.height = 180;
            ctx.drawImage(img, 0, 0, 180, 180);
            const compressedPhoto = canvas.toDataURL('image/jpeg', 0.8);
            saveUserDataAndProceed(compressedPhoto);
          };
        };
        reader.readAsDataURL(fileInput.files[0]);
      } else {
        saveUserDataAndProceed(defaultPhoto);
      }
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
      renderTeachers();
    };
  }

  // 4. VISTA DE PERFIL Y DEJAR RESEÑAS PARA ALUMNOS
  window.openTeacherFullProfile = function(teacherId) {
    const teachers = JSON.parse(localStorage.getItem('nexora_teachers')) || [];
    const teacher = teachers.find(t => String(t.id) === String(teacherId));

    if (!teacher) return;

    let profileModal = document.getElementById('fullProfileModal');
    if (!profileModal) {
      profileModal = document.createElement('div');
      profileModal.id = 'fullProfileModal';
      profileModal.style.position = 'fixed';
      profileModal.style.top = '0';
      profileModal.style.left = '0';
      profileModal.style.width = '100vw';
      profileModal.style.height = '100vh';
      profileModal.style.backgroundColor = 'rgba(15, 23, 42, 0.7)';
      profileModal.style.display = 'flex';
      profileModal.style.alignItems = 'center';
      profileModal.style.justifyContent = 'center';
      profileModal.style.zIndex = '99999';
      profileModal.style.overflowY = 'auto';
      profileModal.style.padding = '20px 0';
      document.body.appendChild(profileModal);
    }

    const reviews = teacher.reviews || [];
    const avgRating = reviews.length > 0 
      ? (reviews.reduce((acc, r) => acc + Number(r.rating), 0) / reviews.length).toFixed(1)
      : "5.0";

    const reviewsHTML = reviews.length > 0 ? reviews.map(r => `
      <div style="background:#F8FAFC; border-radius:16px; padding:16px; margin-bottom:12px; border:1px solid #E2E8F0;">
        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:6px;">
          <strong style="font-size:14px; color:#0F172A;">${r.studentName}</strong>
          <span style="color:#F59E0B; font-weight:800; font-size:13px;">★ ${r.rating}</span>
        </div>
        <p style="font-size:13px; color:#475569; margin:0;">${r.comment}</p>
      </div>
    `).join('') : '<p style="color:#64748B; font-size:13px; italic;">Aún no hay opiniones. ¡Sé el primero en dejar tu reseña!</p>';

    profileModal.innerHTML = `
      <div style="background:white; border-radius:24px; width:92%; max-width:900px; max-height:90vh; overflow-y:auto; padding:30px; box-shadow:0 25px 50px -12px rgba(0,0,0,0.25); position:relative;">
        <button id="closeFullProfile" style="position:absolute; top:20px; right:20px; background:#F1F5F9; border:none; width:36px; height:36px; border-radius:50%; font-size:18px; cursor:pointer; color:#64748B;">✕</button>

        <div style="display:grid; grid-template-columns: 1fr 320px; gap:30px; align-items:start;">
          
          <div>
            <div style="display:flex; align-items:center; gap:16px; margin-bottom:20px;">
              <img src="${teacher.image}" style="width:90px; height:90px; border-radius:50%; object-fit:cover; border:3px solid #0052FF;">
              <div>
                <h2 style="font-size:24px; font-weight:800; margin:0; color:#0F172A;">${teacher.name}</h2>
                <span style="background:#EEF2FF; color:#0052FF; font-weight:800; padding:4px 12px; border-radius:20px; font-size:13px; display:inline-block; margin-top:4px;">${teacher.subject}</span>
                <p style="margin:4px 0 0 0; color:#F59E0B; font-weight:700; font-size:14px;">★ ${avgRating} (${reviews.length} opiniones)</p>
              </div>
            </div>

            <div style="margin-bottom:24px;">
              <h3 style="font-size:16px; font-weight:800; color:#0F172A; margin-bottom:8px;">Sobre ${teacher.name}</h3>
              <p style="font-size:14px; color:#475569; line-height:1.6; background:#F8FAFC; padding:16px; border-radius:16px; border:1px solid #E2E8F0;">
                ${teacher.bio || 'Docente enfocado en brindar una enseñanza dinámica y adaptada a cada estudiante.'}
              </p>
            </div>

            <div style="margin-bottom:24px;">
              <h3 style="font-size:16px; font-weight:800; color:#0F172A; margin-bottom:8px;">Sobre la Clase</h3>
              <p style="font-size:14px; color:#475569; line-height:1.6; background:#F8FAFC; padding:16px; border-radius:16px; border:1px solid #E2E8F0;">
                ${teacher.classInfo || 'Metodología práctica 1-a-1 con ejercicios reales, acompañamiento constante y resolución de dudas.'}
              </p>
            </div>

            <div style="margin-top:30px; border-top:1px dashed #E2E8F0; padding-top:20px;">
              <h3 style="font-size:16px; font-weight:800; color:#0F172A; margin-bottom:12px;">Opiniones (${reviews.length})</h3>
              
              <div id="reviewsContainer" style="max-height:200px; overflow-y:auto; margin-bottom:20px;">
                ${reviewsHTML}
              </div>

              <div style="background:#EEF2FF; border-radius:16px; padding:16px;">
                <h4 style="font-size:14px; font-weight:800; color:#0052FF; margin-bottom:8px;">Deja tu opinión para este docente</h4>
                <form id="addReviewForm">
                  <div style="margin-bottom:10px;">
                    <label style="font-size:12px; font-weight:700; color:#475569;">Calificación:</label>
                    <select id="reviewRating" style="padding:6px 10px; border-radius:8px; border:1px solid #CBD5E1; margin-left:8px;">
                      <option value="5">⭐⭐⭐⭐⭐ (5 Estrellas)</option>
                      <option value="4">⭐⭐⭐⭐ (4 Estrellas)</option>
                      <option value="3">⭐⭐⭐ (3 Estrellas)</option>
                      <option value="2">⭐⭐ (2 Estrellas)</option>
                      <option value="1">⭐ (1 Estrella)</option>
                    </select>
                  </div>
                  <textarea id="reviewComment" placeholder="Escribe tu comentario sobre la clase..." required style="width:100%; padding:10px; border-radius:12px; border:1px solid #CBD5E1; font-size:13px; height:60px; resize:none; margin-bottom:10px;"></textarea>
                  <button type="submit" style="background:#0052FF; color:white; border:none; padding:8px 18px; border-radius:50px; font-weight:700; font-size:12px; cursor:pointer;">Publicar Opinión</button>
                </form>
              </div>
            </div>
          </div>

          <div style="background:#F8FAFC; border-radius:20px; padding:20px; border:1px solid #E2E8F0; position:sticky; top:0;">
            <h3 style="font-size:22px; font-weight:900; color:#0052FF; margin-bottom:15px;">$${teacher.price} <small style="font-size:12px; color:#64748B; font-weight:normal;">MXN / hora</small></h3>

            <form id="fullProfileBookingForm">
              <div style="margin-bottom:12px;">
                <label style="display:block; font-size:12px; font-weight:700; color:#475569; margin-bottom:4px;">Día</label>
                <select id="fpDay" required style="width:100%; padding:8px; border-radius:10px; border:1px solid #CBD5E1; font-size:13px;">
                  <option value="Lunes">Lunes</option>
                  <option value="Martes">Martes</option>
                  <option value="Miércoles">Miércoles</option>
                  <option value="Jueves">Jueves</option>
                  <option value="Viernes">Viernes</option>
                  <option value="Sábado">Sábado</option>
                </select>
              </div>

              <div style="margin-bottom:12px;">
                <label style="display:block; font-size:12px; font-weight:700; color:#475569; margin-bottom:4px;">Fecha</label>
                <input type="date" id="fpDate" required style="width:100%; padding:8px; border-radius:10px; border:1px solid #CBD5E1; font-size:13px;">
              </div>

              <div style="margin-bottom:12px;">
                <label style="display:block; font-size:12px; font-weight:700; color:#475569; margin-bottom:4px;">Hora</label>
                <select id="fpTime" required style="width:100%; padding:8px; border-radius:10px; border:1px solid #CBD5E1; font-size:13px;">
                  <option value="09:00 AM">09:00 AM</option>
                  <option value="11:00 AM">11:00 AM</option>
                  <option value="03:00 PM">03:00 PM</option>
                  <option value="05:00 PM">05:00 PM</option>
                </select>
              </div>

              <div style="margin-bottom:16px;">
                <label style="display:block; font-size:12px; font-weight:700; color:#475569; margin-bottom:4px;">Modalidad</label>
                <select id="fpModality" required style="width:100%; padding:8px; border-radius:10px; border:1px solid #CBD5E1; font-size:13px;">
                  <option value="Online">Online (Google Meet)</option>
                  <option value="Presencial">Presencial</option>
                </select>
              </div>

              <button type="submit" style="width:100%; background:#0052FF; color:white; border:none; padding:12px; border-radius:50px; font-weight:800; font-size:14px; cursor:pointer;">
                Reservar Tutoría
              </button>
            </form>
          </div>

        </div>
      </div>
    `;

    document.getElementById('closeFullProfile').onclick = () => {
      profileModal.style.display = 'none';
    };

    document.getElementById('addReviewForm').onsubmit = (e) => {
      e.preventDefault();
      const currentUser = JSON.parse(localStorage.getItem('nexora_user'));

      if (!currentUser) {
        alert("Debes iniciar sesión para publicar una opinión.");
        openModal();
        return;
      }

      const rating = document.getElementById('reviewRating').value;
      const comment = document.getElementById('reviewComment').value.trim();

      const newReview = {
        studentName: currentUser.name,
        rating: rating,
        comment: comment,
        date: new Date().toLocaleDateString()
      };

      if (!teacher.reviews) teacher.reviews = [];
      teacher.reviews.push(newReview);

      const allTeachers = JSON.parse(localStorage.getItem('nexora_teachers')) || [];
      const index = allTeachers.findIndex(t => String(t.id) === String(teacher.id));
      if (index !== -1) {
        allTeachers[index] = teacher;
        localStorage.setItem('nexora_teachers', JSON.stringify(allTeachers));
      }

      alert("¡Gracias! Tu opinión ha sido publicada.");
      profileModal.style.display = 'none';
      renderTeachers();
    };

    document.getElementById('fullProfileBookingForm').onsubmit = (e) => {
      e.preventDefault();
      const currentUser = JSON.parse(localStorage.getItem('nexora_user'));

      if (!currentUser) {
        alert("Por favor inicia sesión como Alumno para poder reservar una clase.");
        openModal();
        return;
      }

      const newBooking = {
        id: Date.now(),
        subject: teacher.subject,
        teacherName: teacher.name,
        teacherEmail: teacher.email,
        studentName: currentUser.name,
        studentEmail: currentUser.email,
        price: teacher.price,
        day: document.getElementById('fpDay').value,
        date: document.getElementById('fpDate').value,
        time: document.getElementById('fpTime').value,
        modality: document.getElementById('fpModality').value,
        status: 'Pendiente',
        meetLink: typeof generateGoogleMeetLink === 'function' ? generateGoogleMeetLink() : 'https://meet.google.com/abc-defg-hij'
      };

      const bookings = JSON.parse(localStorage.getItem('nexora_bookings')) || [];
      bookings.push(newBooking);
      localStorage.setItem('nexora_bookings', JSON.stringify(bookings));

      alert(`¡Solicitud de tutoría enviada exitosamente a ${teacher.name}! Redirigiendo a tu panel...`);
      window.location.href = 'panel.html';
    };

    profileModal.style.display = 'flex';
  };

  renderTeachers();
});