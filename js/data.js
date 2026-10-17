// Data inicial de profesores para la base de datos local
const initialTeachers = [
  {
    id: "1",
    name: "Karol G.",
    subject: "Inglés",
    modalidad: "Ambos",
    city: "Tuxtla Gutiérrez",
    price: 180,
    rating: 5.0,
    reviewsCount: 12,
    image: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=500&q=80",
    bio: "Clases dinámicas y prácticas de inglés para todos los niveles. Preparación de exámenes TOEFL, IELTS y conversación fluida.",
    schedule: ["09:00 AM", "11:00 AM", "04:00 PM", "06:00 PM"]
  },
  {
    id: "2",
    name: "Eira M.",
    subject: "Matemáticas",
    modalidad: "Online",
    city: "Tuxtla Gutiérrez",
    price: 160,
    rating: 4.9,
    reviewsCount: 8,
    image: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=500&q=80",
    bio: "Regularización y apoyo escolar enfocado en secundaria y preparatoria. Álgebra, geometría y cálculo con metodología paciente.",
    schedule: ["10:00 AM", "12:00 PM", "03:00 PM", "05:00 PM"]
  },
  {
    id: "3",
    name: "Gerardo R.",
    subject: "Programación",
    modalidad: "Presencial",
    city: "Tuxtla Gutiérrez",
    price: 170,
    rating: 5.0,
    reviewsCount: 11,
    image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=500&q=80",
    bio: "Docente en Ingeniería de Software. Aprende Python, JavaScript, HTML/CSS y bases de datos desde cero a nivel profesional.",
    schedule: ["08:00 AM", "02:00 PM", "04:00 PM"]
  }
];

// Inicializar la base de datos en el almacenamiento del navegador (localStorage)
function initDatabase() {
  if (!localStorage.getItem('nexora_teachers')) {
    localStorage.setItem('nexora_teachers', JSON.stringify(initialTeachers));
  }
  if (!localStorage.getItem('nexora_bookings')) {
    localStorage.setItem('nexora_bookings', JSON.stringify([]));
  }
}

// Ejecutar inicialización al cargar la página
initDatabase();

// Obtener lista completa de profesores
function getTeachers() {
  return JSON.parse(localStorage.getItem('nexora_teachers')) || [];
}

// Obtener un profesor específico por su ID
function getTeacherById(id) {
  const teachers = getTeachers();
  return teachers.find(t => t.id === id);
}

// Obtener todas las reservaciones
function getBookings() {
  return JSON.parse(localStorage.getItem('nexora_bookings')) || [];
}

// Guardar una nueva reservación
function saveBooking(booking) {
  const bookings = getBookings();
  bookings.push(booking);
  localStorage.setItem('nexora_bookings', JSON.stringify(bookings));
}

// Generador automático de enlaces únicos de Google Meet
function generateGoogleMeetLink() {
  const chars = 'abcdefghijklmnopqrstuvwxyz';
  const getRandomChunk = (len) => Array.from({ length: len }, () => chars[Math.floor(Math.random() * chars.length)]).join('');
  return `https://meet.google.com/${getRandomChunk(3)}-${getRandomChunk(4)}-${getRandomChunk(3)}`;
}