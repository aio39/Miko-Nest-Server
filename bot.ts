import { nanoid } from 'nanoid';
import * as io from 'socket.io-client';

// in root
// ts-node bot

const BOT_NUM = 3;
const CONCERT_ID = 1;
const TICKET_ID = 1;
const SOCKET_URL = 'http://localhost:3002';

const CHAT_INTERVAL_BASE = 1000 * 20;
const SCORE_INTERVAL_BASE = 1000 * 0.7;

const aList = new Array(BOT_NUM).fill(0);
const socketList: io.Socket[] = [];

let roomId = nanoid();

aList.forEach((_, idx) => {
  console.log('socket num:', idx);
  const uniqueId = nanoid();
  const aSocket = io.io(SOCKET_URL, {
    autoConnect: true,
    transports: ['websocket'],
  });
  let score = 0;
  aSocket.emit(
    'fe-new-user-request-join',
    uniqueId,
    roomId, // 4명 마다 바뀜
    { id: idx + 100, uuid: uniqueId, name: uniqueId.slice(0, 6) },
    CONCERT_ID,
    TICKET_ID,
    idx + 100, // userTicketId
  );

  socketList.push(aSocket);

  setInterval(() => {
    aSocket.emit('fe-send-message', {
      sender: idx + 100,
      text: 'abcd' + Math.random(),
      timestamp: Date.now(),
    });
  }, CHAT_INTERVAL_BASE + Math.floor(Math.random() * 2000));

  setInterval(() => {
    const addedScore = Math.floor(Math.random() * 15);
    score += addedScore;
    console.log('score', uniqueId, score);
    aSocket.emit('fe-update-score', addedScore, score);
  }, SCORE_INTERVAL_BASE + Math.floor(Math.random() * 500));

  if (idx === 0 && idx % 4 === 0) {
    //  4명 마다 방 변경
    roomId = nanoid();
  }
});

console.log(aList);
