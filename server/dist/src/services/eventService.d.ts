type Event = {
    id: number;
    title: string;
    description: string;
    date: string;
    endDate?: string;
    type: string;
    imageFileId?: string;
    imageUrl?: string;
    googleEventId?: string;
};
export declare function getAll(): Promise<Event[]>;
export declare function getById(id: string | number): Promise<Event>;
export declare function create(data: {
    title: string;
    description: string;
    date: string | Date;
    endDate?: string | Date;
    type: string;
    imageFileId?: string;
}): Promise<Event>;
export declare function update(id: string | number, data: {
    title?: string;
    description?: string;
    date?: string | Date;
    endDate?: string | Date;
    type?: string;
    imageFileId?: string;
}): Promise<Event>;
export declare function remove(id: string | number): Promise<Event>;
export {};
//# sourceMappingURL=eventService.d.ts.map