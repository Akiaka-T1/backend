export function scoreByEmotions (words: string[], relatedWords: any[], emotionScores: {
    joy: number;
    sadness: number;
    anger: number;
    irritation: number;
    fear: number
}) {
    words.forEach(word => {
        relatedWords.forEach((emotionObject, index) => {
            if (emotionObject[word]) {
                switch (index) {
                    case 0:
                        emotionScores.joy += emotionObject[word];
                        break;
                    case 1:
                        emotionScores.anger += emotionObject[word];
                        break;
                    case 2:
                        emotionScores.irritation += emotionObject[word];
                        break;
                    case 3:
                        emotionScores.fear += emotionObject[word];
                        break;
                    case 4:
                        emotionScores.sadness += emotionObject[word];
                        break;
                }
            }
        });
    });
}