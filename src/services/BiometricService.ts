import ReactNativeBiometrics from 'react-native-biometrics';

const rnBiometrics = new ReactNativeBiometrics();

export const BiometricService = {
  /**
   * Checks if biometric hardware is available and enrolled.
   */
  async isAvailable(): Promise<boolean> {
    try {
      const { available } = await rnBiometrics.isSensorAvailable();
      return available;
    } catch {
      return false;
    }
  },

  /**
   * Prompts the user for their fingerprint scan.
   * Returns true if authentication succeeded.
   */
  async authenticate(message = 'Scan fingerprint to authenticate'): Promise<boolean> {
    try {
      const available = await this.isAvailable();
      if (!available) return false;

      const { success } = await rnBiometrics.simplePrompt({
        promptMessage: message,
        cancelButtonText: 'Cancel',
      });
      return success;
    } catch {
      return false;
    }
  },
};

export default BiometricService;
