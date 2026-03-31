export type FacultyCardItem = {
    id: string;
    name: string;
    role: string;
    department: string;
    email?: string;
    phone?: string;
    photoUrl?: string;
    boardSection: string;
    positionIndex: number;
};
export type FacultyBoardPayload = {
    rows: string[];
    cards: FacultyCardItem[];
};
export type FacultyBoardResponse = FacultyBoardPayload & {
    /** True when the sheet tab has no data rows yet (first deploy); client may seed from JSON. */
    sheetEmpty: boolean;
};
export declare function getBoard(): Promise<FacultyBoardResponse>;
export declare function saveBoard(payload: FacultyBoardPayload): Promise<void>;
//# sourceMappingURL=facultyBoardService.d.ts.map