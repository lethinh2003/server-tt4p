const listUsersRandom = [];
const listUsersRoomRandom = [];
const listUsersBoyRandom = [];
const listUsersGirlRandom = [];
const listUsersLGBTRandom = [];
const getUsersWaitingRandom = () => {
  return {
    boy: listUsersBoyRandom.length,
    girl: listUsersGirlRandom.length,
    lgbt: listUsersLGBTRandom.length,
  };
};
const joinListUsersRandom = (user) => {
  const findUser = findListUsers(user.account);

  if (findUser.length > 0) {
    return false;
  } else {
    //Push current user into list
    listUsersRandom.push(user);
    if (user.sex === "boy") {
      listUsersBoyRandom.push(user);
    } else if (user.sex === "girl") {
      listUsersGirlRandom.push(user);
    } else if (user.sex === "lgbt") {
      listUsersLGBTRandom.push(user);
    }

    return user;
  }
};
const findListUsers = (user) => {
  const result = listUsersRandom.filter((u) => user === u.account);
  return result;
};

const randomUserRandom = (currentUser) => {
  //Check user in chat room
  if (checkIsInRoom(currentUser.account) === false) {
    //list users in room (except current user)
    const listUsersInRoom = listUsersRandom.filter((item) => item.account !== currentUser.account);
    if (listUsersInRoom.length === 0) {
      return { status: "fail", message: "Hiện tại chưa có bạn nào tham gia vào, vui lòng thử lại sau nhé" };
    }
    //Random user in list users
    const random = listUsersInRoom[Math.floor(Math.random() * listUsersInRoom.length)];
    //Check if (current user === random user && random user in chat room) then invoke randomUser function
    if (!checkIsInRoom(random.account)) {
      console.log("Đã tìm thấy bạn tâm sự mới: ", random);
      //Update info partner for current user and random user
      let currentUserUpdate = { ...currentUser, partner: random.account };
      let randomUserUpdate = { ...random, partner: currentUser.account };
      listUsersRoomRandom.push(currentUserUpdate);
      listUsersRoomRandom.push(randomUserUpdate);
      //Remove random user from list users according by sex
      if (random.sex === "boy") {
        const indexUser = listUsersBoyRandom.indexOf(random);
        listUsersBoyRandom.splice(indexUser, 1);
      } else if (random.sex === "girl") {
        const indexUser = listUsersGirlRandom.indexOf(random);
        listUsersGirlRandom.splice(indexUser, 1);
      } else if (random.sex === "lgbt") {
        const indexUser = listUsersLGBTRandom.indexOf(random);
        listUsersLGBTRandom.splice(indexUser, 1);
      }
      //Remove current user from list users according by sex
      if (currentUser.sex === "boy") {
        const indexUser = listUsersBoyRandom.indexOf(currentUser);
        listUsersBoyRandom.splice(indexUser, 1);
      } else if (currentUser.sex === "girl") {
        const indexUser = listUsersGirlRandom.indexOf(currentUser);
        listUsersGirlRandom.splice(indexUser, 1);
      } else if (currentUser.sex === "lgbt") {
        const indexUser = listUsersLGBTRandom.indexOf(currentUser);
        listUsersLGBTRandom.splice(indexUser, 1);
      }
      // // Remove random user from list user
      const indexRandomUser = listUsersRandom.indexOf(random);
      listUsersRandom.splice(indexRandomUser, 1);
      // // Remove current user from list user
      const indexCurrentUser = listUsersRandom.indexOf(currentUser);
      listUsersRandom.splice(indexCurrentUser, 1);

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
    console.log("list-room:", listUsersRoomRandom);
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
  console.log(`in room ${user.account} -> ${checkIsInRoom(user.account)}`);
  if (checkIsInRoom(user.account)) {
    const result = listUsersRoomRandom.filter((u) => user.account === u.account);

    if (result.length > 0) {
      const getIndexListUserRoom = listUsersRoomRandom.indexOf(result[0]);

      listUsersRoomRandom.splice(getIndexListUserRoom, 1);
    }
  }
  const getIndexList = listUsersRandom.indexOf(user);
  if (getIndexList != -1) {
    listUsersRandom.splice(getIndexList, 1);
  }
  if (user.sex === "boy") {
    const getIndexListUsers = listUsersBoyRandom.indexOf(user);
    if (getIndexListUsers != -1) {
      listUsersBoyRandom.splice(getIndexListUsers, 1);
    }
  } else if (user.sex === "girl") {
    const getIndexListUsers = listUsersGirlRandom.indexOf(user);
    if (getIndexListUsers != -1) {
      listUsersGirlRandom.splice(getIndexListUsers, 1);
    }
  } else if (user.sex === "lgbt") {
    const getIndexListUsers = listUsersLGBTRandom.indexOf(user);
    if (getIndexListUsers != -1) {
      listUsersLGBTRandom.splice(getIndexListUsers, 1);
    }
  }
};
const checkIsInRoom = (account) => {
  const result = listUsersRoomRandom.filter((u) => account === u.account);
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
};
