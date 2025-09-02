export interface RankMember {
    id: number,
    rankListId: number,
    parentId: number,
    createUserId: number,
    scoreSum: number,
    scoreCalculate: number,
    name: string,
    description: string,
    coverUrl: string,
    creator: number,
    creatorName: string,
    created_time: string
}
export interface RankList {
    id: number,
    title: String,
    description: String,
    coverUrl: String,
    agreeName: String,
    disagreeName: String,
    creator: number,

}

export interface VoteRecord {
    id: number,
    rankMemberId: number,
    voteCount: number,
    creator: number,
}