import { FileTypes, LanguageTypes } from '@base/shared-types';

const TTS_SOUND_VERSION = {
  v1: 'v1', // first version haven't set specific gcp tts configs.
};

class GCSFilePathUtil {
  static makeWordSoundFilePath = ({ locale, word }: { locale: string; word: string }) => {
    return `word-sounds/${TTS_SOUND_VERSION.v1}/${locale}/${word}.mp3`;
  };

  private static _langEpisode = {
    createLearningPathFolderPath: ({
      learningPathId,
      locale,
    }: {
      learningPathId: string;
      locale: LanguageTypes.SUPPORT_LOCALE;
    }) => {
      return `lang-episodes-sounds/${TTS_SOUND_VERSION.v1}/${locale}/learning-path/${learningPathId}`;
    },
  };

  public static langEpisode = {
    createLearningPathFolderPath: ({
      learningPathId,
      locale,
    }: {
      learningPathId: string;
      locale: LanguageTypes.SUPPORT_LOCALE;
    }) => {
      return this._langEpisode.createLearningPathFolderPath({
        learningPathId,
        locale,
      });
    },
    createParagraphSoundPath: ({
      learningPathId,
      learningNodeId,
      shortFormSceneId,
      paragraphId,
      speakerId,
      locale,
    }: {
      learningPathId: string;
      locale: LanguageTypes.SUPPORT_LOCALE;
      learningNodeId: string;
      shortFormSceneId: string;
      paragraphId: string;
      speakerId: string;
    }) => {
      const learningPathFolderPath = this._langEpisode.createLearningPathFolderPath({
        learningPathId,
        locale,
      });
      return `${learningPathFolderPath}/learning-node/${learningNodeId}/short-form-scene/${shortFormSceneId}/paragraph/${paragraphId}/speaker/${speakerId}.mp3`;
    },
  };
}

export default GCSFilePathUtil;
