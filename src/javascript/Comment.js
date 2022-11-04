class Comment {
    constructor(comId, content, userId, recId, userName, img_link ) {
      this.comId = comId;
      this.content = content;
      this.userId = userId;
      this.recId = recId;
      this.userName = userName;
      this.reportMsg = "";
      this.reportPanel = false;
      this.img_link=img_link
    }
}

export default Comment