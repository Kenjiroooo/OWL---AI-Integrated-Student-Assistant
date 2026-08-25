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
    { question: "How to request a transcript?", answer: "Go to the Registrar Hub in this kiosk, select 'Document Request', and choose 'Transcript of Records'.", category: "Registrar" },
    { question: "Where is the library?", answer: "The library is located on the 3rd floor of the Main Building.", category: "Campus" }
  ];

  faqs.forEach(q => {
    const ref = doc(collection(db, 'inquiryBase'));
    batch.set(ref, q);
  });

  await batch.commit();
  console.log("Seed data committed.");
}
