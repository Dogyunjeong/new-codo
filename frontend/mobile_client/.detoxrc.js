/** @type {Detox.DetoxConfig} */
module.exports = {
  testRunner: {
    args: {
      $0: 'jest',
      config: './e2e_test/detox/config/jest.config.js',
    },
    jest: {
      setupTimeout: 120000,
    },
  },
  apps: {
    'ios.debug': {
      type: 'ios.app',
      binaryPath: 'ios/build/Build/Products/Debug-iphonesimulator/mobile_client.app',
      build: 'xcodebuild -workspace ios/mobile_client.xcworkspace -scheme mobile_client -configuration Debug -sdk iphonesimulator -derivedDataPath ios/build',
    },
    'ios.release': {
      type: 'ios.app',
      binaryPath: 'ios/build/Build/Products/Release-iphonesimulator/mobile_client.app',
      build: 'xcodebuild -workspace ios/mobile_client.xcworkspace -scheme mobile_client -configuration Release -sdk iphonesimulator -derivedDataPath ios/build',
    },
    'android.debug': {
      type: 'android.apk',
      binaryPath: 'android/app/build/outputs/apk/debug/app-debug.apk',
      build: 'cd android && ./gradlew assembleDebug assembleAndroidTest -DtestBuildType=debug',
      reversePorts: [8081],
    },
    'android.release': {
      type: 'android.apk',
      binaryPath: 'android/app/build/outputs/apk/release/app-release.apk',
      build: 'cd android && ./gradlew assembleRelease assembleAndroidTest -DtestBuildType=release',
    },
  },
  devices: {
    'ios.simulator': {
      type: 'ios.simulator',
      device: {
        type: 'iPhone 15',
      },
    },
    'android.emulator': {
      type: 'android.emulator',
      device: {
        avdName: 'Pixel_5_API_33',
      },
    },
    'android.attached': {
      type: 'android.attached',
      device: {
        adbName: '.*',
      },
    },
  },
  configurations: {
    'ios': {
      device: 'ios.simulator',
      app: 'ios.debug',
    },
    'ios.release': {
      device: 'ios.simulator',
      app: 'ios.release',
    },
    'android': {
      device: 'android.emulator',
      app: 'android.debug',
    },
    'android.release': {
      device: 'android.emulator',
      app: 'android.release',
    },
  },
};