import { db } from './lib/firebase';
import { collection, doc, setDoc, writeBatch } from 'firebase/firestore';

export async function seedDummyData() {
  const batch = writeBatch(db);

  // 1. Announcements
  const announcements = [
    { title: "Midterm Exams Schedule", content: "Midterm exams will start on May 15th. Please check your portals.", type: "news", createdAt: new Date() },
    { title: "Campus Founding Anniversary", content: "Join us for the 75th Anniversary celebration next week!", type: "event", targetDate: new Date("2024-12-31"), createdAt: new Date() },
    { title: "Typhoon Warning", content: "Classes are suspended due to inclement weather.", type: "emergency", createdAt: new Date() }
  ];

  announcements.forEach(ann => {
    const ref = doc(collection(db, 'announcements'));
    batch.set(ref, ann);
  });

  // 2. Buildings
  const buildings = [
    { name: "Main Building", mapImageUrl: "https://placehold.co/600x400?text=Main+Building+Map", description: "Houses the administrative offices and major lecture halls.", rooms: ["L-101", "L-102", "Registrar", "Finance"] },
    { name: "Engineering Complex", mapImageUrl: "https://placehold.co/600x400?text=Engineering+Map", description: "State-of-the-art labs and engineering faculty.", rooms: ["E-201", "Lab A", "Lab B"] }
  ];

  buildings.forEach(b => {
    const ref = doc(collection(db, 'campusBuildings'));
    batch.set(ref, b);
  });

  // 3. Faculty
  const faculty = [
    { name: "Dr. Juan Dela Cruz", department: "College of Computer Studies", officeLocation: "Main Bldg - Room 204", email: "juan.delacruz@ud.edu.ph" },
    { name: "Prof. Maria Santos", department: "College of Engineering", officeLocation: "Eng Room 102", email: "maria.santos@ud.edu.ph" }
  ];

  faculty.forEach(f => {
    const ref = doc(collection(db, 'facultyOffices'));
    batch.set(ref, f);
  });

  // 4. FAQ
  const faqs = [
    {
      question: "How do I request a Transcript of Records?",
      answer: "Visit the Registrar's Office at the Administration Building (A Building). Fill out the request form, pay the processing fee at the Finance Office, and allow 3–5 working days. Bring a valid school ID.",
      category: "Registrar",
    },
    {
      question: "What are the enrollment steps for new students?",
      answer: "1) Submit admission requirements online or at the Registrar's Office. 2) Take the entrance exam if applicable. 3) Receive your assessment. 4) Pay tuition at the Finance Office or via online payment. 5) Claim your class schedule and school ID.",
      category: "Enrollment",
    },
    {
      question: "Where can I find my class schedule and grades?",
      answer: "Access your class schedule and grades through the UdD student portal at site.udd.edu.ph. Log in with your student credentials. For enrollment-related concerns, visit the Registrar's Office directly.",
      category: "Academics",
    },
    {
      question: "What should I do if I lost my school ID?",
      answer: "Report the lost ID to the Student Affairs Office immediately. Fill out the ID replacement form and pay the replacement fee at the Finance Office. Processing usually takes 3–5 working days.",
      category: "Student Affairs",
    },
    {
      question: "How do I apply for a Leave of Absence?",
      answer: "Submit a written letter of intent to the Registrar's Office stating the reason and expected duration. A parent or guardian signature is required. You may re-enroll for the next applicable semester after the LOA is processed.",
      category: "Registrar",
    },
    {
      question: "What are the campus clinic hours and services?",
      answer: "The campus clinic at the School of Health Sciences building is open Monday to Friday, 8:00 AM – 5:00 PM. Services include first aid, basic health consultations, and medical clearance for enrollment.",
      category: "Health Services",
    },
    {
      question: "How do I contact the Finance Office for tuition concerns?",
      answer: "The Finance Office is at the Administration Building (A Building), open Monday–Friday 8:00 AM–5:00 PM. For online payment instructions and bank details, visit the official UdD website at udd.edu.ph.",
      category: "Finance",
    },
  ];

  faqs.forEach(q => {
    const ref = doc(collection(db, 'inquiryBase'));
    batch.set(ref, q);
  });

  await batch.commit();
  console.log("Seed data committed.");
}
