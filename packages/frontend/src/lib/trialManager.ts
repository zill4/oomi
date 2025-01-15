const TRIAL_KEY = 'oomi_trial_count';
const MAX_TRIALS = 5;

export const trialManager = {
  getTrialCount: (): number => {
    return parseInt(localStorage.getItem(TRIAL_KEY) || '0');
  },

  incrementTrial: (): void => {
    const count = trialManager.getTrialCount();
    localStorage.setItem(TRIAL_KEY, (count + 1).toString());
  },

  hasTrialsRemaining: (): boolean => {
    return trialManager.getTrialCount() < MAX_TRIALS;
  },

  resetTrials: (): void => {
    localStorage.setItem(TRIAL_KEY, '0');
  }
}; 