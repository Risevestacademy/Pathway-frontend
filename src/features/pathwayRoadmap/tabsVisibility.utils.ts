const MY_PATHWAY = "/my-pathway";
const SKILL_CHECK = `${MY_PATHWAY}/skill-check`;

const isQuestionnaire = (pathname: string) => /^\/my-pathway\/skill-check\/[^/]+\/?$/.test(pathname);

/**
 * Whether My Pathway's Roadmap | Skill Check tabs belong on this page. They sit
 * on the two top-level screens. A career's own pathway pages and the
 * questionnaire take the whole page.
 */
export function showsMyPathwayTabs(pathname: string): boolean {
  if (pathname === MY_PATHWAY || pathname === `${MY_PATHWAY}/`) return true;
  if (pathname === SKILL_CHECK || pathname.startsWith(`${SKILL_CHECK}/`)) {
    return !isQuestionnaire(pathname);
  }
  return false;
}
