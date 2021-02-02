const path = require('path');
const http = require('http');
const express = require('express');
const socketio = require('socket.io');
const formatMessage = require('./utils/messages');
const {
  userJoin,
  getCurrentUser,
  userLeave,
  getRoomUsers
} = require('./utils/users');

const app = express();
const server = http.createServer(app);
const io = socketio(server);

// Set static folder
app.use(express.static(path.join(__dirname, 'public')));

const botName = 'ChatCord Bot';

// Chạy khi client kết nối
io.on('connection', socket => {
  socket.on('joinRoom', ({ username, room }) => {
            // socket.id được tạo tự động trên server
    const user = userJoin(socket.id, username, room); // Mỗi một người dùng mới đều được tạo tự động một id riêng, Thêm người dùng mới vào mảng toàn bộ người dùng, sau đó trả về thông tin người dùng mới đó
    // Thêm người dùng mới có tên là biến username vào room có tên là biến room
    socket.join(user.room);

    // Chào mừng người dùng mới
    socket.emit('message', formatMessage(botName, 'Welcome to ChatCord!'));

    // Gửi tin nhắn thông báo có một người dùng mới tham gia tới tất cả mọi người trong nhóm của người dùng mới đó
    socket.broadcast
      .to(user.room)
      .emit(
        'message',
        formatMessage(botName, `${user.username} has joined the chat`) // định dạng lại tin nhắn trả về cho client
      );

    // Gửi cho người dùng mới các thông tin gồm: Tên phòng mà người dùng mới tham gia, Các thành viên đã có trong phòng đó
    io.to(user.room).emit('roomUsers', {
      room: user.room,
      users: getRoomUsers(user.room) // Lấy ra các thành viên cùng phòng mà người mới tham gia
    });
  });

  // Nhận chat từ client
  socket.on('chatMessage', msg => {
    const user = getCurrentUser(socket.id); // Lấy thông tin của người dùng vừa mới gửi tin nhắn
     // Khi người dùng mới gửi tin, thì gửi tin nhắn đó tới tất cả mọi người trong phòng mà người dùng mới đó ở
    io.to(user.room).emit('message', formatMessage(user.username, msg));
  });

  // Nhận sự kiện khi người dùng ngắt kết nối
  socket.on('disconnect', () => {
    const user = userLeave(socket.id); // Trả về thông tin người dùng vừa mới leave phòng chat
  
    if (user) {  // gửi thông tin tới các người dùng khác thông tin người vừa rời chat
      io.to(user.room).emit(
        'message',
        formatMessage(botName, `${user.username} has left the chat`)
      );

    
      io.to(user.room).emit('roomUsers', {
        room: user.room,
        users: getRoomUsers(user.room)
      });
    }
  });
});

const PORT = process.env.PORT || 3000;

server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
