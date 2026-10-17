document.addEventListener('DOMContentLoaded', () => {
  const bookingsList = document.getElementById('bookingsList');
  const panelUserName = document.getElementById('panelUserName');
  const panelUserEmail = document.getElementById('panelUserEmail');
  const profileSidebar = document.querySelector('.right-action-sidebar');
  const btnNewBooking = document.getElementById('btnNewBooking');
  const panelTitle = document.getElementById('panelTitle');
  const panelSubtitle = document.getElementById('panelSubtitle');

  // BOTÓN NAVEGACIÓN SIDEBAR (NUBE / CHAT)
  const navChatBtn = document.querySelectorAll('.sidebar button, .sidebar a')[2];

  // OBTENER USUARIO ACTIVO DE SESIÓN
  const sessionUser = JSON.parse(localStorage.getItem('nexora_user'));

  if (!sessionUser) {
    window.location.href = 'index.html';
    return;
  }

  let user = { ...sessionUser };
  if (user.role === 'Profesor') {
    const customTeachers = JSON.parse(localStorage.getItem('nexora_teachers')) || [];
    const matchedTeacher = customTeachers.find(t => t.email && t.email.toLowerCase() === user.email.toLowerCase());
    if (matchedTeacher) {
      user.name = matchedTeacher.name || user.name;
      user.photo = matchedTeacher.image || user.photo;
      user.subject = matchedTeacher.subject || user.subject;
      user.price = matchedTeacher.price || user.price;
      user.duration = matchedTeacher.duration || user.duration;
      user.bio = matchedTeacher.bio || user.bio;
      user.classInfo = matchedTeacher.classInfo || user.classInfo;
    }
  }

  const isTeacher = user.role === 'Profesor';

  if (panelUserName) panelUserName.textContent = user.name;
  if (panelUserEmail) panelUserEmail.textContent = `${user.email} (${user.role})`;

  // --- PRESENCIA EN TIEMPO REAL (EN LÍNEA / DESCONECTADO) ---
  function updatePresence(isOnline) {
    let presence = JSON.parse(localStorage.getItem('nexora_presence')) || {};
    presence[user.email.toLowerCase()] = {
      online: isOnline,
      lastSeen: Date.now()
    };
    localStorage.setItem('nexora_presence', JSON.stringify(presence));
  }

  updatePresence(true);
  setInterval(() => updatePresence(true), 4000);

  window.addEventListener('beforeunload', () => updatePresence(false));
  window.addEventListener('offline', () => updatePresence(false));
  window.addEventListener('online', () => updatePresence(true));

  function isUserOnline(email) {
    if (!email) return false;
    const presence = JSON.parse(localStorage.getItem('nexora_presence')) || {};
    const p = presence[email.toLowerCase()];
    if (!p) return false;
    return p.online && (Date.now() - p.lastSeen < 10000);
  }

  if (isTeacher) {
    if (btnNewBooking) btnNewBooking.style.display = 'none';
    if (panelTitle) panelTitle.textContent = "Solicitudes de Tutorías";
    if (panelSubtitle) panelSubtitle.textContent = "Acepta o rechaza las solicitudes de clases recibidas y gestiona tu agenda.";

    if (profileSidebar) {
      profileSidebar.innerHTML = `
        <h3 style="font-size:18px; font-weight:800; margin-bottom:15px;">Perfil de Profesor</h3>
        <div style="background:white; border-radius:16px; padding:16px; border:1px solid #E2E8F0; text-align:center;">
          <img src="${user.photo || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80'}" 
               onerror="this.src='https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80';" 
               style="width:80px; height:80px; border-radius:50%; object-fit:cover; margin-bottom:10px; border:3px solid #FF9F00;">
          <h4 style="font-size:16px; font-weight:800;">${user.name}</h4>
          <span style="background:#E0F2FE; color:#0369A1; padding:4px 10px; border-radius:8px; font-size:12px; font-weight:700; display:inline-block; margin:6px 0;">${user.subject || 'Asesor'}</span>
          <p style="font-size:18px; font-weight:900; color:#0052FF; margin:8px 0;">$${user.price || '200'} MXN / ${user.duration || '60 min'}</p>
          <div style="text-align:left; font-size:12px; color:#64748B; margin-top:12px; border-top:1px dashed #E2E8F0; padding-top:10px;">
            <p style="margin-bottom:6px;"><strong>Bio:</strong> ${user.bio || 'Docente comprometido con la enseñanza.'}</p>
            <p><strong>Metodología:</strong> ${user.classInfo || 'Clases personalizadas y enfocadas en la práctica.'}</p>
          </div>
        </div>
      `;
    }
  } else {
    if (btnNewBooking) {
      btnNewBooking.onclick = () => {
        window.location.href = 'index.html#teachersGrid';
      };
    }
  }

  function getBookingsData() {
    return JSON.parse(localStorage.getItem('nexora_bookings')) || [];
  }

  function saveBookingsData(bookings) {
    localStorage.setItem('nexora_bookings', JSON.stringify(bookings));
  }

  function getChatsData() {
    return JSON.parse(localStorage.getItem('nexora_chats')) || {};
  }

  function saveChatsData(chats) {
    localStorage.setItem('nexora_chats', JSON.stringify(chats));
  }

  function getChatKey(email1, email2) {
    return [email1.toLowerCase(), email2.toLowerCase()].sort().join('_');
  }

  function renderPanelBookings() {
    if (!bookingsList) return;

    const allBookings = getBookingsData();
    const filteredBookings = isTeacher 
      ? allBookings.filter(b => (b.teacherEmail && b.teacherEmail.toLowerCase() === user.email.toLowerCase()) || (b.teacherName && b.teacherName.toLowerCase() === user.name.toLowerCase()))
      : allBookings.filter(b => b.studentEmail && b.studentEmail.toLowerCase() === user.email.toLowerCase());

    if (filteredBookings.length === 0) {
      bookingsList.innerHTML = `
        <div style="background:white; border-radius:20px; padding:40px; text-align:center; border:1px solid #E2E8F0; margin-top:10px;">
          <div style="font-size:48px; margin-bottom:12px;">📅</div>
          <h3 style="font-size:20px; font-weight:800; margin-bottom:8px;">
            ${isTeacher ? 'Aún no tienes solicitudes de alumnos' : 'Aún no tienes clases agendadas'}
          </h3>
          <p style="color:#64748B; font-size:14px;">
            ${isTeacher ? 'Cuando un alumno agende una clase contigo aparecerá aquí para que la aceptes.' : 'Explora el catálogo de profesores para reservar tu primera tutoría.'}
          </p>
        </div>
      `;
      return;
    }

    bookingsList.innerHTML = "";

    filteredBookings.forEach(b => {
      const card = document.createElement('div');
      card.style.background = "#FFFFFF";
      card.style.border = "1px solid #E2E8F0";
      card.style.borderRadius = "20px";
      card.style.padding = "20px";
      card.style.boxShadow = "0 4px 12px rgba(0,0,0,0.02)";
      card.style.marginBottom = "16px";

      let statusBadge = '';
      if (b.status === 'Aceptada') {
        statusBadge = `<span style="background:#DCFCE7; color:#15803D; font-weight:800; padding:4px 12px; border-radius:20px; font-size:12px;">✓ Aceptada</span>`;
      } else if (b.status === 'Rechazada') {
        statusBadge = `<span style="background:#FEE2E2; color:#B91C1C; font-weight:800; padding:4px 12px; border-radius:20px; font-size:12px;">✕ Rechazada</span>`;
      } else {
        statusBadge = `<span style="background:#FEF3C7; color:#B45309; font-weight:800; padding:4px 12px; border-radius:20px; font-size:12px;">⏳ Pendiente</span>`;
      }

      const displayPerson = isTeacher 
        ? `<strong>Alumno:</strong> ${b.studentName || 'Alumno'} (${b.studentEmail || 'correo@ejemplo.com'})`
        : `<strong>Profesor:</strong> ${b.teacherName}`;

      const chatTargetEmail = isTeacher ? b.studentEmail : b.teacherEmail;
      const chatTargetName = isTeacher ? (b.studentName || 'Alumno') : b.teacherName;

      card.innerHTML = `
        <div style="display:flex; justify-content:space-between; align-items:flex-start; flex-wrap:wrap; gap:10px;">
          <div>
            <div style="display:flex; align-items:center; gap:8px; margin-bottom:6px;">
              <span style="background:#EEF2FF; color:#0052FF; font-weight:800; padding:4px 12px; border-radius:20px; font-size:12px;">${b.subject}</span>
              ${statusBadge}
            </div>
            <h3 style="font-size:18px; font-weight:800; margin-top:6px;">${displayPerson}</h3>
          </div>
          <div>
            <span style="font-size:20px; font-weight:900; color:#0F172A;">$${b.price} MXN</span>
          </div>
        </div>

        <div style="margin-top:15px; padding-top:15px; border-top:1px dashed #E2E8F0; display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:12px;">
          <div>
            <p style="font-size:14px; font-weight:700; color:#0F172A;">
              <i class="far fa-calendar-alt" style="color:#FF9F00;"></i> <strong>${b.day || 'Martes'}</strong> ${b.date || ''} • ${b.time || ''}
            </p>
            <p style="font-size:12px; color:#64748B; margin-top:3px;">
              <i class="fas fa-map-marker-alt"></i> Modalidad: <strong>${b.modality || "Online"}</strong>
            </p>
          </div>

          <div style="display:flex; align-items:center; gap:8px; flex-wrap:wrap;">
            <button type="button" onclick="openChatWith('${chatTargetEmail}', '${chatTargetName}')" style="background:#EEF2FF; color:#0052FF; border:1px solid #BFDBFE; padding:9px 18px; border-radius:50px; font-size:14px; font-weight:700; cursor:pointer; display:inline-flex; align-items:center; gap:6px;">
              💬 Enviar Mensaje
            </button>

            ${isTeacher ? `
              <button type="button" onclick="updateStatus(${b.id}, 'Aceptada')" style="background:#22C55E; color:white; border:none; padding:9px 18px; border-radius:50px; font-size:14px; font-weight:700; cursor:pointer;">
                ✓ Aceptar
              </button>
              <button type="button" onclick="updateStatus(${b.id}, 'Rechazada')" style="background:#EF4444; color:white; border:none; padding:9px 18px; border-radius:50px; font-size:14px; font-weight:700; cursor:pointer;">
                ✕ Rechazar
              </button>
            ` : `
              <button type="button" onclick="deleteBooking(${b.id})" style="background:#FEE2E2; color:#DC2626; border:1px solid #FCA5A5; padding:9px 18px; border-radius:50px; font-size:14px; font-weight:700; cursor:pointer;">
                🗑️ Cancelar
              </button>
            `}

            ${(b.modality === 'Online' || b.modality === 'Ambos') && b.status === 'Aceptada' ? `
              <a href="${b.meetLink || 'https://meet.google.com'}" target="_blank" style="font-size:14px; padding:9px 18px; text-decoration:none; display:inline-flex; align-items:center; gap:6px; background:#7C3AED; color:white; border-radius:50px; font-weight:700;">
                <i class="fas fa-video"></i> Google Meet
              </a>
            ` : ''}
          </div>
        </div>
      `;

      bookingsList.appendChild(card);
    });
  }

  // --- MÓDULO DE CHAT INTERACTIVO (LETRAS MÁS GRANDES Y MODALES DIRECTOS) ---
  let chatInterval = null;
  let activeChatTarget = { email: '', name: '' };

  window.openChatWith = function(targetEmail, targetName) {
    if (!targetEmail) {
      alert("Contacto no disponible.");
      return;
    }

    activeChatTarget = { email: targetEmail, name: targetName };

    let chatModal = document.getElementById('chatModal');
    if (!chatModal) {
      chatModal = document.createElement('div');
      chatModal.id = 'chatModal';
      chatModal.style.position = 'fixed';
      chatModal.style.top = '0';
      chatModal.style.left = '0';
      chatModal.style.width = '100vw';
      chatModal.style.height = '100vh';
      chatModal.style.backgroundColor = 'rgba(15, 23, 42, 0.65)';
      chatModal.style.display = 'flex';
      chatModal.style.alignItems = 'center';
      chatModal.style.justifyContent = 'center';
      chatModal.style.zIndex = '99999';
      document.body.appendChild(chatModal);
    }

    const chatKey = getChatKey(user.email, targetEmail);

    function renderMessages() {
      const allChats = getChatsData();
      const messages = allChats[chatKey] || [];

      if (messages.length === 0) {
        return `<div style="text-align:center; padding:40px; color:#94A3B8; font-size:15px; font-weight:600;">💬 ¡Comienza la conversación con ${targetName}!</div>`;
      }

      return messages.map((m, index) => {
        if (m.deletedFor && m.deletedFor.includes(user.email.toLowerCase())) {
          return '';
        }

        const isMe = m.senderEmail.toLowerCase() === user.email.toLowerCase();
        const isDeletedForAll = m.deletedForAll;

        return `
          <div style="display:flex; justify-content:${isMe ? 'flex-end' : 'flex-start'}; margin-bottom:14px;">
            <div style="max-width:80%; background:${isMe ? '#0052FF' : '#F1F5F9'}; color:${isMe ? 'white' : '#0F172A'}; padding:12px 16px; border-radius:${isMe ? '18px 18px 4px 18px' : '18px 18px 18px 4px'}; box-shadow:0 2px 5px rgba(0,0,0,0.04);">
              
              <!-- TEXTO DEL MENSAJE MÁS GRANDE (15px) -->
              <p style="margin:0; font-size:15px; line-height:1.45; font-weight:500; word-break:break-word; font-style:${isDeletedForAll ? 'italic' : 'normal'}; opacity:${isDeletedForAll ? 0.7 : 1}">
                ${isDeletedForAll ? '🚫 Este mensaje fue eliminado' : m.text}
              </p>

              <div style="display:flex; align-items:center; justify-content:flex-end; gap:6px; margin-top:6px;">
                ${m.edited && !isDeletedForAll ? `<span style="font-size:11px; opacity:0.8;">(editado)</span>` : ''}
                <small style="font-size:11px; opacity:0.85; font-weight:600;">${m.time}</small>
              </div>

              <!-- BOTONES DIRECTOS (MÁS GRANDES Y VISIBLES) -->
              ${!isDeletedForAll ? `
                <div style="margin-top:8px; border-top:1px solid ${isMe ? 'rgba(255,255,255,0.25)' : '#E2E8F0'}; padding-top:6px; display:flex; gap:12px; justify-content:flex-end;">
                  ${isMe ? `<button type="button" onclick="openEditDialog('${chatKey}', ${index})" style="background:none; border:none; color:${isMe ? 'white' : '#0052FF'}; font-size:12px; font-weight:800; cursor:pointer; padding:0; text-decoration:underline;">✏️ Editar</button>` : ''}
                  <button type="button" onclick="openDeleteDialog('${chatKey}',${index}, ${isMe})" style="background:none; border:none; color:${isMe ? '#FFD1D1' : '#EF4444'}; font-size:12px; font-weight:800; cursor:pointer; padding:0; text-decoration:underline;">🗑️ Eliminar</button>
                </div>
              ` : ''}

            </div>
          </div>
        `;
      }).join('');
    }

    function updateHeaderPresence() {
      const onlineStatusEl = document.getElementById('chatOnlineStatus');
      if (onlineStatusEl) {
        const online = isUserOnline(targetEmail);
        onlineStatusEl.innerHTML = online 
          ? `<span style="color:#22C55E; font-weight:800;">● En línea</span>`
          : `<span style="color:#94A3B8; font-weight:700;">○ Desconectado</span>`;
      }
    }

    chatModal.innerHTML = `
      <div style="background:white; border-radius:24px; width:94%; max-width:550px; height:620px; display:flex; flex-direction:column; overflow:hidden; box-shadow:0 25px 50px -12px rgba(0,0,0,0.25); position:relative;">
        
        <!-- HEADER DEL CHAT -->
        <div style="background:#F8FAFC; padding:16px 22px; border-bottom:1px solid #E2E8F0; display:flex; justify-content:space-between; align-items:center;">
          <div style="display:flex; align-items:center; gap:12px;">
            <div style="width:44px; height:44px; border-radius:50%; background:#0052FF; color:white; display:flex; align-items:center; justify-content:center; font-weight:800; font-size:18px;">
              ${targetName.charAt(0).toUpperCase()}
            </div>
            <div>
              <h4 style="margin:0; font-size:17px; font-weight:800; color:#0F172A;">${targetName}</h4>
              <small id="chatOnlineStatus" style="font-size:13px;"></small>
            </div>
          </div>
          <button id="closeChatBtn" style="background:#F1F5F9; border:none; width:36px; height:36px; border-radius:50%; font-size:18px; cursor:pointer; color:#64748B;">✕</button>
        </div>

        <!-- LISTA DE MENSAJES -->
        <div id="chatMessagesBox" style="flex:1; padding:22px; overflow-y:auto; background:#FAFAFA;">
          ${renderMessages()}
        </div>

        <!-- SELECTOR DE EMOJIS -->
        <div id="emojiPicker" style="display:none; padding:12px; background:#F8FAFC; border-top:1px solid #E2E8F0; gap:10px; flex-wrap:wrap; font-size:22px;">
          <span style="cursor:pointer;" onclick="insertEmoji('😊')">😊</span>
          <span style="cursor:pointer;" onclick="insertEmoji('👍')">👍</span>
          <span style="cursor:pointer;" onclick="insertEmoji('❤️')">❤️</span>
          <span style="cursor:pointer;" onclick="insertEmoji('👋')">👋</span>
          <span style="cursor:pointer;" onclick="insertEmoji('🎓')">🎓</span>
          <span style="cursor:pointer;" onclick="insertEmoji('📚')">📚</span>
          <span style="cursor:pointer;" onclick="insertEmoji('🙌')">🙌</span>
          <span style="cursor:pointer;" onclick="insertEmoji('🔥')">🔥</span>
          <span style="cursor:pointer;" onclick="insertEmoji('✨')">✨</span>
          <span style="cursor:pointer;" onclick="insertEmoji('✅')">✅</span>
        </div>

        <!-- INPUT MENSAJE (MÁS CÓMODO Y VISIBLE) -->
        <form id="sendMessageForm" style="padding:14px 18px; border-top:1px solid #E2E8F0; background:white; display:flex; gap:10px; align-items:center;">
          <button type="button" id="toggleEmojiBtn" style="background:none; border:none; font-size:24px; cursor:pointer; padding:4px;">😊</button>
          <input type="text" id="chatInputText" placeholder="Escribe un mensaje..." required style="flex:1; padding:12px 18px; border-radius:50px; border:1px solid #CBD5E1; font-size:15px; outline:none;">
          <button type="submit" style="background:#0052FF; color:white; border:none; padding:12px 22px; border-radius:50px; font-weight:800; font-size:15px; cursor:pointer;">Enviar</button>
        </form>

      </div>
    `;

    updateHeaderPresence();
    const chatBox = document.getElementById('chatMessagesBox');
    if (chatBox) chatBox.scrollTop = chatBox.scrollHeight;

    if (chatInterval) clearInterval(chatInterval);
    chatInterval = setInterval(() => {
      updateHeaderPresence();
      if (chatBox) {
        const scrollAtBottom = chatBox.scrollHeight - chatBox.scrollTop <= chatBox.clientHeight + 60;
        chatBox.innerHTML = renderMessages();
        if (scrollAtBottom) chatBox.scrollTop = chatBox.scrollHeight;
      }
    }, 2000);

    document.getElementById('closeChatBtn').onclick = () => {
      chatModal.style.display = 'none';
      if (chatInterval) clearInterval(chatInterval);
    };

    document.getElementById('toggleEmojiBtn').onclick = () => {
      const picker = document.getElementById('emojiPicker');
      picker.style.display = picker.style.display === 'none' ? 'flex' : 'none';
    };

    window.insertEmoji = function(emoji) {
      const input = document.getElementById('chatInputText');
      if (input) {
        input.value += emoji;
        input.focus();
      }
    };

    document.getElementById('sendMessageForm').onsubmit = (e) => {
      e.preventDefault();
      const input = document.getElementById('chatInputText');
      const text = input.value.trim();
      if (!text) return;

      const allChats = getChatsData();
      if (!allChats[chatKey]) allChats[chatKey] = [];

      const now = new Date();
      const timeStr = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

      allChats[chatKey].push({
        senderEmail: user.email,
        text: text,
        time: timeStr,
        edited: false,
        deletedForAll: false,
        deletedFor: []
      });

      saveChatsData(allChats);
      input.value = '';
      document.getElementById('emojiPicker').style.display = 'none';

      if (chatBox) {
        chatBox.innerHTML = renderMessages();
        chatBox.scrollTop = chatBox.scrollHeight;
      }
    };

    chatModal.style.display = 'flex';
  };

  // --- MODAL PERSONALIZADO DIRECTO PARA ELIMINAR MENSAJES (SIN PROMPT) ---
  window.openDeleteDialog = function(chatKey, index, isMine) {
    let dialog = document.getElementById('customDeleteModal');
    if (!dialog) {
      dialog = document.createElement('div');
      dialog.id = 'customDeleteModal';
      dialog.style.position = 'fixed';
      dialog.style.top = '0';
      dialog.style.left = '0';
      dialog.style.width = '100vw';
      dialog.style.height = '100vh';
      dialog.style.backgroundColor = 'rgba(15, 23, 42, 0.7)';
      dialog.style.display = 'flex';
      dialog.style.alignItems = 'center';
      dialog.style.justifyContent = 'center';
      dialog.style.zIndex = '100000';
      document.body.appendChild(dialog);
    }

    dialog.innerHTML = `
      <div style="background:white; border-radius:20px; padding:25px; width:90%; max-width:380px; text-align:center; box-shadow:0 20px 25px -5px rgba(0,0,0,0.2);">
        <h3 style="font-size:18px; font-weight:800; margin:0 0 10px 0; color:#0F172A;">¿Eliminar mensaje?</h3>
        <p style="font-size:14px; color:#64748B; margin-bottom:20px;">Elige una opción para eliminar este mensaje:</p>

        <div style="display:flex; flex-direction:column; gap:10px;">
          ${isMine ? `
            <button id="btnDeleteForAll" style="background:#EF4444; color:white; border:none; padding:12px; border-radius:12px; font-weight:800; font-size:14px; cursor:pointer;">
              🚫 Eliminar para todos
            </button>
          ` : ''}
          <button id="btnDeleteForMe" style="background:#EEF2FF; color:#0052FF; border:1px solid #BFDBFE; padding:12px; border-radius:12px; font-weight:800; font-size:14px; cursor:pointer;">
            🗑️ Eliminar solo para mí
          </button>
          <button id="btnCancelDelete" style="background:none; border:none; color:#64748B; padding:8px; font-weight:700; font-size:13px; cursor:pointer; margin-top:4px;">
            Cancelar
          </button>
        </div>
      </div>
    `;

    document.getElementById('btnCancelDelete').onclick = () => dialog.style.display = 'none';

    if (isMine) {
      document.getElementById('btnDeleteForAll').onclick = () => {
        executeDelete(chatKey, index, 'all');
        dialog.style.display = 'none';
      };
    }

    document.getElementById('btnDeleteForMe').onclick = () => {
      executeDelete(chatKey, index, 'me');
      dialog.style.display = 'none';
    };

    dialog.style.display = 'flex';
  };

  function executeDelete(chatKey, index, type) {
    const allChats = getChatsData();
    const messages = allChats[chatKey] || [];
    if (!messages[index]) return;

    if (type === 'all') {
      messages[index].deletedForAll = true;
    } else {
      if (!messages[index].deletedFor) messages[index].deletedFor = [];
      messages[index].deletedFor.push(user.email.toLowerCase());
    }

    saveChatsData(allChats);
    openChatWith(activeChatTarget.email, activeChatTarget.name);
  }

  // --- MODAL PERSONALIZADO DIRECTO PARA EDITAR MENSAJES ---
  window.openEditDialog = function(chatKey, index) {
    const allChats = getChatsData();
    const messages = allChats[chatKey] || [];
    const msg = messages[index];
    if (!msg) return;

    let dialog = document.getElementById('customEditModal');
    if (!dialog) {
      dialog = document.createElement('div');
      dialog.id = 'customEditModal';
      dialog.style.position = 'fixed';
      dialog.style.top = '0';
      dialog.style.left = '0';
      dialog.style.width = '100vw';
      dialog.style.height = '100vh';
      dialog.style.backgroundColor = 'rgba(15, 23, 42, 0.7)';
      dialog.style.display = 'flex';
      dialog.style.alignItems = 'center';
      dialog.style.justifyContent = 'center';
      dialog.style.zIndex = '100000';
      document.body.appendChild(dialog);
    }

    dialog.innerHTML = `
      <div style="background:white; border-radius:20px; padding:25px; width:90%; max-width:400px; box-shadow:0 20px 25px -5px rgba(0,0,0,0.2);">
        <h3 style="font-size:18px; font-weight:800; margin:0 0 12px 0; color:#0F172A;">Editar mensaje</h3>
        <textarea id="editMessageTextArea" style="width:100%; padding:12px; border-radius:12px; border:1px solid #CBD5E1; font-size:15px; height:80px; resize:none; outline:none; margin-bottom:15px;">${msg.text}</textarea>

        <div style="display:flex; justify-content:flex-end; gap:10px;">
          <button id="btnCancelEdit" style="background:#F1F5F9; color:#475569; border:none; padding:10px 18px; border-radius:50px; font-weight:700; font-size:13px; cursor:pointer;">Cancelar</button>
          <button id="btnSaveEdit" style="background:#0052FF; color:white; border:none; padding:10px 18px; border-radius:50px; font-weight:800; font-size:13px; cursor:pointer;">Guardar Cambios</button>
        </div>
      </div>
    `;

    document.getElementById('btnCancelEdit').onclick = () => dialog.style.display = 'none';

    document.getElementById('btnSaveEdit').onclick = () => {
      const newText = document.getElementById('editMessageTextArea').value.trim();
      if (newText) {
        messages[index].text = newText;
        messages[index].edited = true;
        saveChatsData(allChats);
        dialog.style.display = 'none';
        openChatWith(activeChatTarget.email, activeChatTarget.name);
      }
    };

    dialog.style.display = 'flex';
  };

  // NAV BAR LATERAL
  if (navChatBtn) {
    navChatBtn.onclick = (e) => {
      e.preventDefault();
      const allBookings = getBookingsData();
      const userBookings = isTeacher 
        ? allBookings.filter(b => (b.teacherEmail && b.teacherEmail.toLowerCase() === user.email.toLowerCase()))
        : allBookings.filter(b => (b.studentEmail && b.studentEmail.toLowerCase() === user.email.toLowerCase()));

      if (userBookings.length > 0) {
        const firstChat = userBookings[0];
        const targetEmail = isTeacher ? firstChat.studentEmail : firstChat.teacherEmail;
        const targetName = isTeacher ? (firstChat.studentName || 'Alumno') : firstChat.teacherName;
        openChatWith(targetEmail, targetName);
      } else {
        alert("Aún no tienes tutorías o contactos agendados para chatear.");
      }
    };
  }

  window.updateStatus = function(id, newStatus) {
    let allBookings = getBookingsData();
    const index = allBookings.findIndex(b => Number(b.id) === Number(id));

    if (index !== -1) {
      allBookings[index].status = newStatus;
      saveBookingsData(allBookings);
      renderPanelBookings();
    }
  };

  window.deleteBooking = function(id) {
    if (confirm("¿Estás seguro de que deseas cancelar esta clase?")) {
      let allBookings = getBookingsData();
      allBookings = allBookings.filter(b => Number(b.id) !== Number(id));
      saveBookingsData(allBookings);
      renderPanelBookings();
    }
  };

  renderPanelBookings();
});