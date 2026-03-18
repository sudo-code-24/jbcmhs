"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
async function main() {
    await prisma.schoolInfo.upsert({
        where: { id: 1 },
        update: {},
        create: {
            id: 1,
            name: "Jose B. Cardenas Mem HS",
            history: "Founded in 1952, Jose B. Cardenas Mem HS has served the community for over seven decades. We have grown from a small rural school to a comprehensive high school with a strong tradition of academic excellence and community involvement.",
            mission: "To provide a safe, inclusive learning environment where every student can achieve their full potential through rigorous academics, character development, and real-world experiences.",
            vision: "To be the leading public high school in the region, known for excellence in education, innovation, and community partnership.",
            phone: "+1 (555) 123-4567",
            email: "office@lincolnhigh.edu",
            address: "123 Education Way, Lincoln, CA 95648",
            officeHours: "Monday–Friday: 7:30 AM – 4:00 PM",
        },
    });
    await prisma.announcement.createMany({
        data: [
            {
                title: "Welcome Back to School",
                content: "We are excited to welcome all students and staff for the new academic year. Classes begin Monday at 8:00 AM.",
                category: "General",
            },
            {
                title: "Parent-Teacher Conferences",
                content: "Parent-teacher conferences are scheduled for next week. Please sign up via the school portal.",
                category: "Events",
            },
            {
                title: "Library Hours Extended",
                content: "The school library will now be open until 6 PM on weekdays to support after-school study.",
                category: "General",
            },
        ],
    });
    const nextMonth = new Date();
    nextMonth.setMonth(nextMonth.getMonth() + 1);
    await prisma.event.createMany({
        data: [
            {
                title: "First Day of School",
                description: "Fall semester begins",
                date: new Date(),
                type: "academic",
            },
            {
                title: "Back to School Night",
                description: "Parents meet teachers",
                date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
                type: "event",
            },
            {
                title: "Fall Sports Tryouts",
                description: "Football, soccer, volleyball",
                date: nextMonth,
                type: "sports",
            },
        ],
    });
    console.log("Seed completed.");
}
main()
    .catch((e) => {
    console.error(e);
    process.exit(1);
})
    .finally(async () => {
    await prisma.$disconnect();
});
//# sourceMappingURL=seed.js.map