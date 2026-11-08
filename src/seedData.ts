import { db } from './lib/firebase';
import { collection, doc, setDoc, writeBatch } from 'firebase/firestore';

export async function seedDummyData() {
  const batch = writeBatch(db);

  // 1. Announcements
  const announcements = [
    { title: "Midterm Exams Schedule", content: "Midterm exams will start on May 15th. Please check your portals.", type: "news", createdAt: new Date() },
    { title: "Campus Founding Anniversary", content: "Join us for the 75th Anniversary celebration next week!", type: "event", targetDate: new Date("2024-12-31"), createdAt: new Date(), imageUrls: ['/announcement-images/pitch.jpg'] },
    { title: "Typhoon Warning", content: "Classes are suspended due to inclement weather.", type: "emergency", createdAt: new Date() }
  ];

  announcements.forEach(ann => {
    const ref = doc(collection(db, 'announcement'));
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

  // 3. Faculty (Authorized School of Engineering Leadership)
  const faculty = [
    { name: "Dr. Jose Jay De Vera", department: "School of Engineering", officeLocation: "Engineering Building - Dean's Office (Room E-101)" },
    { name: "Engr. Roderick Cabaña", department: "School of Engineering", officeLocation: "Engineering Building - Faculty & Program Office (Room E-102)" }
  ];

  faculty.forEach(f => {
    const ref = doc(collection(db, 'facultyOffices'));
    batch.set(ref, f);
  });

  // 4. FAQ
  const faqs = [
    {
      question: "How do I request a Transcript of Records (TOR)?",
      answer: "Visit the Registrar's Office at the Administration Building (A Building). Fill out the request form, pay the processing fee at the Finance Office, and allow 3–5 working days. Bring a valid school ID.",
      category: "Registrar",
    },
    {
      question: "What are the enrollment steps for new students?",
      answer: "1. **Get an Enlistment Form** – Proceed to Room V204 to obtain your enlistment form.\n\n2. **List Your Subjects** – Identify all the subjects you need to enroll in and fill them out in the enlistment form.\n\n3. **Submit Your Form** – Submit your completed enlistment form at the Enlistment Counter.\n\n4. **Pay the Enrollment Fee** – Proceed to the Cashier located on the ground floor of the Administration Building to pay your enrollment fee.\n\n5. **Complete Your Enrollment** – Go to your department's designated room to finalize your enrollment and have your White Form printed.\n\n6. **You're Officially Enrolled!** – Congratulations! You have successfully completed the enrollment process.",
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
    {
      question: "What is Kuwago Café and what does it offer?",
      answer: "Kuwago Café is a campus-based coffee shop and food establishment at Universidad de Dagupan offering rice meals, snacks, milk tea, iced coffee, hot coffee, and fruit tea across two shop locations on campus. Services include dine-in, takeaway, advance ordering for pickup, and order customization. Specific menu items, prices, and operating hours should be confirmed with café staff.",
      category: "Dining",
    },
  ];

  faqs.forEach(q => {
    const ref = doc(collection(db, 'inquiryBase'));
    batch.set(ref, q);
  });

  await batch.commit();
  console.log("Seed data committed.");
}
