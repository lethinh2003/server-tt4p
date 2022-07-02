const listUsersRandomWaiting = [];
const listUsersRandomInRoomChatting = [];
const listUsersBoyRandomWaiting = [];
const listUsersGirlRandomWaiting = [];
const listUsersLGBTRandomWaiting = [];
const getUsersWaitingRandom = () => {
  return {
    boy: listUsersBoyRandomWaiting.length,
    girl: listUsersGirlRandomWaiting.length,
    lgbt: listUsersLGBTRandomWaiting.length,
  };
};
const joinListUsersChatting = (user) => {
  if (checkIsInRoomChatting(user.account) === false) {
    console.log("KHÔI PHỤC: JOIN USER VÀO CHATTING ROOM ", user.account);
    listUsersRandomInRoomChatting.push(user);
    console.log("CHATTING ROOM ", listUsersRandomInRoomChatting);
  }
};
const joinListUsersRandom = (user) => {
  const findUser = findListUsers(user.account);
  if (findUser.length > 0) {
    return false;
  } else {
    //Push current user into list
    listUsersRandomWaiting.push(user);
    if (user.sex === "boy") {
      listUsersBoyRandomWaiting.push(user);
    } else if (user.sex === "girl") {
      listUsersGirlRandomWaiting.push(user);
    } else if (user.sex === "lgbt") {
      listUsersLGBTRandomWaiting.push(user);
    }
    console.log(listUsersRandomWaiting);

    return user;
  }
};
const findListUsers = (user) => {
  const result = listUsersRandomWaiting.filter((u) => user === u.account);
  return result;
};

const randomUserRandom = (currentUser) => {
  //Ensure that user aren't chatting in room.
  if (checkIsInRoomChatting(currentUser.account) === false) {
    //list users in waiting room (except current user)
    console.log("--------------------");
    console.log("listUsersRandomWaiting", listUsersRandomWaiting);
    console.log("--------------------");
    const listUsersInWaitingRoom = listUsersRandomWaiting.filter((user) => user.account !== currentUser.account);
    if (listUsersInWaitingRoom.length === 0) {
      return { status: "fail", message: "Hiện tại chưa có bạn nào tham gia vào, vui lòng thử lại sau nhé" };
    }
    //Random user in list users waiting
    const random = listUsersInWaitingRoom[Math.floor(Math.random() * listUsersInWaitingRoom.length)];
    //Check if (current user === random user && random user in chat room) then invoke randomUser function
    if (checkIsInRoomChatting(random.account) === false && currentUser.account !== random.account) {
      console.log("Đã tìm thấy bạn tâm sự mới: ", random);
      //Update info partner for current user and random user, then push in Room Chatting

      listUsersRandomInRoomChatting.push(currentUser);
      listUsersRandomInRoomChatting.push(random);
      console.log("LIST USER CHATTING ROOM", listUsersRandomInRoomChatting);
      //Remove random user from list users waiting according by sex
      if (random.sex === "boy") {
        const indexUser = listUsersBoyRandomWaiting.indexOf(random);
        listUsersBoyRandomWaiting.splice(indexUser, 1);
      } else if (random.sex === "girl") {
        const indexUser = listUsersGirlRandomWaiting.indexOf(random);
        listUsersGirlRandomWaiting.splice(indexUser, 1);
      } else if (random.sex === "lgbt") {
        const indexUser = listUsersLGBTRandomWaiting.indexOf(random);
        listUsersLGBTRandomWaiting.splice(indexUser, 1);
      }
      //Remove current user from list users waiting according by sex
      if (currentUser.sex === "boy") {
        const indexUser = listUsersBoyRandomWaiting.indexOf(currentUser);
        listUsersBoyRandomWaiting.splice(indexUser, 1);
      } else if (currentUser.sex === "girl") {
        const indexUser = listUsersGirlRandomWaiting.indexOf(currentUser);
        listUsersGirlRandomWaiting.splice(indexUser, 1);
      } else if (currentUser.sex === "lgbt") {
        const indexUser = listUsersLGBTRandomWaiting.indexOf(currentUser);
        listUsersLGBTRandomWaiting.splice(indexUser, 1);
      }
      // // Remove random user from list user waiting
      const indexRandomUser = listUsersRandomWaiting.indexOf(random);
      listUsersRandomWaiting.splice(indexRandomUser, 1);
      // // Remove current user from list user
      const indexCurrentUser = listUsersRandomWaiting.indexOf(currentUser);
      listUsersRandomWaiting.splice(indexCurrentUser, 1);

      return {
        status: "success",
        message: "Tìm bạn thành công: $name",
        user: currentUser,
        partner: random,
      };
    } else {
      return randomUserRandom(currentUser);
    }
  } else {
    console.log("list-room:", listUsersRandomInRoomChatting);
    console.log("Bạn đang trong phòng chat");
    return {
      status: "fail",
      message: "Bạn đang trong phòng chat, vui lòng thoát phòng hiện tại để tham gia phòng khác nhé!",
    };
  }
};
const findPartnerRandom = (currentUser) => {
  //Check user in list user
  const findUser = findListUsers(currentUser.account);
  if (findUser.length === 0) {
    return false;
  } else {
    return randomUserRandom(currentUser);
  }
};

const removeUserRandom = (user) => {
  console.log(`in room ${user.account} -> ${checkIsInRoomChatting(user.account)}`);
  if (checkIsInRoomChatting(user.account)) {
    const result = listUsersRandomInRoomChatting.filter((u) => user.account === u.account);

    if (result.length > 0) {
      const getIndexListUserRoom = listUsersRandomInRoomChatting.indexOf(result[0]);

      listUsersRandomInRoomChatting.splice(getIndexListUserRoom, 1);
    }
  }
  const getIndexList = listUsersRandomWaiting.indexOf(user);
  if (getIndexList != -1) {
    listUsersRandomWaiting.splice(getIndexList, 1);
  }
  if (user.sex === "boy") {
    const getIndexListUsers = listUsersBoyRandomWaiting.indexOf(user);
    if (getIndexListUsers != -1) {
      listUsersBoyRandomWaiting.splice(getIndexListUsers, 1);
    }
  } else if (user.sex === "girl") {
    const getIndexListUsers = listUsersGirlRandomWaiting.indexOf(user);
    if (getIndexListUsers != -1) {
      listUsersGirlRandomWaiting.splice(getIndexListUsers, 1);
    }
  } else if (user.sex === "lgbt") {
    const getIndexListUsers = listUsersLGBTRandomWaiting.indexOf(user);
    if (getIndexListUsers != -1) {
      listUsersLGBTRandomWaiting.splice(getIndexListUsers, 1);
    }
  }
};
const checkIsInRoomChatting = (account) => {
  const result = listUsersRandomInRoomChatting.filter((u) => account === u.account);
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
