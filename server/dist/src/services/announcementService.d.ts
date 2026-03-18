type Announcement = {
    id: number;
    title: string;
    content: string;
    category: string;
    datePosted: string;
    imageUrl?: string;
};
export declare function getAll(limit: number | null): Promise<Announcement[]>;
export declare function getById(id: string | number): Promise<Announcement>;
export declare function create(data: {
    title: string;
    content: string;
    category: string;
    datePosted?: string;
    imageUrl?: string;
}): Promise<Announcement>;
export declare function update(id: string | number, data: {
    title?: string;
    content?: string;
    category?: string;
    datePosted?: string;
    imageUrl?: string;
}): Promise<Announcement>;
export declare function remove(id: string | number): Promise<Announcement>;
export {};
//# sourceMappingURL=announcementService.d.ts.map