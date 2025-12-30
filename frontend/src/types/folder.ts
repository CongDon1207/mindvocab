export type Folder = {
    _id: string;
    name: string;
    description?: string;
    stats?: {
        totalWords: number;
        mastered: number;
    };
    createdAt: string;
    updatedAt: string;
};

export type FolderStatistics = {
    folderName: string;
    totalWords: number;
    stageDistribution: {
        [key: number]: number;
    };
    forecast: {
        overdue: number;
        today: number;
        tomorrow: number;
        next3Days: number;
        nextWeek: number;
        later: number;
    };
};

export type FolderReviewStats = {
    folderId: string;
    folderName: string;
    totalWords: number;
    earliestReview: string;
    diffDays: number;
    category: 'overdue' | '3days' | '7days' | '14days' | '30days' | 'safe';
};
