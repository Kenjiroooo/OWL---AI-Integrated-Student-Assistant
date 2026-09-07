/**
 * featureAIContext.ts
 *
 * Context strings that are injected into the OWL AI system prompt
 * when a user opens the AI assistant drawer from a specific feature page.
 * This makes the AI context-aware — it knows what the user is currently doing.
 */

export const FEATURE_AI_CONTEXT: Record<string, string> = {
  academic:
    'The student is currently viewing their Academic Hub, which shows their GPA (1.45), current semester grades, enrollment checklist, and curriculum progress. Help them understand their academic standing, explain their grades, suggest study strategies, or guide them on enrollment requirements.',
  'campus-nav':
    'The student is currently using the Campus Navigation map of Universidad de Dagupan. Help them find specific buildings, rooms, offices, or give directions around the campus. Key landmarks: Main Building (admin, Registrar, Finance), Library (3rd Floor Main), Student Affairs (Building F), Linkage Office, BSCS/IT Department.',
  transport:
    'The student is viewing the SakayUDD Campus Transport page which shows the e-jeepney live timetable and routes for Universidad de Dagupan. Help them with questions about e-jeep schedules, routes, stops, fares, or how to use the SakayUDD app.',
  exam:
    'The student is viewing their Examination Timetable. They can see upcoming exam schedules, assigned rooms, and proctors. Help them with questions about exam protocols, what ID to bring, what happens if they are late, or how to read their schedule.',
  announcements:
    'The student is reading the Notice Board which contains campus announcements, events, and alerts from Universidad de Dagupan. Help them understand or find specific announcements, upcoming events, or important campus news.',
  faculty:
    'The student is using the Faculty Locator to find professors and faculty members at Universidad de Dagupan. Help them find a specific professor, their office location, department, consultation hours, or contact email.',
  feedback:
    'The student is on the Feedback Center page, which is a suggestion box for campus improvements. Help them articulate their feedback clearly, identify which category it falls under (General, Facilities, Academic, Food Service), or direct them to the correct department for urgent concerns.',
  inquiry:
    'The student is browsing the Inquiry Center FAQ which answers common questions about campus life, academics, and services at Universidad de Dagupan. Help them find answers to their questions about enrollment, requirements, schedules, or campus services.',
  'lost-found':
    'The student is on the Lost & Found board where campus items are reported as lost or found. Help them describe a lost item accurately so others can identify it, or help them find if a specific item has been reported found on campus.',
};

/**
 * Returns the feature-specific context string for the AI prompt.
 * Falls back to a generic campus assistant context if no match.
 */
export function getFeatureContext(featureId: string | null): string {
  if (!featureId || !FEATURE_AI_CONTEXT[featureId]) {
    return 'The student is browsing the OWL Kiosk System dashboard. Help them navigate to the right feature or answer general questions about Universidad de Dagupan campus services.';
  }
  return FEATURE_AI_CONTEXT[featureId];
}
