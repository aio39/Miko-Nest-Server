//  string인 경우는 UUID (PeerId === User.uuid)
// number는 자동 증가 BigInt

// 특정 콘서트(티켓)에 소속된 방마다 몇명의 유저가 들어 있는지
export const rkConTicketPublicRoom = (ticketId: number) =>
  `PublicRoom-${ticketId}`;

//  특정 콘서트(티켓)의 스코어 랭킹
//  user.name : score
export const rkConTicketScoreRanking = (ticketId: number) =>
  `ScoreRanking-${ticketId}`;

// 콘서트(티켓)마다 N분 마다 추가된 점수
export const rkConTicketAddedScoreForM = () => `TiCoAddedScoreForM`;

// 특정 Quiz(설문)의 각 항문에 대한 응답 횟수
export const rkQuiz = (quizId: number) => `Quiz-${quizId}`;
