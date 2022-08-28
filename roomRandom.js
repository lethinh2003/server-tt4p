const ChatRoomRandom = require("./models/ChatRoomRandom");
var randomstring = require("randomstring");
const listUsersRandomWaiting = [];
const listUsersRandomInRoomChatting = [];
const listUsersBoyRandomWaiting = [];
const listUsersGirlRandomWaiting = [];
const listUsersLGBTRandomWaiting = [];

const usersWaiting = [];
const usersInRoom = [];
const getUsersWaitingRandom = () => {
  return {
    usersWaiting: usersWaiting.length,
    usersChatting: usersInRoom.length,
  };
};
const joinListUsersChatting = (user) => {
  if (checkIsInRoomChatting(user.account) === false) {
    console.log("KHÔI PHỤC: JOIN USER VÀO CHATTING ROOM ", user.account);
    listUsersRandomInRoomChatting.push(user);
    console.log("CHATTING ROOM ", listUsersRandomInRoomChatting);
  }
};
const joinListUsersRandom = async (user) => {
  const u = findUser(user.account, usersWaiting);
  console.log("SEARCH", u, usersWaiting);
  if (u.length > 0) {
    return false;
  } else {
    await ChatRoomRandom.findOneAndUpdate(
      {
        account: user._id,
      },
      {},
      {
        new: true,
        upsert: true,
      }
    );
    usersWaiting.push({
      account: user.account,
      _id: user._id,
    });

    return user;
  }
};
const findListUsers = (user) => {
  const result = listUsersRandomWaiting.filter((u) => user === u.account);
  return result;
};

const findUser = (user, listUsers) => {
  const result = listUsers.filter((u) => user === u.account);
  return result;
};

const randomUserRandom = (currentUser) => {
  //Ensure that user aren't chatting in room.
  if (checkIsChatting(currentUser.account, usersInRoom) === false) {
    //list users in waiting room (except current user)
    const listUsersInWaitingRoom = usersWaiting.filter((user) => user.account !== currentUser.account);
    if (listUsersInWaitingRoom.length === 0) {
      return { status: "fail", message: "Hiện tại chưa có bạn nào tham gia vào, vui lòng thử lại sau nhé" };
    }
    //Random user in list users waiting
    const random = listUsersInWaitingRoom[Math.floor(Math.random() * listUsersInWaitingRoom.length)];
    //Check if (current user === random user && random user in chat room) then invoke randomUser function
    if (checkIsChatting(random.account, usersInRoom) === false) {
      console.log("Đã tìm thấy bạn tâm sự mới: ", random);
      //Update info partner for current user and random user, then push in Room Chatting
      const room = new Date().getTime() + randomstring.generate(7);
      const currentUserBeforeUpdate = usersWaiting.find((item) => item.account === currentUser.account);
      const currentUserAfterUpdate = { ...currentUserBeforeUpdate, partner: random, room };
      const randomUserAfterUpdate = { ...random, partner: currentUserBeforeUpdate, room };
      usersInRoom.push(currentUserAfterUpdate);
      usersInRoom.push(randomUserAfterUpdate);
      console.log("LIST USER CHATTING ROOM", usersInRoom);
      // // Remove random user from list user waiting
      const indexRandomUser = usersWaiting.indexOf(random);
      usersWaiting.splice(indexRandomUser, 1);
      // // Remove current user from list user
      const indexCurrentUser = usersWaiting.indexOf(currentUser);
      usersWaiting.splice(indexCurrentUser, 1);

      return {
        status: "success",
        message: "Tìm bạn thành công: $name",
        user: currentUserAfterUpdate,
        room,
        partner: randomUserAfterUpdate,
      };
    } else {
      return randomUserRandom(currentUser);
    }
  } else {
    return {
      status: "fail",
      message: "Bạn đang trong phòng chat, vui lòng thoát phòng hiện tại để tham gia phòng khác nhé!",
    };
  }
};
const findPartnerRandom = (currentUser) => {
  //Check user in list user
  const u = findUser(currentUser.account, usersWaiting);
  if (u.length === 0) {
    return false;
  } else {
    return randomUserRandom(currentUser);
  }
};

const removeUserRandom = (user) => {
  if (checkIsChatting(user.account, usersInRoom)) {
    const foundUser = usersInRoom.find((u) => user.account === u.account);
    const getIndexListUserRoom = usersInRoom.indexOf(foundUser);
    usersInRoom.splice(getIndexListUserRoom, 1);
  }
  const foundUser = usersWaiting.find((item) => item.account === user.account);
  const getIndexList = usersWaiting.indexOf(foundUser);
  if (getIndexList != -1) {
    usersWaiting.splice(getIndexList, 1);
  }
};
const checkIsInRoomChatting = (account) => {
  const result = listUsersRandomInRoomChatting.filter((u) => account === u.account);
  if (result.length === 0) {
    return false;
  }
  return true;
};
const checkIsChatting = (account, listUsers) => {
  const result = listUsers.filter((u) => account === u.account);
  if (result.length === 0) {
    return false;
  }
  return true;
};
module.exports = {
  removeUserRandom,
  joinListUsersRandom,
  getUsersWaitingRandom,
  findPartnerRandom,
  joinListUsersChatting,
};
