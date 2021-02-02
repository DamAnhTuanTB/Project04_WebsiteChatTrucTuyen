const users = [];

// Thêm một thành viên mới vào phòng chat
function userJoin(id, username, room) {
  const user = { id, username, room };

  users.push(user);

  return user;
}

// Lấy thông tin người dùng hiện tại
function getCurrentUser(id) {
  return users.find(user => user.id === id);
}

// Lấy thông tin người dùng rời chat
function userLeave(id) {
  const index = users.findIndex(user => user.id === id);

  if (index !== -1) {
    return users.splice(index, 1)[0];
  }
}

// Lấy toàn bộ thông tin người dùng trong phòng
function getRoomUsers(room) {
  return users.filter(user => user.room === room);
}

module.exports = {
  userJoin,
  getCurrentUser,
  userLeave,
  getRoomUsers
};
