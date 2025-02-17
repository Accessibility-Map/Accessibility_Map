class CommentDTO {
    public commentID: number;
    public userID: number;
    public locationID: number;
    public userComment: string;
    public parentCommentID?: number;
    public replies?: CommentDTO[];
    public username?: string
    
    constructor(commentID: number, userID: number, locationID: number, userComment: string, parentCommentID?: number, replies?: CommentDTO[], username?: string) {
        this.commentID = commentID;
        this.userID = userID;
        this.locationID = locationID;
        this.userComment = userComment;
        this.parentCommentID = parentCommentID;
        this.replies = replies;
        this.username = username
    }
}

export default CommentDTO