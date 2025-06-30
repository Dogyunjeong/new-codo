/**
 *  ONBOARDING_LANDING = { startingLearningDialogueId: string }
 */
export enum CustomSettingType {
  ONBOARDING_LANDING = 'ONBOARDING_LANDING',
}

export interface CustomSetting {
  _id: string;
  type: CustomSettingType;
  data?: {
    startingLearningDialogueId?: string;
  };
}

export interface CustomSettingCreate extends Omit<CustomSetting, '_id'> {}

export interface CustomSettingUpdate extends Partial<Pick<CustomSettingCreate, 'data'>> {}
