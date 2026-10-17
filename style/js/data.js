// Inicializar la base de datos de manera segura
function initDatabase() {
  const teachers = JSON.parse(localStorage.getItem('nexora_teachers')) || [];
  
  // Si los datos guardados aún contienen a Karol G. o IDs estáticos, los limpia una sola vez
  const hasStaticOldData = teachers.some(t => t.id === "1" || t.id === "2" || t.id === "3" || t.name === "Karol G.");
  
  if (hasStaticOldData) {
    localStorage.setItem('nexora_teachers', JSON.stringify([]));
  } else if (!localStorage.getItem('nexora_teachers')) {
    localStorage.setItem('nexora_teachers', JSON.stringify([]));
  }

  if (!localStorage.getItem('nexora_bookings')) {
    localStorage.setItem('nexora_bookings', JSON.stringify([]));
  }
}

initDatabase();

function getTeachers() {
  return JSON.parse(localStorage.getItem('nexora_teachers')) || [];
}

function getTeacherById(id) {
  const teachers = getTeachers();
  return teachers.find(t => String(t.id) === String(id));
}

function getBookings() {
  return JSON.parse(localStorage.getItem('nexora_bookings')) || [];
}

function saveBooking(booking) {
  const bookings = getBookings();
  bookings.push(booking);
  localStorage.setItem('nexora_bookings', JSON.stringify(bookings));
}

function generateGoogleMeetLink() {
  const chars = 'abcdefghijklmnopqrstuvwxyz';
  const getRandomChunk = (len) => Array.from({ length: len }, () => chars[Math.floor(Math.random() * chars.length)]).join('');
  return `https://meet.google.com/${getRandomChunk(3)}-${getRandomChunk(4)}-${getRandomChunk(3)}`;
}