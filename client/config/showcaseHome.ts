export type Feature = {
  title: string;
  text: string;
  icon: string;
};

export type Post = {
  title: string;
  text: string;
};

export const HOME_FEATURES: Feature[] = [
  { title: "Experienced Teachers", text: "Qualified educators who care.", icon: "👩‍🏫" },
  { title: "Modern Learning", text: "Interactive and engaging lessons.", icon: "🧠" },
  { title: "Safe Environment", text: "Secure, inclusive school community.", icon: "🛡️" },
  { title: "Creative Development", text: "Encouraging imagination and growth.", icon: "🎨" },
];

export const HOME_POSTS: Post[] = [
  {
    title: "Community Event Strengthens School Partnerships",
    text: "Building strong connections between schools and their communities.",
  },
  {
    title: "Creative Arts Week Showcases Student Talent",
    text: "A lively week celebrating artistic expression across campus.",
  },
  {
    title: "New Digital Tools Enhance Classroom Learning",
    text: "Classrooms adopt modern tools to improve student outcomes.",
  },
  {
    title: "Students Celebrate Annual School Sports Day",
    text: "A day of teamwork, effort, and school pride.",
  },
];

