import { ESP8266IntexSBH20, PLATFORM_NAME } from './homebridge/platform.js';

export default (api) => {
    api.registerPlatform(PLATFORM_NAME, ESP8266IntexSBH20);
};
