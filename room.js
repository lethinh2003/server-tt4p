const listUsers = [];
const listUsersRoom = [];
const listUsersBoy = [];
const listUsersGirl = [];
const listUsersLGBT = [];
const getUsersWaiting = () => {
  return {
    boy: listUsersBoy.length,
    girl: listUsersGirl.length,
    lgbt: listUsersLGBT.length,
  };
};
const joinListUsers = (user) => {
  const findUser = findListUsers(user.account);

  if (findUser.length > 0) {
    return false;
  } else {
    //Push current user into list
    listUsers.push(user);
    if (user.sex === "boy") {
      listUsersBoy.push(user);
    } else if (user.sex === "girl") {
      listUsersGirl.push(user);
    } else if (user.sex === "lgbt") {
      listUsersLGBT.push(user);
    }

    return user;
  }
};
const findListUsers = (user) => {
  const result = listUsers.filter((u) => user === u.account);
  return result;
};
const randomUser = (currentUser) => {
  //Check user in chat room
  if (!checkIsInRoom(currentUser.account)) {
    if (currentUser.findSex === "boy") {
      const newData = listUsersBoy.filter(
        (item) => item.account !== currentUser.account && item.findSex === currentUser.sex
      );
      if (newData.length === 0) {
        return { status: "fail", message: "Hiện tại chưa có bạn nào tham gia vào, vui lòng thử lại sau nhé" };
      }
      //Random user boy in list user boy
      const random = newData[Math.floor(Math.random() * newData.length)];
      //Check if (current user === random user && random user in chat room) then invoke randomUser function
      if (!checkIsInRoom(random.account)) {
        console.log("Đã tìm thấy bạn tâm sự mới: ", random);
        //Update info partner for current user and random user
        let currentUserUpdate = { ...currentUser, partner: random.account };
        let randomUserUpdate = { ...random, partner: currentUser.account };
        listUsersRoom.push(currentUserUpdate);
        listUsersRoom.push(randomUserUpdate);
        //Remove random user from list user
        const indexRandom = listUsersBoy.indexOf(random);
        listUsersBoy.splice(indexRandom, 1);
        //Remove current user from list user according by sex
        if (currentUser.sex === "boy") {
          const indexUser = listUsersBoy.indexOf(currentUser);
          listUsersBoy.splice(indexUser, 1);
        } else if (currentUser.sex === "girl") {
          const indexUser = listUsersGirl.indexOf(currentUser);
          listUsersGirl.splice(indexUser, 1);
        } else if (currentUser.sex === "lgbt") {
          const indexUser = listUsersLGBT.indexOf(currentUser);
          listUsersLGBT.splice(indexUser, 1);
        }
        // Remove current user from list user
        const indexCurrentUser = listUsers.indexOf(currentUser);
        listUsers.splice(indexCurrentUser, 1);

        return {
          status: "success",
          message: "Tìm bạn thành công: $name",
          user: currentUser,
          partner: random,
        };
      } else {
        return randomUser(currentUser);
      }
    } else if (currentUser.findSex === "girl") {
      const newData = listUsersGirl.filter(
        (item) => item.account !== currentUser.account && item.findSex === currentUser.sex
      );
      if (newData.length === 0) {
        return { status: "fail", message: "Hiện tại chưa có bạn nào tham gia vào, vui lòng thử lại sau nhé" };
      }
      //Random user boy in list user boy
      const random = newData[Math.floor(Math.random() * newData.length)];
      //Check if (current user === random user && random user in chat room) then invoke randomUser function
      if (!checkIsInRoom(random.account)) {
        console.log("Đã tìm thấy bạn tâm sự mới: ", random);
        //Update info partner for current user and random user
        let currentUserUpdate = { ...currentUser, partner: random.account };
        let randomUserUpdate = { ...random, partner: currentUser.account };
        listUsersRoom.push(currentUserUpdate);
        listUsersRoom.push(randomUserUpdate);
        //Remove random user from list user
        const indexRandom = listUsersGirl.indexOf(random);
        listUsersGirl.splice(indexRandom, 1);
        //Remove current user from list user according by sex
        if (currentUser.sex === "boy") {
          const indexUser = listUsersBoy.indexOf(currentUser);
          listUsersBoy.splice(indexUser, 1);
        } else if (currentUser.sex === "girl") {
          const indexUser = listUsersGirl.indexOf(currentUser);
          listUsersGirl.splice(indexUser, 1);
        } else if (currentUser.sex === "lgbt") {
          const indexUser = listUsersLGBT.indexOf(currentUser);
          listUsersLGBT.splice(indexUser, 1);
        }
        // Remove current user from list user
        const indexCurrentUser = listUsers.indexOf(currentUser);
        listUsers.splice(indexCurrentUser, 1);

        return {
          status: "success",
          message: "Tìm bạn thành công: $name",
          user: currentUser,
          partner: random,
        };
      } else {
        return randomUser(currentUser);
      }
    } else if (currentUser.findSex === "lgbt") {
      const newData = listUsersLGBT.filter(
        (item) => item.account !== currentUser.account && item.findSex === currentUser.sex
      );
      if (newData.length === 0) {
        return { status: "fail", message: "Hiện tại chưa có bạn nào tham gia vào, vui lòng thử lại sau nhé" };
      }
      //Random user
      const random = newData[Math.floor(Math.random() * newData.length)];
      if (!checkIsInRoom(random.account)) {
        console.log("Đã tìm thấy bạn tâm sự mới: ", random);
        //Update info partner for current user and random user
        let currentUserUpdate = { ...currentUser, partner: random.account };
        let randomUserUpdate = { ...random, partner: currentUser.account };
        listUsersRoom.push(currentUserUpdate);
        listUsersRoom.push(randomUserUpdate);
        //Remove random user from list user
        const indexRandom = listUsersLGBT.indexOf(random);
        listUsersLGBT.splice(indexRandom, 1);
        //Remove current user from list user according by sex
        if (currentUser.sex === "boy") {
          const indexUser = listUsersBoy.indexOf(currentUser);
          listUsersBoy.splice(indexUser, 1);
        } else if (currentUser.sex === "girl") {
          const indexUser = listUsersGirl.indexOf(currentUser);
          listUsersGirl.splice(indexUser, 1);
        } else if (currentUser.sex === "lgbt") {
          const indexUser = listUsersLGBT.indexOf(currentUser);
          listUsersLGBT.splice(indexUser, 1);
        }
        // Remove current user from list user
        const indexCurrentUser = listUsers.indexOf(currentUser);
        listUsers.splice(indexCurrentUser, 1);

        return {
          status: "success",
          message: "Tìm bạn thành công: $name",
          user: currentUser,
          partner: random,
        };
      } else {
        return randomUser(currentUser);
      }
    }
  } else {
    console.log("list-room:", listUsersRoom);
    console.log("Bạn đang trong phòng chat");
    return {
      status: "fail",
      message: "Bạn đang trong phòng chat, vui lòng thoát phòng hiện tại để tham gia phòng khác nhé!",
    };
  }
};
const findPartner = (currentUser) => {
  //Check user in list user
  const findUser = findListUsers(currentUser.account);
  if (findUser.length === 0) {
    return false;
  } else {
    return randomUser(currentUser);
  }
};
const removeUser = (user) => {
  console.log(`in room ${user.account} -> ${checkIsInRoom(user.account)}`);
  if (checkIsInRoom(user.account)) {
    const result = listUsersRoom.filter((u) => user.account === u.account);

    if (result.length > 0) {
      const getIndexListUserRoom = listUsersRoom.indexOf(result[0]);

      listUsersRoom.splice(getIndexListUserRoom, 1);
    }
  }
  const getIndexList = listUsers.indexOf(user);
  if (getIndexList != -1) {
    listUsers.splice(getIndexList, 1);
  }
  if (user.sex === "boy") {
    const getIndexListUsers = listUsersBoy.indexOf(user);
    if (getIndexListUsers != -1) {
      listUsersBoy.splice(getIndexListUsers, 1);
    }
  } else if (user.sex === "girl") {
    const getIndexListUsers = listUsersGirl.indexOf(user);
    if (getIndexListUsers != -1) {
      listUsersGirl.splice(getIndexListUsers, 1);
    }
  } else if (user.sex === "lgbt") {
    const getIndexListUsers = listUsersLGBT.indexOf(user);
    if (getIndexListUsers != -1) {
      listUsersLGBT.splice(getIndexListUsers, 1);
    }
  }
  // console.log("listroom:", listUsersRoom);
  // console.log("list-user", listUsers);
  // console.log("boy", listUsersBoy);
  // console.log("girl", listUsersGirl);
  // console.log("lgbt", listUsersLGBT);
};
const checkIsInRoom = (account) => {
  const result = listUsersRoom.filter((u) => account === u.account);
  if (result.length === 0) {
    return false;
  }
  return true;
};
module.exports = {
  removeUser,
  joinListUsers,
  findListUsers,
  findPartner,
  getUsersWaiting,
};
