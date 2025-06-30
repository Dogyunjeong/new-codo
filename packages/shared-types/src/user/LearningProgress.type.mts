import { WordDictionary } from '../langLearning/wordDictionary/WordDictionary.type.mjs';
import * as LanguageTypes from '../language/Language.type.mjs';
import { LearningNodeTypes } from '../index.mjs';

// export interface LearningPathProgress {
//   learningPathId: string;
//   completedNodes: {
//     learningNodeId: string;
//     completedAt: Date;
//     finishedSentenceBuildingAt?: Date;
//   }[];
//   completedAt?: Date;
// }

// export interface WordsToMemorize {
//   words: string[];
//   oneTimeMemorizedWords: string[];
//   secondTimeMemorizedWords: string[];
//   thirdTimeMemorizedWords: string[];
// }

// export type StoredWordDictionary = {
//   [K in LanguageTypes.SUPPORT_LOCALE]: WordDictionary[];
// };

export interface LearningNodeProgressBase {
  learningNodeId: string;
  startedAt: string;
  completedAt?: string;
  updatedAt?: string;
}

export interface SceneProgress {
  sceneId: string;
  startedAt: string;
  completedAt?: string;
  finishedReadAt?: string;
  finishedSentenceBuildingAt?: string;
  sentenceBuildingIndex?: number;
}

export interface LangEpisodeProgress extends LearningNodeProgressBase {
  sceneProgress: SceneProgress[];
}

export interface LearningNodeProgress extends LearningNodeProgressBase {
  sceneProgress?: SceneProgress[];
}

export interface LearningNodeLevelProgress {
  lastStudiedLearningNodeId?: string; // if this learning node is in completedLearningNodes, it means the user should study next learning node
  lastVisitedLearningNodeId?: string; // if this learning node is in completedLearningNodes, it means the user should study next learning node
  learningNodeProgress: Array<LearningNodeProgress>;
}
