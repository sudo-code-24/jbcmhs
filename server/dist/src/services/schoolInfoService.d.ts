type SchoolInfo = {
    id: number;
    name: string;
    history: string;
    mission: string;
    vision: string;
    phone: string;
    email: string;
    address: string;
    officeHours: string;
    heroImageUrl?: string;
    schoolImageUrl?: string;
};
export declare function get(): Promise<SchoolInfo>;
export declare function upsert(data: Record<string, string>): Promise<SchoolInfo>;
export {};
//# sourceMappingURL=schoolInfoService.d.ts.map