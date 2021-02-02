const chatForm = document.getElementById('chat-form');
const chatMessages = document.querySelector('.chat-messages');
const roomName = document.getElementById('room-name');
const userList = document.getElementById('users');

// Lấy các trường username và room trên url, sử dụng thư viện Qs
const { username, room } = Qs.parse(location.search, {
  ignoreQueryPrefix: true
});

const socket = io();

// Gửi yêu cầu tham gia phòng, cung cấp thông tin gửi lên bao gồm tên người dùng mới và phòng chát mà người dùng mới đó tham gia
socket.emit('joinRoom', { username, room });

// Sau khi được vào phòng thành công thì nhận thông tin gồm: Tên phòng và Các thành viên trong phòng đó
socket.on('roomUsers', ({ room, users }) => {
  outputRoomName(room); // Đổ tên phòng ra màn hình client
  outputUsers(users); // Đổ danh sách các thành viên ở trong phòng đó ra màn hình client
});

// Nhận tin nhắn từ server
socket.on('message', message => {
  console.log(message);
  outputMessage(message);

  // Scroll down
  chatMessages.scrollTop = chatMessages.scrollHeight;
});

// Submit tin nhắn
chatForm.addEventListener('submit', e => {
  e.preventDefault();

  //Lấy tin nhắn
  let msg = e.target.elements.msg.value;
  
  msg = msg.trim();
  
  if (!msg){
    return false;
  }

  // Gửi tin nhắn tới server
  socket.emit('chatMessage', msg);

  // Xóa trắng
  e.target.elements.msg.value = '';
  e.target.elements.msg.focus();
});

// Hiển thị tin nhắn ra ngoài DOM
function outputMessage(message) {
  const div = document.createElement('div');
  div.classList.add('message');
  const p = document.createElement('p');
  p.classList.add('meta');
  p.innerText = message.username;
  p.innerHTML += `<span>${message.time}</span>`;
  div.appendChild(p);
  const para = document.createElement('p');
  para.classList.add('text');
  para.innerText = message.text;
  div.appendChild(para);
  document.querySelector('.chat-messages').appendChild(div);
}

// Thêm tên phòng vào DOM
function outputRoomName(room) {
  roomName.innerText = room;
}

// Thêm tên người dùng vào DOM
function outputUsers(users) {
  userList.innerHTML = '';
  users.forEach(user=>{
    const li = document.createElement('li');
    li.innerText = user.username;
    userList.appendChild(li);
  });
 }
