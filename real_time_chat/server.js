const express = require('express');
const WebSocket = require('ws');

const app = express();

// 정적 파일을 제공하기 위한 미들웨어 설정
app.use(express.static('public'));

// WebSocket 서버 생성
const wss = new WebSocket.Server({ noServer: true });

// 접속된 사용자 수를 저장할 변수
let connectedUsers = 0;

// WebSocket 연결 이벤트 핸들러
wss.on('connection', (ws) => {
  ws.on('message', (message) => {
    const parsedMessage = JSON.parse(message);
    if (parsedMessage.type === 'enterChatRoom') {
      const username = parsedMessage.data;
      connectedUsers++;
      broadcastMessage({ type: 'userCount', data: connectedUsers });
      broadcastMessage({ type: 'chatMessage', data: `${username}님이 입장했습니다.` });
    } else if (parsedMessage.type === 'sendMessage') {
      const username = parsedMessage.data.username;
      const chatMessage = parsedMessage.data.message;
      const fullMessage = `${username}: ${chatMessage}`;
      broadcastMessage({ type: 'chatMessage', data: fullMessage });
    }
  });
  //나가기 
  ws.on('close', () => {
    connectedUsers--;
    broadcastMessage({ type: 'userCount', data: connectedUsers });
  });
});

// WebSocket 서버를 Express 서버와 연결
const server = app.listen(3000, () => {
  console.log('서버가 3000번 포트에서 실행 중입니다.');
});

// WebSocket 서버를 Express 서버와 같은 HTTP 서버로 만듦
server.on('upgrade', (request, socket, head) => {
  wss.handleUpgrade(request, socket, head, (socket) => {
    wss.emit('connection', socket, request);
  });
});

// 메시지를 모든 클라이언트에게 전송하는 함수
function broadcastMessage(message) {
  const stringifiedMessage = JSON.stringify(message);
  wss.clients.forEach((client) => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(stringifiedMessage);
    }
  });
}
