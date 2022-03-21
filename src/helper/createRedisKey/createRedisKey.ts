// 특정 콘서트에 소속된 방마다 몇명의 유저가 들어 있는지
export const rkConcertPublicRoom = (concertId: string) =>
  `PublicRoom${concertId}`;

//  특정 콘서트의 스코어 랭킹
export const rkConcertScoreRanking = (concertId: string) =>
  `ScoreRanking${concertId}`;

// 특정 Quiz(설문)의 각 항문에 대한 응답 횟수
export const rkQuiz = (quizId: string) => `Quiz${quizId}`;
